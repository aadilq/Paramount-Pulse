from fastapi import FastAPI
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from ingest.reddit_poller import poll_reddit

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(poll_reddit, "interval", minutes=15, next_run_time=datetime.now(timezone.utc))
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_index():
    return {"message": "Hello, FastAPI!"}


