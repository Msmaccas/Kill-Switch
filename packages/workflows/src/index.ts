import type { Provider } from '../../providers/src/index';
import type { ProviderResult, Event, BoardItem } from '../../core/src/types';
// Import implementations from compiled modules.  Type declarations are
// imported from the source files via type‑only imports to aid
// development, while runtime imports use the compiled JavaScript.
import { loadTheses, loadEvents, addEvent } from '../../data/dist/index.js';
import { evaluateThesis, buildBoardItem } from '../../core/dist/index.js';
import { validateEvent } from '../../core/dist/validators.js';

/**
 * Ingest events from a list of providers. Each provider is expected to
 * return a ProviderResult containing an array of events. Only events
 * with state OK will be added to the local store. Returns the
 * number of events ingested.
 */
export async function ingestProviderEvents(providers: Provider<Event[]>[]): Promise<number> {
  let count = 0;
  for (const provider of providers) {
    const result: ProviderResult<Event[]> = await provider.fetch();
    if (result.state === 'OK') {
      for (const ev of result.value) {
        try {
          validateEvent(ev);
          await addEvent(ev);
          count++;
        } catch (err) {
          // skip invalid event, degrade
          continue;
        }
      }
    }
  }
  return count;
}

/**
 * Evaluate all stored theses against all stored events and return a
 * board of their statuses. The board does not persist; callers may
 * choose to persist board snapshots separately.
 */
export async function evaluateBoard(): Promise<BoardItem[]> {
  const theses = await loadTheses();
  const events = await loadEvents();
  const now = new Date();
  const board: BoardItem[] = [];
  for (const thesis of theses) {
    const driftEvents = evaluateThesis(thesis, events);
    const item = buildBoardItem(thesis, driftEvents, now);
    board.push(item);
  }
  return board;
}

/**
 * Run ingestion and evaluation in sequence. This helper fetches events
 * from providers, stores them, then builds a board. It returns the
 * resulting board along with the number of new events ingested.
 */
export async function runOnce(providers: Provider<Event[]>[]): Promise<{ ingested: number; board: BoardItem[] }> {
  const ingested = await ingestProviderEvents(providers);
  const board = await evaluateBoard();
  return { ingested, board };
}

export type { BoardItem } from '../../core/src/types';