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

## PCB Model Attributions

The following PCB models are used in this project and are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0):

- "Simple Motherboard" by Rizki Achmad: https://skfb.ly/puYDn
- "MotherBoard + Components" by Daniel Cardona: https://skfb.ly/6RDsX
- "Rog Strix x370-f Motherboard" by MUSHROOM_BUILDS: https://skfb.ly/6ZqAY

License link for all three models:
- https://creativecommons.org/licenses/by/4.0/

## Educational Use Note

Any room or environment entered from a PCB component is conceptual and for educational purposes only.
It is not guaranteed to represent the real-world physical layout, spacing, or architecture of the actual hardware component.