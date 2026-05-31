import { Thesis, Event, DriftEvent, BreakSeverity, BoardItem } from './types';
/**
 * Create a new thesis with sensible defaults. This function
 * automatically assigns a UUID and timestamps. It performs minimal
 * validation such as ensuring reviewCadenceDays and horizonDays are
 * positive numbers. Further validation should be handled upstream.
 */
export declare function createThesis(params: Omit<Thesis, 'id' | 'createdAt' | 'lastReviewedAt'>): Thesis;
/**
 * Evaluate a thesis against a set of events and return a list of
 * drift events. The simple heuristics implemented here are
 * deliberately interpretable: large negative price moves cause
 * soft/hard breaks, while explicit negative news attributes cause
 * soft breaks and fraud flags cause hard breaks. This function does
 * not modify the thesis itself.
 */
export declare function evaluateThesis(thesis: Thesis, events: Event[]): DriftEvent[];
/** Determine the maximum severity among a set of drift events. */
export declare function maxSeverity(events: DriftEvent[]): BreakSeverity;
/** Compute whether a thesis is due for review. */
export declare function isReviewDue(thesis: Thesis, now: Date): boolean;
/**
 * Build a board item summarising the current status of a thesis given
 * drift events and the current time. This function does not persist
 * changes; it merely produces a snapshot for presentation. The
 * severity is the maximum among events; notes summarise each event.
 */
export declare function buildBoardItem(thesis: Thesis, driftEvents: DriftEvent[], now: Date): BoardItem;
export type { Thesis, Event, DriftEvent, BoardItem, BreakSeverity } from './types';
export { validateThesis, validateEvent } from './validators';
