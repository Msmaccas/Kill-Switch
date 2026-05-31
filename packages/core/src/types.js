"use strict";
/**
 * This module defines the core domain types used by the KillSwitch
 * platform. Each type uses explicit states and fields to avoid
 * implicit undefined behaviour. Wherever data is collected from an
 * external provider the result is wrapped in a ProviderResult which
 * captures metadata about the source, timestamps, confidence and
 * downgraded state.
 */
Object.defineProperty(exports, "__esModule", { value: true });
