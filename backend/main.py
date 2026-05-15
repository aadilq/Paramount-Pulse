from fastapi import FastAPI
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import asyncio
from ingest.reddit_poller import poll_reddit
from ingest.youtube_poller import poll_youtube
from streams.consumer import consume_events

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

@app.get("/")
def read_index():
    return {"message": "Hello, FastAPI!"}


