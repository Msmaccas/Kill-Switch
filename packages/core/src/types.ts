/**
 * This module defines the core domain types used by the KillSwitch
 * platform. Each type uses explicit states and fields to avoid
 * implicit undefined behaviour. Wherever data is collected from an
 * external provider the result is wrapped in a ProviderResult which
 * captures metadata about the source, timestamps, confidence and
 * downgraded state.
 */

export type ExplicitState =
  | 'UNKNOWN'
  | 'NOT_AVAILABLE'
  | 'LOW_CONFIDENCE'
  | 'MANUAL_REVIEW'
  | 'OK';

/**
 * Provider result wraps a payload of type T with metadata about
 * provenance, timestamps and data quality. Every provider in the
 * system should return data using this structure.
 */
export interface ProviderResult<T> {
  /**
   * The name of the provider producing this result. For example
   * "FixtureProvider" or "PriceFeed".
   */
  provider: string;
  /**
   * The underlying data source. This could be a dataset name, API
   * endpoint or file path.
   */
  source: string;
  /** ISO 8601 timestamp representing when the provider claims the
   * data was generated or retrieved from upstream. */
  providerTimestamp: string;
  /** Timestamp when the system received this result. */
  receivedTimestamp: string;
  /** A numeric measure of confidence between 0 (no confidence) and 1
   * (high confidence) assigned by the provider. */
  confidence: number;
  /** An explicit state describing the provider's view of data quality. */
  state: ExplicitState;
  /** Human-readable warnings explaining any potential issues. */
  warnings?: string[];
  /** Version of the provider's output schema. */
  schemaVersion: string;
  /** Reason why data might be missing, if applicable. */
  missingDataReason?: string;
  /** References to external evidence used to produce this result. */
  evidenceRefs?: string[];
  /** The actual value produced by the provider. */
  value: T;
}

/** Types of theses supported by the system. */
export type ThesisType = 'setup' | 'catalyst' | 'business' | 'macro';

/** A thesis describes why a position exists. */
export interface Thesis {
  id: string;
  type: ThesisType;
  description: string;
  /**
   * List of explicit supports underpinning the thesis. These should
   * capture the primary reasons why the thesis holds. For example
   * "group leadership continues" or "earnings momentum accelerating".
   */
  supports: string[];
  /**
   * Conditions under which the thesis should be invalidated. Each
   * condition should be phrased explicitly. For example
   * "price breaks X moving average" or "regulatory approval denied".
   */
  killConditions: string[];
  /** Days between reviews. */
  reviewCadenceDays: number;
  /** Expected holding horizon expressed in days. */
  horizonDays: number;
  /** Creation timestamp. */
  createdAt: string;
  /** Timestamp when the thesis was last reviewed. */
  lastReviewedAt: string;
}

/** Event types produced by providers. */
export type EventType = 'price' | 'news' | 'filing' | 'custom';

/** An event represents incoming data that may impact a thesis. */
export interface Event {
  id: string;
  type: EventType;
  description: string;
  timestamp: string;
  /** Additional attributes specific to the event type. */
  attributes: Record<string, unknown>;
}

/** Severity of a drift or break event. */
export type BreakSeverity = 'NONE' | 'SOFT' | 'HARD';

/** A drift event is produced when evidence challenges a thesis. */
export interface DriftEvent {
  thesisId: string;
  severity: BreakSeverity;
  message: string;
  timestamp: string;
}

/**
 * BoardItem represents the user-facing status of a thesis. It includes
 * whether review is due and the severity of any outstanding drift.
 */
export interface BoardItem {
  thesis: Thesis;
  severity: BreakSeverity;
  lastUpdate: string;
  notes: string;
  reviewDue: boolean;
}