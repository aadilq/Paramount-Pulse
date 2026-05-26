# Paramount Pulse

 A live listening social tool that tracks audience sentiments in real time by aggregating mentions, reviews, and reactions from various news articles and Youtube around Paramount Movies/TV show releases, allowing us to see what the different reactions are surrounding Paramount Releases. Reactions are then tunneled into a sentiment breakdown of Positive, Neutral, and Negative. 


## Tech Stack

**Tech Stack:** FastAPI, Redis Streams, ElasticSearch, HuggingFace, React

>**React**: Utilized to create our dashboard which will render sentiment charts, filters, and live
feed. The FastAPI web-socket will push live updates to the React Frontend. 

>**FastAPI**: Act as background workers that poll Reddit/Youtube on schedule e.g. every 15 minutes. 

>**FastAPI**: Will also act as Web-socket, providing a persistent, two-way communication channel between our client and the server over a single, long-lived connection, sending data instantly at any time. 

>**Redis Streams**: Producer (your Reddit/YouTube pollers) will fetch a comment or post and push that as a raw event onto the Redis Stream. Redis just holds the queue of events in order. Nothing is processed here. Events sit there until something reads them. Acts as a failsafe handoff point. 

>**HuggingFace**:  Consumes events from the Redis stream and runs it through HuggingFace, Attaches the score and writes to ElasticSearch. 

>**ElasticSearch**: Acts as a high powered NoSQL Database that will allow us to query to answer questions like ‘*What's the sentiment breakdown for Mission Impossible 8 over the last 7 days?’.* It handles it handles full-text search, time-range queries.

>**Docker**: All of the services will be orchestrated via docker-compose.

## Features

- Sentiment Breakdown with ASCII bars
- Live Feed from Youtube/Various News Articles
- TMDB metadata panel (Movie Poster, Release Date, etc)

**Data Flow Diagram**
---
<img width="728" height="736" alt="Screenshot 2026-05-19 at 7 24 16 PM" src="frontend/paramount-pulse-frontend/src/assets/paramountpulsedataflow.png" />


**Figma Designs**
---
<img width="692" height="453" alt="Screenshot 2026-05-19 at 7 36 44 PM" src="https://github.com/user-attachments/assets/49d9dd20-f170-49de-a1e7-54535f13fb66" />

<img width="692" height="453" alt="Screenshot 2026-05-19 at 2 47 40 PM" src="https://github.com/user-attachments/assets/f816f13a-ff66-4d5e-8d34-18b26cb14b8e" />

<img width="692" height="453" alt="Screenshot 2026-05-19 at 7 40 06 PM" src="https://github.com/user-attachments/assets/021f9153-84c2-4f0f-9509-52ec0e475963" />


## Run Locally

Clone the project

```bash
  git clone https://github.com/aadilq/Paramount-Pulse.git
```

Swap all occurrences of https://api.paramountpulse.fyi to run locally

```bash
  https://api.paramountpulse.fyi → http://localhost:8000
  wss://api.paramountpulse.fyi/ws → ws://localhost:8000/ws
```

Create .env and fill in: NEWSAPI_KEY, TMDB_API_KEY, etc.

```bash
  touch .env
```

Run docker to start all the pollers

```bash
  docker compose up -d
```

Install dependencies in the frontend
```bash
  npm install
```

Run the frontend
```bash
  npm run dev
```


## Authors

- [@AadilQ](https://github.com/aadilq)


## Acknowledgements

 - [Claude](https://platform.claude.com/login?returnTo=%2F%3F)

Anthropic's Claude was my coding assistant throughout this project and was critical in guiding me throughout the various phases, from creating a build roadmap to clarifying various topics that I was not sure about such as Redis Streams and Websockets, It was really helpful!
