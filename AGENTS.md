# KillSwitch – Agents, workflow and operating instructions

KillSwitch uses a **multi‑agent team** to normalise user‑defined investment theses, track supporting evidence, detect contradictions and surface drift or hard break conditions.  The system is designed to run continuously in the background.  It **does not execute trades or make investment recommendations**.  Its sole purpose is to enforce explanation discipline and help human operators review and, if necessary, invalidate their own reasoning.

## Agent roles

| Agent | Responsibilities |
|------|-----------------|
| **Thesis normaliser** | Validates raw thesis inputs, ensures mandatory fields (supports, kill conditions, review cadence, horizon) are present, assigns a stable ID and prepares a canonical thesis object. |
| **Evidence tracker** | Collects price, event and filing data from providers and stores them as ledger items.  Produces `ProviderResult` structures with explicit states (`OK`, `UNKNOWN`, `NOT_AVAILABLE`, `MANUAL_REVIEW`, `LOW_CONFIDENCE`). |
| **Contradiction detector** | Compares incoming evidence against each thesis’s support and kill conditions.  Generates `drift_event` entities when supports are weakening and flags `hard_break` or `soft_break` events when kill conditions are met. |
| **Market‑structure analyst** | Monitors broader market context, such as group leadership and breadth, and annotates evidence with regime information to help interpret drift or break events. |
| **Sceptic** | Challenges the current state of each thesis by looking for disconfirming evidence and produces `self_deception_warning` when the evidence base becomes biased or stale. |
| **Chair** | Consolidates reports from all other agents, ranks active theses by severity (normal, soft break, hard break) and schedules review meetings based on the defined cadence and time since last review. |

Each agent operates on deterministic rules defined in `packages/workflows`.  Agents never hallucinate new information or guess; they only operate on validated data from providers.

## Installation and build

These steps assume a clean clone of the repository and no pre‑existing `node_modules` or build artefacts.

1. **Install dependencies**

   ```bash
   npm ci
   ```

2. **Build all packages**

   ```bash
   npm run build
   ```

   Under the hood, this runs the TypeScript compiler locally for each workspace package and emits compiled JavaScript into `dist/` folders.  Only compiled code is used at runtime.

3. **Run tests**

   ```bash
   npm test
   ```

   Tests cover domain validation, provider failure handling, workflow degradation logic, explicit state propagation, API contract and smoke‑test stability.

4. **Run the smoke path**

   ```bash
   npm run smoke
   ```

   The smoke script constructs at least three sample theses, injects deterministic evidence from fixtures, runs the workflow to produce drift and break events, and generates a report under `fixtures/golden/`.  One thesis will hit a **soft break** and another a **hard break** to prove that the system escalates conditions correctly.

5. **Start the server**

   ```bash
   PORT=3099 npm start
   ```

   The server listens on the port specified by the `PORT` environment variable (default 3099) and exposes:

   * `GET /health` – returns `{ status: "ok" }`.
   * `GET /api/theses` – lists all stored theses.
   * `POST /api/theses` – creates a new thesis.  Expects a JSON body matching the thesis schema.
   * `GET /api/board` – returns the ranked board of active theses with their current state, time since last review, confidence decay and outstanding warnings.

6. **Run the worker daemon**

   The worker does not start automatically with the server.  To run it manually, set the appropriate environment variables (e.g. `PROVIDER_FIXTURES`, `PRICE_CHANGES`, `WORKER_INTERVAL_SECONDS`) and execute the compiled worker script:

   ```bash
   PROVIDER_FIXTURES="fixtures/raw/events.json" WORKER_INTERVAL_SECONDS=60 node packages/worker/dist/index.js
   ```

   The worker ingests events from configured providers, updates the ledger and board, and writes board reports to the directory specified by `REPORT_DIR` (default `reports`).  It prints a summary to stdout after each run.

## Hygiene and done criteria

To ensure repository hygiene and reproducible builds, run the hygiene script at any time:

```bash
npm run hygiene
```

The script scans the repository for unwanted artefacts such as compiled files checked into source, secrets, temporary folders or undisclosed caches.  It fails with a non‑zero exit code if any issues are found.

### Done criteria

* The build passes with `npm ci` and `npm run build` from a clean clone.
* Unit tests and the smoke path pass with no random failures.
* `npm start` launches the compiled server and serves health and API endpoints without referencing TypeScript sources.
* No compiled output, `node_modules`, `.tsbuildinfo` or secrets are checked into the repository or included in the ZIP.
* Documentation reflects the actual implementation; features not implemented are clearly marked as limitations.
* The system does not execute trades or provide financial advice; it only monitors thesis integrity.

## Do‑not‑overclaim rules

* **No autonomous execution.**  KillSwitch will never place trades, rebalance portfolios, or decide exits.  It simply records and challenges reasoning.
* **No inference of sensitive information.**  Agents operate only on provided thesis objects and fixture data; they do not guess user intent or personal data.
* **No hallucinated facts.**  All evidence in reports is traceable to provider results or user‑supplied information.  When data is missing or low confidence, the system surfaces explicit states and downgrades output quality.
* **No hidden operations.**  All state changes and agent actions are logged and available through the board or ledger.  The system produces no silent alerts.
