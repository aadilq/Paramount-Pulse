from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import asyncio
from ingest.reddit_poller import poll_reddit
from ingest.youtube_poller import poll_youtube
from streams.consumer import consume_events
from websocket.manager import manager
from storage.elastic_client import get_es_client, query_by_release, query_by_source, query_by_time_range

async def run_poller(poll_fn, interval_seconds: int):
    while True:
        await poll_fn()
        await asyncio.sleep(interval_seconds)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[TEST] Scheduler is firing jobs!")
    task1 = asyncio.create_task(run_poller(poll_reddit, 900))
    task2 = asyncio.create_task(run_poller(poll_youtube, 7200))
    task3 = asyncio.create_task(consume_events())
    yield
    task1.cancel()
    task2.cancel()
    task3.cancel()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
async def get_aggregates(release: str = None):
    es = get_es_client()
    query = {"match": {"release": release}} if release else {"match_all": {}}
    response = await es.search(index="paramount_events", query=query, size=0, aggs={
        "by_sentiment": {"terms": {"field": "sentiment"}}
    })
    buckets = response["aggregations"]["by_sentiment"]["buckets"]
    return {b["key"]: b["doc_count"] for b in buckets}


