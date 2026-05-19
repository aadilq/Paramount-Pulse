import asyncio
import json
import traceback
import redis.asyncio as aioredis
from streams.redis_client import get_redis_client, STREAM_NAME
from sentiment.analyzer import analyze_batch
from storage.elastic_client import get_es_client, create_index, index_event

GROUP_NAME = "sentiment-workers"
CONSUMER_NAME = "consumer-1"
DEAD_LETTER_STREAM = "paramount:events:dead"
MAX_RETRIES = 3
PENDING_TIMEOUT_MS = 3000

async def create_consumer_group(client: aioredis.Redis):
    try:
        await client.xgroup_create(STREAM_NAME, GROUP_NAME, id=0, mkstream=True)
        print(f"[CONSUMER] Created consumer group '{GROUP_NAME}'")
    except Exception as e:
        if "BUSYGROUP" in str(e):
            print(f"[CONSUMER] Consumer group '{GROUP_NAME}' already exists")
        else:
            raise

async def check_dead_letters(client: aioredis.Redis):
    pending = await client.xpending_range(STREAM_NAME, GROUP_NAME, min="-", max="+", count=10, idle=PENDING_TIMEOUT_MS)

    for msg in pending:
        message_id = msg["message_id"]
        delivery_count = msg["times_delivered"]

        if delivery_count > MAX_RETRIES:
            claimed = await client.xclaim(
                STREAM_NAME, GROUP_NAME, CONSUMER_NAME, min_idle_time=PENDING_TIMEOUT_MS, message_ids=[message_id]
            )
            for claimed_id, data in claimed:
                await client.xadd(DEAD_LETTER_STREAM, {
                    "original_id": claimed_id,
                    "data": data.get("data", ""),
                    "delivery_count": str(delivery_count)
                })
                await client.xack(STREAM_NAME, GROUP_NAME, claimed_id)
                print(f"[DEAD LETTER] Moved message {claimed_id} after {delivery_count} retries")

async def consume_events():
    client = await get_redis_client()
    await create_consumer_group(client)

    try:
        es = get_es_client()
        info = await es.info()
        print(f"[ES] Connected to cluster: {info['cluster_name']}")
        await create_index(es)
    except Exception as e:
        print(f"[CONSUMER] ElasticSearch init failed: {e}")
        traceback.print_exc()
        es = None

    print(f"[CONSUMER] Listening on stream '{STREAM_NAME}'...")
    iteration = 0
    while True:
        try:
            results = await client.xreadgroup(GROUP_NAME, CONSUMER_NAME, {STREAM_NAME: ">"}, count=10, block=5000)

            if results:
                for stream, messages in results:
                    batch = []
                    for message_id, data in messages:
                        event = json.loads(data["data"])
                        batch.append((message_id, event))
                    texts = [event["text"] for _, event in batch]
                    sentiments = await asyncio.to_thread(analyze_batch, texts)
                    for (message_id, event), sentiment in zip(batch, sentiments):
                        event["sentiment"] = sentiment["label"]
                        event["sentiment_score"] = sentiment["score"]
                        print(f"[SENTIMENT] {event['source']} | {event['release']} | {sentiment['label']} ({sentiment['score']}) | {event['title'][:50]}")
                        if es:
                            await index_event(es, event)
                        await client.xack(STREAM_NAME, GROUP_NAME, message_id)
            iteration += 1
            if iteration % 20 == 0:
                await check_dead_letters(client)
        except Exception as e:
            print(f"[CONSUMER ERROR]: {e}")
            traceback.print_exc()
            await asyncio.sleep(2)



