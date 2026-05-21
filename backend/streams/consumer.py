import asyncio
import json
import traceback
from streams.redis_client import get_redis_client, STREAM_NAME
from sentiment.analyzer import analyze_batch
from storage.elastic_client import get_es_client, create_index, index_event
from websocket.manager import manager

GROUP_NAME = "sentiment-workers"
CONSUMER_NAME = "consumer-1"

async def create_consumer_group(client):
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
                        await manager.broadcast(event)
                        await client.xack(STREAM_NAME, GROUP_NAME, message_id)
        except Exception as e:
            print(f"[CONSUMER ERROR]: {e}")
            traceback.print_exc()
            await asyncio.sleep(2)



