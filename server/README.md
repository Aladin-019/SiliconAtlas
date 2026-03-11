# SiliconAtlas API (server)

TypeScript + Express + SQLite. The frontend proxies `/api` to this server for processors (and later search).

## Setup

```bash
cd server
npm install
```

From project root, install dev deps so server TypeScript is type-checked:

```bash
npm install
```

## Seed the DB

Fetches CPUs/GPUs from Compute Specs DB and writes to `server/data/siliconatlas.db` (creates DB and tables if needed):

```bash
cd server
npm run seed
```

## Run server

```bash
cd server
npm start
```

Runs at http://localhost:3001. Endpoints: `GET /api/health`, `GET /api/processors?limit=N`.