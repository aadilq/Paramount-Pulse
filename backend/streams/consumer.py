import asyncio
import json
import redis.asyncio as aioredis
from streams.redis_client import get_redis_client, STREAM_NAME

GROUP_NAME = "sentiment-workers"
CONSUMER_NAME = "consumer-1"

async def create_consumer_group(client: aioredis.Redis):
    try:
        await client.xgroup_create(STREAM_NAME, GROUP_NAME, id=0, mkstream=True)
        print(f"[CONSUMER] Created consumer group '{GROUP_NAME}'")
    except Exception as e:
        if "BUSYGROUP" in str(e):
            print(f"[CONSUMER] Consumer group '{GROUP_NAME}' already exists")
        else:
            raise
async def consume_events():
    client = await get_redis_client()
    await create_consumer_group(client)

    print(f"[CONSUMER] Listening on stream '{STREAM_NAME}'...")
    while True:
        results = await client.xreadgroup(GROUP_NAME, CONSUMER_NAME, {STREAM_NAME: ">"}, count=10, block=5000)

        if results:
            for stream, messages in results:
                for message_id, data in messages:
                    event = json.loads(data["data"])
                    print(f"[CONSUMER] {event['source']} | {event['release']} | {event['title'][:60]}")
                    await client.xack(STREAM_NAME, GROUP_NAME, message_id)


