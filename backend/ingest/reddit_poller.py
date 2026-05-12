import httpx
import asyncio
from datetime import datetime, timezone


HEADER = {"User-Agent" : "paramount-sentiment-dashboard/1.0"}

RELEASES = [
    "Mission: Impossible - The Final Reckoning",
    "Sonic the Hedgehog",
    "Transformers One",
    "Top Gun Maverick",
]

SUBREDDITS = ["movies", "boxoffice", "television"]

async def fetch_posts(query: str, subreddit: str) -> list[dict]:
    url = f"https://www.reddit.com/r/{subreddit}/search.json"
    params = {"q": query, "sort": "new", "limit": 10, "restrict_sr": "true"}

    async with httpx.AsyncClient(headers=HEADER) as client:
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
            await asyncio.sleep(1)
    print(f"[{datetime.now(timezone.utc)}] Reddit poll complete.")
    
        