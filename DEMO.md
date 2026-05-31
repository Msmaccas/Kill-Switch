# KillSwitch Demonstration

This document walks you through a reproducible demonstration of KillSwitch on a fresh clone.  The demo proves that the system can capture user‑defined theses, ingest evidence, detect drift, raise soft and hard breaks and produce a ranked board and reports.

## Prerequisites

* Node.js 18 or 20 (see `.github/workflows/ci.yml` for supported versions).
* No existing `node_modules` or compiled artefacts in the working directory.

## Steps

1. **Install and build**

   ```bash
   npm ci
   npm run build
   ```

   This installs all dependencies and compiles the TypeScript source into the `dist/` directories for each package.

2. **Run the smoke script**

   ```bash
   npm run smoke
   ```

   The smoke script performs the following actions:

   * Resets the data store under `data/`.
   * Creates three sample theses: one with a 10 % price drop kill condition, one with a 20 % kill condition and one with a 50 % kill condition.
   * Injects three synthetic price events: a −8 % drop, a −25 % drop and a +5 % rise.
   * Evaluates the board.  The first thesis experiences a **soft break** (the −8 % drop exceeds half of its 10 % threshold).  The second thesis experiences a **hard break** (the −25 % drop breaches its 20 % threshold).  The third thesis remains active.
   * Writes a report into `fixtures/golden/smoke-board.json` and `fixtures/golden/smoke-board.txt`.
   * Prints a short summary of the board to the console.

   You should see output similar to the following:

   ```text
   Smoke test board:
   <thesis1-id> [setup] severity=SOFT review=OK notes=Price dropped -8.0%, approaching threshold of -10.0%
   <thesis2-id> [catalyst] severity=HARD review=OK notes=Price dropped -25.0%, breaching hard threshold of -20.0%
   <thesis3-id> [macro] severity=NONE review=OK notes=
   ```

   The exact thesis IDs are randomly generated UUIDs and will differ on each run.

3. **Start the API server**

   ```bash
   PORT=3099 npm start
   ```

   The server exposes endpoints for reading and creating theses and for retrieving the current board.  You can test them with `curl`:

   ```bash
   curl http://localhost:3099/health
   curl http://localhost:3099/api/theses
   curl http://localhost:3099/api/board
   ```

4. **Run the worker** (optional)

   To continuously ingest events from fixtures or synthetic generators and update the board at a fixed interval, run the worker:

   ```bash
   PROVIDER_FIXTURES="fixtures/raw/events.json" WORKER_INTERVAL_SECONDS=60 REPORT_DIR=reports node packages/worker/dist/index.js
   ```

   The worker prints a board summary every minute and writes timestamped reports into `reports/`.

## Notes

* The demonstration uses deterministic synthetic events.  In a real deployment you would configure providers to fetch live price data, news or filings and map kill conditions accordingly.
* KillSwitch does not execute trades.  It merely surfaces evidence when your pre‑defined reasoning is challenged.
* You can modify the theses and events in `fixtures/raw/` and re‑run the smoke script to explore different scenarios.