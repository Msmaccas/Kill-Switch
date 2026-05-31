import { promises as fs } from 'fs';
import path from 'path';
import type { ProviderResult, Event } from '../../core/src/types';

/**
 * Base provider type. Providers fetch data and return it wrapped in a
 * ProviderResult with metadata. Providers must never throw; if
 * something goes wrong they return a LOW_CONFIDENCE or NOT_AVAILABLE
 * result with appropriate warnings.
 */
export interface Provider<T> {
  fetch(): Promise<ProviderResult<T>>;
}

/**
 * FixtureEventProvider loads events from a JSON fixture file. The
 * fixture should contain an array of events conforming to the Event
 * interface. The provider sets timestamps and warnings accordingly.
 */
export class FixtureEventProvider implements Provider<Event[]> {
  constructor(private filePath: string) {}

  async fetch(): Promise<ProviderResult<Event[]>> {
    const now = new Date();
    try {
      const absolutePath = path.isAbsolute(this.filePath)
        ? this.filePath
        : path.join(process.cwd(), this.filePath);
      let content: string;
      try {
        content = await fs.readFile(absolutePath, 'utf8');
      } catch (e: any) {
        const code = (e as NodeJS.ErrnoException).code;
        if (code === 'ENOENT') {
          return {
            provider: 'FixtureEventProvider',
            source: this.filePath,
            providerTimestamp: now.toISOString(),
            receivedTimestamp: now.toISOString(),
            confidence: 0,
            state: 'NOT_AVAILABLE',
            schemaVersion: '1.0',
            warnings: [`Fixture file not found: ${absolutePath}`],
            value: []
          };
        }
        throw e;
      }
      const events = JSON.parse(content) as Event[];
      return {
        provider: 'FixtureEventProvider',
        source: this.filePath,
        providerTimestamp: now.toISOString(),
        receivedTimestamp: now.toISOString(),
        confidence: 1,
        state: 'OK',
        schemaVersion: '1.0',
        value: events
      };
    } catch (err) {
      return {
        provider: 'FixtureEventProvider',
        source: this.filePath,
        providerTimestamp: now.toISOString(),
        receivedTimestamp: now.toISOString(),
        confidence: 0,
        state: 'LOW_CONFIDENCE',
        schemaVersion: '1.0',
        warnings: [String(err)],
        value: []
      };
    }
  }
}

/**
 * PriceEventGenerator generates synthetic price events for testing. The
 * generator takes a base price and a series of percentage changes and
 * produces price events with the calculated changes. Each call to
 * fetch yields a new batch of events. This provider is deterministic
 * and safe for test use.
 */
export class PriceEventGenerator implements Provider<Event[]> {
  private index = 0;
  constructor(private changes: number[], private symbol: string) {}
  async fetch(): Promise<ProviderResult<Event[]>> {
    const now = new Date();
    const events: Event[] = [];
    if (this.index < this.changes.length) {
      const change = this.changes[this.index];
      const event: Event = {
        id: `${this.symbol}-${this.index}`,
        type: 'price',
        description: `Synthetic price change of ${(change * 100).toFixed(2)}%`,
        timestamp: now.toISOString(),
        attributes: { percentageChange: change, symbol: this.symbol }
      };
      events.push(event);
      this.index++;
    }
    return {
      provider: 'PriceEventGenerator',
      source: `synthetic:${this.symbol}`,
      providerTimestamp: now.toISOString(),
      receivedTimestamp: now.toISOString(),
      confidence: 1,
      state: 'OK',
      schemaVersion: '1.0',
      value: events
    };
  }
}

export type { ProviderResult } from '../../core/src/types';