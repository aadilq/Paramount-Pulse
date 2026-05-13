import asyncio
from datetime import datetime, timezone
from googleapiclient.discovery import build
import os

RELEASES = [
      "Mission Impossible",
      "Sonic the Hedgehog",
      "Transformers One",
      "Top Gun Maverick",
  ]


def fetch_videos(query: str, api_key: str) -> list[dict]:
    youtube = build("youtube", "v3", developerKey=api_key)
    response = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        order="date",
        maxResults=10,
    ).execute()

    videos = []

    for item in response.get("items", []):
        snippet = item["snippet"]
        videos.append({
            "id": item["id"]["videoId"],
            "title": snippet["title"],
            "description": snippet.get("description", ""),
            "channel": snippet["channelTitle"],
            "published_at": snippet["publishedAt"],
            "source": "youtube",
            "release": query,
        })
    return videos

async def poll_youtube():
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        print("[YOUTUBE ERROR] YOUTUBE_API_KEY not set")
        return
    
    print(f"[{datetime.now(timezone.utc)}] Starting Youtube poll...")
    for release in RELEASES:
        try:
            videos = await asyncio.to_thread(fetch_videos, release, api_key)
            for video in videos:
                print(f"[YOUTUBE] {video['release']} | {video['channel']} | {video['title'][:80]}")
        except Exception as e:
            print(f"[YOUTUBE ERROR] {release}: {e}")
        await asyncio.sleep(1)
    print(f"[{datetime.now(timezone.utc)}] Youtube poll complete")
    


