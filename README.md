# Paramount Pulse


A live listening social tool that tracks audience sentiments in real time by aggregating mentions, reviews, and reactions from Reddit/Youtube around Paramount Movies and TV show releases allowing us to see what the different reactions are surrounding Paramount Releases. 


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

**Data Flow Diagram**
---
<img width="728" height="736" alt="Screenshot 2026-05-19 at 7 24 16 PM" src="https://github.com/user-attachments/assets/f052918d-3480-4c09-a7ec-ec0419efc257" />


**Figma Designs**
---
<img width="692" height="453" alt="Screenshot 2026-05-19 at 7 36 44 PM" src="https://github.com/user-attachments/assets/49d9dd20-f170-49de-a1e7-54535f13fb66" />

<img width="692" height="453" alt="Screenshot 2026-05-19 at 2 47 40 PM" src="https://github.com/user-attachments/assets/f816f13a-ff66-4d5e-8d34-18b26cb14b8e" />

<img width="692" height="453" alt="Screenshot 2026-05-19 at 7 40 06 PM" src="https://github.com/user-attachments/assets/021f9153-84c2-4f0f-9509-52ec0e475963" />



