**SiliconAtlas** — Compare computer hardware with real data and D3 visualizations (parallel coordinates, PCA, etc)

**Stack:** TypeScript, React, Vite, D3. Backend: Express, SQLite (`server/`).

## Setup

```bash
npm install
cd server && npm install && cd ..
```

Seed the database once (fetches from Compute Specs DB into local SQLite):

```bash
cd server && npm run seed && cd ..
```

## Run the app

You need **two processes** (e.g. two terminals):

1. **Backend** (API + DB):
   ```bash
   cd server && npm start
   ```
   Runs at http://localhost:3001.

2. **Frontend** (Vite dev server):
   ```bash
   npm run dev
   ```
   Opens at http://localhost:5173. The app proxies `/api` to the backend.

**Testing:**