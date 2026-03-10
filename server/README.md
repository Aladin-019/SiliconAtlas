# SiliconAtlas API (server)

SQLite database and Express API. Frontend will use this for "top N newest" and search.

## Setup

```bash
cd server
npm install
```

## Init DB and seed

- **Init DB** (creates `data/siliconatlas.db` and tables):  
  `npm run init-db`

- **Seed** (fetches CPUs/GPUs from Compute Specs DB and inserts):  
  `npm run seed`

## Run server

```bash
npm start
```

Runs at http://localhost:3001. Right now only `GET /api/health` exists. Next steps: add routes for top N and search, then point the frontend proxy at this server.
