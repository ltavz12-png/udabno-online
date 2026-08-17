/**
 * The Beyond — an EV-neutral final wager applied to a life's realised worth.
 *
 * When a life comes to its reckoning, its banked worth W is passed through The
 * Beyond: a three-bucket lottery with multiplier B ∈ {L (Legacy), 1 (Nothing),
 * d (Dark End)}. It is calibrated so that **E[B] = 1 exactly**, for every
 * disposition. Multiplying a payout by an independent mean-1 lottery leaves its
 * expectation unchanged, so The Beyond adds variance and drama without moving
 * RTP one basis point. See MATH.md for the full derivation.
 *
 * "How you lived" (disposition boldness β ∈ [0,1]) controls the *spread mass* s
 * — how often a life resolves to something other than Nothing. Legacy and Dark
 * End probabilities scale together with s so that:
 *
 *     p_L·L + p_d·d + p_N·1 = 1     (mean preserved)
 *
 *   with   p_L = s·(1 - d)/(L - d),   p_d = s·(L - 1)/(L - d),   p_N = 1 - s.
 *
 * Bold lives (Spark) reach The Beyond's extremes far more often than gentle
 * ones (Steady); the mean is identical either way.
 */

import type { BeyondConfig } from './config';

export type BeyondBucket = 'legacy' | 'nothing' | 'dark';

export interface BeyondOutcome {
  readonly bucket: BeyondBucket;
  readonly multiplier: number;
  /** Probabilities used, exposed for the fairness/verify UI. */
  readonly probabilities: { readonly legacy: number; readonly nothing: number; readonly dark: number };
}

const SPREAD_MIN = 0.2;
const SPREAD_MAX = 0.9;

export function beyondProbabilities(
  boldness: number,
  cfg: BeyondConfig,
): { legacy: number; nothing: number; dark: number } {
  const b = Math.max(0, Math.min(1, boldness));
  const s = SPREAD_MIN + b * (SPREAD_MAX - SPREAD_MIN);
  const L = cfg.legacyMultiplier;
  const d = cfg.darkMultiplier;
  const legacy = (s * (1 - d)) / (L - d);
  const dark = (s * (L - 1)) / (L - d);
  const nothing = 1 - s;
  return { legacy, nothing, dark };
}

/** Resolve The Beyond from a uniform draw u ∈ [0, 1). */
export function resolveBeyond(u: number, boldness: number, cfg: BeyondConfig): BeyondOutcome {
  const p = beyondProbabilities(boldness, cfg);
  if (u < p.legacy) {
    return { bucket: 'legacy', multiplier: cfg.legacyMultiplier, probabilities: p };
  }
  if (u < p.legacy + p.dark) {
    return { bucket: 'dark', multiplier: cfg.darkMultiplier, probabilities: p };
  }
  return { bucket: 'nothing', multiplier: 1, probabilities: p };
}

/** Exact mean of B for a given boldness — must equal 1.0 for all inputs. */
export function beyondMean(boldness: number, cfg: BeyondConfig): number {
  const p = beyondProbabilities(boldness, cfg);
  return p.legacy * cfg.legacyMultiplier + p.nothing * 1 + p.dark * cfg.darkMultiplier;
}
