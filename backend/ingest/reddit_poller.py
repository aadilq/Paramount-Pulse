import httpx
import asyncio
from datetime import datetime, timezone
from streams.redis_client import get_redis_client, publish_event


HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
  }

RELEASES = [
    "Mission: Impossible - The Final Reckoning",
    "Sonic the Hedgehog",
    "Transformers One",
    "Top Gun Maverick",
]

SUBREDDITS = ["movies", "boxoffice", "television"]

async def fetch_posts(query: str, subreddit: str) -> list[dict]:
    url = f"https://old.reddit.com/r/{subreddit}/search.json"
    params = {"q": query, "sort": "new", "limit": 10, "restrict_sr": "true"}

    async with httpx.AsyncClient(headers=HEADERS) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    posts = []
    for post in data["data"]["children"]:
        p = post["data"]
        posts.append({
            "id": p["id"],
            "source": "reddit",
            "release": query,
            "title": p["title"],
            "text" : p.get("selftext", "") or p["title"],
            "author": f"r/{p['subreddit']}",
            "url": p["url"],
            "timestamp": datetime.fromtimestamp(p["created_utc"], tz=timezone.utc).isoformat()
        })
    return posts


async def poll_reddit():
    try:
        print(f"[{datetime.now(timezone.utc)}] Starting Reddit poll...")
        client = await get_redis_client()
        for release in RELEASES:
            for subreddit in SUBREDDITS:
                try:
                    posts = await fetch_posts(release, subreddit)
                    for post in posts:
                        await publish_event(client, post)
                        print(f"[REDDIT] {post['release']} | {post['author']} | {post['title'][:80]}")
                except Exception as e:
                    print(f"[REDDIT ERROR] {release} / {post['author']}: {e}")
                await asyncio.sleep(2)
        print(f"[{datetime.now(timezone.utc)}] Reddit poll complete.")
    except Exception as e:
        print(f"[REDDIT FATAL ERROR]: {e}")
    
        