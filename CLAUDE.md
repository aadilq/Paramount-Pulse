# Real-Time Audience Sentiment Dashboard

A live social listening tool that aggregates mentions, reviews, and reactions from Reddit and YouTube around Paramount releases, processes them through sentiment analysis, and displays results on a live React dashboard.

---

## Project Goal

Track audience sentiment for Paramount releases in real time by ingesting social data, running NLP sentiment scoring, persisting results, and surfacing them through a live-updating dashboard.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React | Live-updating dashboard with charts |
| Backend | FastAPI | API server + background polling workers + WebSocket |
| Message Queue | Redis Streams | Kafka stand-in — same mental model, easier setup |
| Sentiment ML | HuggingFace Transformers | Pre-trained model, no training required |
| Search / Storage | ElasticSearch | Persist and query sentiment over time |
| Containerization | Docker | All services orchestrated via docker-compose |

---

## Data Sources

| Source | Library / API | Status |
|---|---|---|
| Reddit | PRAW (Python Reddit API Wrapper) | Ready to use |
| YouTube | YouTube Data API v3 | Ready to use |
| X/Twitter | — | Skipped (API is paywalled) |

---

## Architecture

```
Reddit (PRAW) ──┐
                ├──► FastAPI polling workers ──► Redis Streams ──► Sentiment consumer ──► ElasticSearch
YouTube API ───┘                                                                                │
                                                                                                ▼
                                                                React Dashboard ◄── WebSocket (FastAPI)
```

**Flow:**
1. FastAPI background workers poll Reddit/YouTube on a schedule
2. Raw posts/comments are pushed into Redis Streams as events
3. A consumer reads the stream, runs HuggingFace sentiment scoring
4. Tagged results are written to ElasticSearch
5. FastAPI WebSocket pushes live updates to the React frontend
6. React dashboard renders sentiment charts, filters, and live feed

---

## Sentiment Model

Using a pre-trained model from HuggingFace — no ML training required:

```python
from transformers import pipeline
sentiment = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")
result = sentiment("This movie was incredible!")
# → [{'label': 'POSITIVE', 'score': 0.98}]
```

---

## Build Roadmap

- **Phase 1 — Project Foundation**
  - [✅] 1.1 Scaffold directory structure + docker-compose skeleton
  - [✅] 1.2 Stand up Redis + ElasticSearch containers (health checks passing)
  - [✅] 1.3 Bare FastAPI app running in Docker

- **Phase 2 — Data Ingestion**
  - [✅] 2.1 Reddit poller via Direct HTTP request (fetch posts/comments, print to console)
  - [✅] 2.2 YouTube poller via Data API (fetch comments/search results, print to console)
  - [✅] 2.3 Normalize both sources into a shared event schema

- **Phase 3 — Streaming Pipeline**
  - [✅] 3.1 Redis Streams producer (ingest workers write events to stream)
  - [✅] 3.2 Redis Streams consumer (reads events, logs them)
  - [✅] 3.3 Dead-letter handling for failed messages

- **Phase 4 — Sentiment Analysis**
  - [✅] 4.1 HuggingFace pipeline wrapper (`cardiffnlp/twitter-roberta-base-sentiment`)
  - [✅] 4.2 Consumer runs scoring and attaches label + confidence score to each event
  - [✅] 4.3 Batch processing support for bursts of data

- **Phase 5 — Storage & Search**
  - [✅] 5.1 ElasticSearch index mappings (release, source, score, timestamp)
  - [✅] 5.2 Write scored events to ES from consumer
  - [✅] 5.3 Query helpers (by release title, by source, by time range)

- **Phase 6 — Real-Time Backend**
  - [✅] 6.1 WebSocket endpoint in FastAPI
  - [✅] 6.2 Broadcast live events to connected clients
  - [✅] 6.3 REST endpoints for historical data queries (charts, aggregates)

- **Phase 7 — React Dashboard**
  - [✅] 7.1 Project setup + `useWebSocket` hook
  - [✅] 7.2 Live feed component
  - [ ] 7.3 Sentiment over time chart (Recharts)
  - [ ] 7.4 Filters (by release, source, date range)

## Project Structure

```
paramount-sentiment-dashboard/
├── docker.compose.yml
├── CLAUDE.md
├── backend/
│   └── dockerfile
├── frontend/
│   └── dockerfile
└── helpers/
    ├── sentiment/        # HuggingFace pipeline wrapper
    └── storage/          # ElasticSearch read/write helpers
```

---

## Developer Context

- **React**: experienced
- **FastAPI**: experienced
- **Docker**: experienced
- **Redis Streams**: new — conceptually similar to Kafka, easier to start with
- **HuggingFace / ML**: new — using pre-trained pipeline only, no model training

---

## Key Decisions Log

| Decision | Rationale |
|---|---|
| Redis Streams over Kafka | Simpler setup; same mental model means easy future swap |
| Redis Streams over APScheduler/asyncio.Queue | Persistent, closer to Kafka paradigm |
| Skip X/Twitter | API is paywalled; Reddit + YouTube cover enough signal |
| Pre-trained HuggingFace model | No ML experience needed; `cardiffnlp/twitter-roberta-base-sentiment` works well for social text |
| ElasticSearch for storage | Enables full-text search, time-range queries, and aggregations on sentiment data |

---
