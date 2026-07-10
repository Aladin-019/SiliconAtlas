**SiliconAtlas** — Compare computer hardware with real data and interactive visualizations across various computer chips. You can also dive into first person 3D PCB model exploration.

**Stack:**
- Frontend: TypeScript, React, Vite, D3, ML-PCA
   - 3D PCB Explorer: Three.js, `@react-three/fiber`, `@react-three/drei`
- Backend: Express, SQLite via `better-sqlite3`
- Testing: Vitest, JSDOM

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

## Testing

Frontend tests use Vitest with JSDOM and Testing Library:

```bash
npm test
npm run test:run
```

Backend tests also use Vitest:

```bash
cd server && npm test
cd server && npm run test:run
```