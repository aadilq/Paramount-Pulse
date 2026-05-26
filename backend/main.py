from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import asyncio
from ingest.news_poller import poll_news
from ingest.youtube_poller import poll_youtube
from streams.consumer import consume_events
from websocket.manager import manager
from storage.elastic_client import get_es_client, query_by_release, query_by_source, query_by_time_range
import httpx
import os

async def run_poller(poll_fn, interval_seconds: int):
    while True:
        await poll_fn()
        await asyncio.sleep(interval_seconds)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[TEST] Scheduler is firing jobs!")
    task1 = asyncio.create_task(run_poller(poll_news, 10800))
    task2 = asyncio.create_task(run_poller(poll_youtube, 7200))
    task3 = asyncio.create_task(consume_events())
    yield
    task1.cancel()
    task2.cancel()
    task3.cancel()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://paramountpulse.fyi"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_index():
    return {"message": "Hello, FastAPI!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        es = get_es_client()
        recent = await query_by_time_range(es, "now-7d", size=50)
        for event in reversed(recent):
            await websocket.send_json(event)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/events")
async def get_events(release: str = None, source: str = None, gte: str = None, size: int = 50):
    es = get_es_client()
    if release:
        return await query_by_release(es, release, size)
    if source:
        return await query_by_source(es, source, size)
    if gte:
        return await query_by_time_range(es, gte, size=size)
    return await query_by_time_range(es, "now-7d", size=size)

@app.get("/events/aggregates")
async def get_aggregates(release: str = None, source: str = None, gte: str = None):
    es = get_es_client()
    must = []
    if release:
        must.append({"match": {"release": release}})
    if source:
        must.append({"term": {"source": source}})
    if gte:
        must.append({"range": {"timestamp": {"gte": gte}}})
    query = {"bool": {"must": must}} if must else {"match_all": {}}
    response = await es.search(index="paramount_events", query=query, size=0, aggs={
        "by_sentiment": {"terms": {"field": "sentiment"}}
    })
    buckets = response["aggregations"]["by_sentiment"]["buckets"]
    return {b["key"]: b["doc_count"] for b in buckets}


TV_SHOWS = {"Dutton Ranch", "Landman", "The Madison"}

@app.get("/tmdb")
async def get_tmdb(title: str):
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TMDB_API_KEY was not set")

    is_tv = title in TV_SHOWS
    async with httpx.AsyncClient() as client:
        if is_tv:
            response = await client.get("https://api.themoviedb.org/3/search/tv", params={"api_key": api_key, "query": title})
            response.raise_for_status()
            results = response.json().get("results", [])
        else:
            response = await client.get("https://api.themoviedb.org/3/search/movie", params={"api_key": api_key, "query": title})
            response.raise_for_status()
            results = response.json().get("results", [])
            if not results:
                response = await client.get("https://api.themoviedb.org/3/search/tv", params={"api_key": api_key, "query": title})
                response.raise_for_status()
                results = response.json().get("results", [])

        if not results:
            raise HTTPException(status_code=404, detail=f"no TMDB results found for {title}")
        r = results[0]

        return {
            "title":        r.get("title") or r.get("name"),
            "overview":     r.get("overview"),
            "poster_path":  r.get("poster_path"),
            "release_date": r.get("release_date") or r.get("first_air_date"),
            "rating":       r.get("vote_average"),
            "vote_count":   r.get("vote_count"),
        }