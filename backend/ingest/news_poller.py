import httpx
import asyncio
import hashlib
from datetime import datetime, timezone
from streams.redis_client import get_redis_client, publish_event
import os


RELEASES = [
    "Mission: Impossible - The Final Reckoning",
    "Street Fighter",
    "Dutton Ranch",
    "Transformers One",
    "Top Gun Maverick",
    "Landman",
    "Gladiator II",
    "The Madison",
    "Roofman",
    "The Running Man"
]

async def fetch_articles(query: str, api_key: str) -> list[dict]:
    params = {
        "q": f'"{query}"',
        "apiKey": api_key,
        "language": "en", 
        "sortBy": "publishedAt",
        "pageSize": 10,
    }
    ## asynchronous HTTP GET request to the NewsAPI endpoint to fetch articles based on parameters you define, such as keywords or dates.
    async with httpx.AsyncClient() as client:
        response = await client.get("https://newsapi.org/v2/everything", params=params)
        response.raise_for_status()
        data = response.json()
        print("DATA")
        print("============================")
        print(f"[NEWS] {query} → status: {data.get('status')}")
        print(f"[NEWS] {query} → totalResults: {data.get('totalResults')}")
        print("============================")


        articles = []
        for article in data.get("articles", []):
            title = article.get("title") or ""
            if not title or title == "[Removed]":
                continue
            ## generates a unique 16-character hexadecimal string from the article url
            article_id = hashlib.md5(article["url"].encode()).hexdigest()[:16]
            articles.append({
                "id": article_id,
                "source": "news",
                "release": query,
                "title": title,
                "text": article.get("description") or article.get("content") or title,
                "author": article.get("source", {}).get("name", "Unknown"),
                "url": article["url"],
                "timestamp": article["publishedAt"],
            })
        return articles
    
async def poll_news():
    try:
        api_key = os.getenv("NEWSAPI_KEY")
        if not api_key:
            print("[NEWS ERROR] NEWSAPI_KEY not set")
            return
        print(f"[{datetime.now(timezone.utc)}] Starting News poll...")
        client = await get_redis_client()
        for release in RELEASES:
            try:
                articles = await fetch_articles(release, api_key)
                for article in articles:
                    await publish_event(client, article)
                    print(f"[NEWS] {article['release']} | {article['author']} | {article['title'][:80]}")
            except Exception as e:
                print(f"[NEWS ERROR] {release}: {e}")
            await asyncio.sleep(1)
    except Exception as e:
        print(f"[NEWS FATAL ERROR]: {e}")




