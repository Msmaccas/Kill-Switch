import { Thesis, Event } from './types';

/**
 * Validate a thesis object. Throws if invalid. This function checks
 * required fields and ensures no empty strings. It does not check
 * semantic correctness of kill conditions or supports.
 */
export function validateThesis(thesis: Thesis): void {
  if (!thesis.id) throw new Error('Thesis id is required');
  if (!thesis.type) throw new Error('Thesis type is required');
  if (!thesis.description) throw new Error('Thesis description is required');
  if (!Array.isArray(thesis.supports) || thesis.supports.length === 0) {
    throw new Error('Thesis supports must be a non-empty array');
  }
  if (!Array.isArray(thesis.killConditions) || thesis.killConditions.length === 0) {
    throw new Error('Thesis killConditions must be a non-empty array');
  }
  if (thesis.reviewCadenceDays <= 0) throw new Error('reviewCadenceDays must be positive');
  if (thesis.horizonDays <= 0) throw new Error('horizonDays must be positive');
}

/**
 * Validate an event object. Throws if invalid. Ensures id, type, and
 * description exist and timestamp parses.
 */
export function validateEvent(event: Event): void {
  if (!event.id) throw new Error('Event id is required');
  if (!event.type) throw new Error('Event type is required');
  if (!event.description) throw new Error('Event description is required');
  if (isNaN(Date.parse(event.timestamp))) {
    throw new Error('Invalid event timestamp');
  }
}