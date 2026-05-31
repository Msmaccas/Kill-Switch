import { runOnce } from '../../workflows/dist/index.js';
import { FixtureEventProvider, PriceEventGenerator } from '../../providers/dist/index.js';
import type { Provider } from '../../providers/src/index';
import type { Event } from '../../core/src/types';
import { saveBoardReport, generateBoardReport } from '../../reports/dist/index.js';
import path from 'path';

// Parse provider configuration from environment variables. Users may
// specify a comma separated list of fixture paths in PROVIDER_FIXTURES
// and optionally synthetic price changes in PRICE_CHANGES (comma
// separated percentages) for symbol PRICE_SYMBOL.
function buildProviders(): Provider<Event[]>[] {
  const providers: Provider<Event[]>[] = [];
  const fixtures = process.env.PROVIDER_FIXTURES;
  if (fixtures) {
    for (const p of fixtures.split(',')) {
      const trimmed = p.trim();
      if (trimmed) providers.push(new FixtureEventProvider(trimmed));
    }
  }
  const priceChangesEnv = process.env.PRICE_CHANGES;
  if (priceChangesEnv) {
    const symbol = process.env.PRICE_SYMBOL || 'XYZ';
    const changes = priceChangesEnv.split(',').map((c) => parseFloat(c));
    providers.push(new PriceEventGenerator(changes, symbol));
  }
  return providers;
}

async function main() {
  const intervalSec = parseInt(process.env.WORKER_INTERVAL_SECONDS || '60', 10);
  const reportDir = process.env.REPORT_DIR || path.join(process.cwd(), 'reports');
  const providers = buildProviders();
  async function tick() {
    const { ingested, board } = await runOnce(providers);
    const stamp = new Date().toISOString().replace(/[:\.]/g, '-');
    await saveBoardReport(board, reportDir, `board-${stamp}`);
    // eslint-disable-next-line no-console
    console.log(`Worker: ingested ${ingested} events. Board:`);
    // eslint-disable-next-line no-console
    console.log(generateBoardReport(board));
  }
  // initial run
  await tick();
  setInterval(tick, intervalSec * 1000);
}

// Only run when executed directly, not when imported.
if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}