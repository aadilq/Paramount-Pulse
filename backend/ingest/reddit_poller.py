import httpx
import asyncio
from datetime import datetime, timezone


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
            "title": p["title"],
            "text": p.get("selftext", ""),
            "subreddit": p["subreddit"],
            "upvotes": p["score"],
            "url": p["url"],
            "created_utc": p["created_utc"],
            "source": "reddit", 
            "release": query,
        })
    return posts


async def poll_reddit():
    print(f"[{datetime.now(timezone.utc)}] Starting Reddit poll...")
    for release in RELEASES:
        for subreddit in SUBREDDITS:
            try:
                posts = await fetch_posts(release, subreddit)
                for post in posts:
                    print(f"[REDDIT] {post['release']} | r/{post['subreddit']} | {post['title'][:80]}")
            except Exception as e:
                print(f"[REDDIT ERROR] {release} / r/{subreddit}: {e}")
            await asyncio.sleep(2)
    print(f"[{datetime.now(timezone.utc)}] Reddit poll complete.")
    
        