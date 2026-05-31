"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEvent = exports.validateThesis = void 0;
exports.createThesis = createThesis;
exports.evaluateThesis = evaluateThesis;
exports.maxSeverity = maxSeverity;
exports.isReviewDue = isReviewDue;
exports.buildBoardItem = buildBoardItem;
// Minimal unique identifier generator.  Uses Math.random() to create
// an 8‑character alphanumeric ID.  This avoids external dependencies
// and is sufficient for deterministic examples.  In production you
// could replace this with a more robust UUID generator.
function genId() {
    return ('thesis-' + Math.random().toString(36).slice(2, 10));
}
/**
 * Create a new thesis with sensible defaults. This function
 * automatically assigns a UUID and timestamps. It performs minimal
 * validation such as ensuring reviewCadenceDays and horizonDays are
 * positive numbers. Further validation should be handled upstream.
 */
function createThesis(params) {
    if (params.reviewCadenceDays <= 0) {
        throw new Error('reviewCadenceDays must be positive');
    }
    if (params.horizonDays <= 0) {
        throw new Error('horizonDays must be positive');
    }
    const now = new Date().toISOString();
    return {
        id: genId(),
        createdAt: now,
        lastReviewedAt: now,
        ...params
    };
}
/**
 * Evaluate a thesis against a set of events and return a list of
 * drift events. The simple heuristics implemented here are
 * deliberately interpretable: large negative price moves cause
 * soft/hard breaks, while explicit negative news attributes cause
 * soft breaks and fraud flags cause hard breaks. This function does
 * not modify the thesis itself.
 */
function evaluateThesis(thesis, events) {
    var _a;
    const driftEvents = [];
    // Derive threshold from kill conditions if possible. We look for the
    // first numeric percentage in the kill conditions to set the hard
    // threshold. If none is found, defaults are used. Soft threshold is
    // half of the hard threshold.
    let hardThreshold = -0.15;
    for (const cond of thesis.killConditions) {
        const match = cond.match(/(\d+(?:\.\d+)?)%/);
        if (match) {
            const pct = parseFloat(match[1]);
            if (!isNaN(pct)) {
                hardThreshold = -pct / 100;
                break;
            }
        }
    }
    const softThreshold = hardThreshold / 2;
    for (const ev of events) {
        if (ev.type === 'price') {
            const change = (_a = ev.attributes['percentageChange']) !== null && _a !== void 0 ? _a : 0;
            if (change <= hardThreshold) {
                driftEvents.push({
                    thesisId: thesis.id,
                    severity: 'HARD',
                    message: `Price dropped ${(change * 100).toFixed(1)}%, breaching hard threshold of ${(hardThreshold * 100).toFixed(1)}%`,
                    timestamp: ev.timestamp
                });
            }
            else if (change <= softThreshold) {
                driftEvents.push({
                    thesisId: thesis.id,
                    severity: 'SOFT',
                    message: `Price dropped ${(change * 100).toFixed(1)}%, approaching threshold of ${(hardThreshold * 100).toFixed(1)}%`,
                    timestamp: ev.timestamp
                });
            }
        }
        else if (ev.type === 'news' || ev.type === 'filing' || ev.type === 'custom') {
            const negative = Boolean(ev.attributes['negative']);
            const fraud = Boolean(ev.attributes['fraud']);
            if (fraud) {
                driftEvents.push({
                    thesisId: thesis.id,
                    severity: 'HARD',
                    message: `Fraud allegation: ${ev.description}`,
                    timestamp: ev.timestamp
                });
            }
            else if (negative) {
                driftEvents.push({
                    thesisId: thesis.id,
                    severity: 'SOFT',
                    message: `Negative event: ${ev.description}`,
                    timestamp: ev.timestamp
                });
            }
        }
    }
    return driftEvents;
}
/** Determine the maximum severity among a set of drift events. */
function maxSeverity(events) {
    let severity = 'NONE';
    for (const ev of events) {
        if (ev.severity === 'HARD') {
            return 'HARD';
        }
        if (ev.severity === 'SOFT') {
            severity = 'SOFT';
        }
    }
    return severity;
}
/** Compute whether a thesis is due for review. */
function isReviewDue(thesis, now) {
    const last = new Date(thesis.lastReviewedAt);
    const diffMs = now.getTime() - last.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= thesis.reviewCadenceDays;
}
/**
 * Build a board item summarising the current status of a thesis given
 * drift events and the current time. This function does not persist
 * changes; it merely produces a snapshot for presentation. The
 * severity is the maximum among events; notes summarise each event.
 */
function buildBoardItem(thesis, driftEvents, now) {
    const severity = maxSeverity(driftEvents);
    const reviewDue = isReviewDue(thesis, now);
    const notes = driftEvents.map((ev) => ev.message).join(' \n ');
    return {
        thesis,
        severity,
        lastUpdate: now.toISOString(),
        notes,
        reviewDue
    };
}
var validators_1 = require("./validators");
Object.defineProperty(exports, "validateThesis", { enumerable: true, get: function () { return validators_1.validateThesis; } });
Object.defineProperty(exports, "validateEvent", { enumerable: true, get: function () { return validators_1.validateEvent; } });
