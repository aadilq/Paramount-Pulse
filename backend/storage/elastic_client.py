import os
from elasticsearch import AsyncElasticsearch

INDEX_NAME = "paramount_events"

_client = None

def get_es_client() -> AsyncElasticsearch:
    global _client
    if _client is None:
        _client = AsyncElasticsearch(
            hosts=["http://elasticsearch:9200"],
            basic_auth=("elastic", os.getenv("ELASTIC_PASSWORD")),
        )
    return _client

async def create_index(client: AsyncElasticsearch):
    exists = await client.indices.exists(index=INDEX_NAME)
    if not exists:
        await client.indices.create(index=INDEX_NAME, mappings={
            "properties": {
                "id":               {"type": "keyword"},
                "source":           {"type": "keyword"},
                "release":          {"type": "keyword"},
                "title":            {"type": "text"},
                "text":             {"type": "text"},
                "author":           {"type": "keyword"},
                "url":              {"type": "keyword"},
                "timestamp":        {"type": "date"},
                "sentiment":        {"type": "keyword"},
                "sentiment_score":  {"type": "float"}

            }
        })
        print(f"[ES] Created index '{INDEX_NAME}'")
    else:
        print(f"[ES] Index '{INDEX_NAME}' already exists")

async def index_event(client: AsyncElasticsearch, event: dict):
    await client.index(index=INDEX_NAME, id=event["id"], document=event)




async def query_by_release(client: AsyncElasticsearch, release: str, size: int = 50) -> list:
    response = await client.search(index=INDEX_NAME, query={
        "match": {"release": release}
    }, size=size, sort=[{"timestamp": "desc"}])
    return [hit["_source"] for hit in response["hits"]["hits"]]

async def query_by_source(client: AsyncElasticsearch, source: str, size: int = 50) -> list:
    response = await client.search(index=INDEX_NAME, query={
        "term": {"source": source}
    }, size=size, sort=[{"timestamp": "desc"}])
    return [hit["_source"] for hit in response["hits"]["hits"]]


async def query_by_time_range(client: AsyncElasticsearch, gte: str, lte: str = "now", size: int = 50) -> list:
    response = await client.search(index=INDEX_NAME, query={
        "range": {"timestamp": {"gte": gte, "lte": lte}}
    }, size=size, sort=[{"timestamp": "desc"}])
    return [hit["_source"] for hit in response["hits"]["hits"]]