import { Thesis, Event } from './types';
/**
 * Validate a thesis object. Throws if invalid. This function checks
 * required fields and ensures no empty strings. It does not check
 * semantic correctness of kill conditions or supports.
 */
export declare function validateThesis(thesis: Thesis): void;
/**
 * Validate an event object. Throws if invalid. Ensures id, type, and
 * description exist and timestamp parses.
 */
export declare function validateEvent(event: Event): void;
