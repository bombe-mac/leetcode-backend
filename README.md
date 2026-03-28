# LeetCode Backend with websockets

## Overview

This project demonstrates a basic messaging queue system using **Redis + Express + Worker** architecture. It simulates how platforms like LeetCode handle code submissions asynchronously.

## Architecture

```
Client → Express API → Redis Queue → Worker → Redis Pub/Sub → WebSocket Server → Client
```

### Flow

1. Client submits code via `POST /submit`
2. Express generates a `submission_id` and pushes the job into a Redis queue (`LPUSH`)
3. Client connects via WebSocket and registers the `submission_id`
4. Worker picks up the job using a blocking pop (`BRPOP`)
5. Worker processes the job and publishes the result to a Redis Pub/Sub channel (`result:<submission_id>`)
6. WebSocket server, subscribed to all result channels, receives the message and pushes it to the correct browser client

## Tech Stack

- **Node.js** — Runtime
- **Express** — HTTP API server
- **Redis** — Job queue (`LPUSH`/`BRPOP`) + result delivery (`Pub/Sub`)
- **ws** — WebSocket server for real-time result push
- **Docker** — Running Redis locally
- **uuid** — Unique job ID generation

## Setup

### 1. Start Redis

```bash
docker run --name my-redis -d -p 6379:6379 redis
```

### 2. Install dependencies

```bash
npm install express redis ws uuid
```

### 3. Start the API + WebSocket server

```bash
node index.js
```

### 4. Start one or more workers

```bash
node worker.js        # terminal 1
node worker.js        # terminal 2 (optional, Redis load-balances automatically)
```

## Scaling Notes

- Multiple workers can run simultaneously — Redis `BRPOP` ensures each job is consumed by exactly one worker.
- Multiple WebSocket server instances are supported as long as all instances subscribe to Redis Pub/Sub (each will receive every `PUBLISH` and only the one holding the matching WebSocket will respond).
- The in-memory `clientMap` is per-process — behind a load balancer, ensure sticky sessions for WebSocket connections, or migrate `clientMap` to a Redis hash.

NOTE- In practice leetcode uses polling not websockets
