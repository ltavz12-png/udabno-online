/**
 * Worth, pacing, life-stage and vitality models.
 *
 * Worth W climbs exponentially from 1.00×, exactly like a crash curve. Pacing
 * (push/coast/tend) and disposition only scale the *growth rate*, i.e. the
 * real-time speed at which a given worth is reached — never the mortality point
 * M and never the worth→payout map. Pacing is therefore pure timing/variance
 * and provably EV-neutral (see MATH.md).
 *
 * Vitality is deliberately DECOUPLED from M. A vitality meter derived from the
 * distance to M would leak the hidden outcome and let a player play perfectly,
 * destroying fairness. Instead vitality is a monotone function of accumulated
 * strain (how hard the life has been pushed) — atmospheric only. Death is
 * governed by M alone.
 */

import type { GameConfig } from './config';

export type Pace = 'push' | 'coast' | 'tend';

export interface LifeStage {
  readonly id: string;
  readonly name: string;
  /** Worth at which this stage begins. */
  readonly fromWorth: number;
}

/** Life stages keyed to worth thresholds (log-spaced — a life passing). */
export const LIFE_STAGES: readonly LifeStage[] = [
  { id: 'infant', name: 'Infant', fromWorth: 1.0 },
  { id: 'child', name: 'Child', fromWorth: 1.35 },
  { id: 'youth', name: 'Youth', fromWorth: 2.0 },
  { id: 'adult', name: 'Adult', fromWorth: 3.5 },
  { id: 'prime', name: 'Prime', fromWorth: 7.0 },
  { id: 'elder', name: 'Elder', fromWorth: 18.0 },
];

export function lifeStageForWorth(worth: number): LifeStage {
  let stage = LIFE_STAGES[0];
  for (const s of LIFE_STAGES) {
    if (worth >= s.fromWorth) stage = s;
    else break;
  }
  return stage;
}

/** Fractional progress through the current stage, in [0, 1] — for smooth morphs. */
export function stageProgress(worth: number): number {
  const idx = LIFE_STAGES.findIndex((s) => s === lifeStageForWorth(worth));
  const cur = LIFE_STAGES[idx];
  const next = LIFE_STAGES[idx + 1];
  if (!next) return 1;
  const lo = Math.log(cur.fromWorth || 1);
  const hi = Math.log(next.fromWorth);
  const w = Math.log(Math.max(worth, 1));
  return Math.max(0, Math.min(1, (w - lo) / (hi - lo)));
}

/** Continuous growth rate (per second) for the current pace & disposition. */
export function growthRate(cfg: GameConfig, pace: Pace, dispositionWorthRate: number): number {
  return cfg.baseGrowthPerSecond * cfg.paceRates[pace] * dispositionWorthRate;
}

/** Advance worth by dt milliseconds at a constant rate (exponential climb). */
export function advanceWorth(worth: number, dtMs: number, rate: number): number {
  return worth * Math.exp(rate * (dtMs / 1000));
}

/**
 * Vitality model — decoupled from M. Drains with elapsed strain (faster on
 * push, per disposition), recovers on tend. Clamped to [0, 1]. Purely visual.
 */
export function advanceVitality(
  vitality: number,
  dtMs: number,
  pace: Pace,
  dispositionDrain: number,
): number {
  const dt = dtMs / 1000;
  const baseDrain = 0.045 * dispositionDrain;
  const paceFactor = pace === 'push' ? 2.2 : pace === 'coast' ? 1.0 : -1.4; // tend recovers
  const next = vitality - baseDrain * paceFactor * dt;
  return Math.max(0, Math.min(1, next));
}
