import redis.asyncio as aioredis
import json
import os

STREAM_NAME = "paramount:events"

async def get_redis_client():
    return aioredis.Redis(
        host=os.getenv("REDIS_HOST", "my-redis"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        password=os.getenv("REDIS_PASSWORD"),
        decode_responses=True,
    )

async def publish_event(client: aioredis.Redis, event: dict):
    await client.xadd(STREAM_NAME, {"data": json.dumps(event)})