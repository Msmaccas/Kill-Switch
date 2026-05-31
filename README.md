# KillSwitch

KillSwitch is a thesis memory and invalidation engine designed for active traders and portfolio managers.  It does **not** execute trades or make recommendations.  Instead, it helps you define investment theses, track the evidence supporting them and warn you when your own reasoning may be drifting or invalidated.

This project is a TypeScript monorepo using npm workspaces.  The core domain logic lives in `packages/core`, persistence is handled by `packages/data`, providers fetch price and event data from fixtures in `packages/providers`, workflows implement kill‑switch logic in `packages/workflows`, and the API server and background worker live in `packages/server` and `packages/worker` respectively.  Detailed installation and usage instructions are in **AGENTS.md**.  A high‑level product definition is in **PRODUCT.md** and a step‑by‑step demonstration is provided in **DEMO.md**.

## Quick start (development)

1. Install dependencies using the package lock to ensure reproducible builds:

   ```bash
   npm ci
   ```

2. Build all packages:

   ```bash
   npm run build
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Generate a smoke test run:

   ```bash
   npm run smoke
   ```

5. Start the API server (after building):

   ```bash
   PORT=3099 npm start
   ```

The server exposes a health endpoint at `/health` and simple REST endpoints for managing theses and retrieving the active kill‑switch board.

## Repository structure

This monorepo follows the layout specified in the project requirements.  Packages are under `packages/*`.  Test data lives in `fixtures/`.  Documentation can be found in `docs/` and `research/`.

For CI configuration see `.github/workflows/ci.yml`.  To check repository hygiene, run `npm run hygiene`.