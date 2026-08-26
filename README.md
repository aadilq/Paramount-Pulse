# Paramount Pulse

 A live listening social tool that tracks audience sentiments in real time by aggregating mentions, reviews, and reactions from various news articles and Youtube around Paramount Movies/TV show releases, allowing us to see what the different reactions are surrounding Paramount Releases. Reactions are then tunneled into a sentiment breakdown of Positive, Neutral, and Negative. 

## Phase 1 - Project Foundation

### 1.1

The main project directory is split into two folders, backend and frontend. the backend folder takes of the whole pipeline from Data ingestion to setting up the websockets whereas the frontend folders handles everything that the user sees. 

We also set up a docker compose file that defines each service as a container with its own build context (Redis and ElasticSearch being the exception because they use pre-built images). Docker compose also has a built-in name server. It puts all of the containers on the same network and lets them find each other by their service name. 

### 1.2

We run Redis and ElasticSearch as pre-built container images.

For Redis, we pull the offical redis:7.2 image from docker hub and initialize a healthcheck to ask Redis if it is working fine. If Redis answers back in a good way, Docker marks the container as healthy. We use the Redis command line interface to send a 'ping' to the redis server. If the server is working, it reply back with 'pong'. We run this check every 10s, waiting 5s for a reply back, doing it for 5 times. 

Same thing for ElasticSearch, we pull the official elasticsearch:8.13.0 image from docker hub and initialize a healthcheck. Every few seconds, docker will run a silent internal curl command curl to ask Elasticsearch: "Are you ready yet?". It specifically hits the built-in URL: http://localhost:9200/_cluster/health. We use grep to search for either "status: green" or "status: yellow", which means that the data is safe and searchable. 

## Phase 1 - Project Foundation

### 2.1

The first poller that we set up for data ingestion is for the News API (API designed for searching and retrieving live articles from all over the web)

---------------------------------------------

```fetch_articles```

We first set up an asynchronous function `fetch_articles` that handles getting the data from News API. It takes in a query (this case is a Paramount release) and api key. With that we set up the parameters to specify the specific data we're trying to get back. 


Then, we initialize a HTTP GET request to the NewsAPI endpoint to fetch all articles based on parameters that we had defined above, the most important parameters being the actual query itself and api key. 

We convert the `response` that got back into a useable dictionary so that we can easily work with it and access the data inside. 

We initialize an empty list and go through each article in our data. To the list, we append various information about each article, such as the title, text, author, etc. 

---------------------------------------------

```poll_news```

The second function that we set up is going to fetch all of the article information for each release. We establish a connection to the redis client, go through each release in RELEASES, call the fetch_articles function passing in the release and api_key. with each article that we get back, quickly write to the stream.

### 2.2

The second poller that we set up for data ingestion is for the Youtube API, finding videos, channels, or playlists matching specific keywords.

---------------------------------------------

```fetch_videos```

The helper function ```fetch_videos``` takes in a query and api_key, connecting our script to Youtube (A Google Service). We then query YouTube's database to return a list of videos matching our specific search parameters. we go through each video that we got back in our response, capturing information such as the video id, title, text. 

---------------------------------------------

```poll_youtube```

                videos = await asyncio.to_thread(fetch_videos, release, api_key)
the function ```poll_youtube``` retrieves our youtube api_key and opens a connection to Redis. After that, it goes through each release in releases, runs our function ```fetch_videos``` in a separate background thread so that our main program does not freeze. once we get back the list of video, we write to stream using another helper function ```publish_event```


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

