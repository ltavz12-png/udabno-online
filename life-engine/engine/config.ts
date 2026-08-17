/**
 * Operator-tunable configuration for The Life Engine.
 *
 * Everything an operator or certification lab needs to reason about the money
 * model lives here. Changing `houseEdge` changes the RTP and nothing else; the
 * EV-invariance property (see MATH.md) holds for any value in (0, 1).
 */

/** How the player is born — affects pacing & variance only, never EV. */
export interface DispositionConfig {
  readonly id: string;
  readonly name: string;
  /** Multiplier on worth-growth rate. >1 ages/climbs faster (Spark), <1 slower (Steady). */
  readonly worthRate: number;
  /**
   * "How they lived" tilt for The Beyond spread, in [0, 1]. 0 = narrowest
   * (gentle), 1 = widest (bold). Shifts probability mass between Legacy and
   * Dark End while keeping E[multiplier] = 1 exactly.
   */
  readonly beyondBoldness: number;
  /** Vitality drain multiplier — pure visual/feel, decoupled from mortality. */
  readonly vitalityDrain: number;
}

/** How far they'll go — an auto-rest target multiplier. All tiers share one EV. */
export interface AmbitionTier {
  readonly id: string;
  readonly name: string;
  /** Declared target multiplier T. Fulfilling pays stake × T. */
  readonly target: number;
}

/** The Beyond bucket definition. Multipliers are calibrated to mean exactly 1. */
export interface BeyondConfig {
  /** Legacy multiplier (the big, rare bloom). */
  readonly legacyMultiplier: number;
  /** Dark End multiplier (the low, somber end). */
  readonly darkMultiplier: number;
  // "Nothing" is always ×1. Probabilities are derived so E[mult] = 1 (see beyond.ts).
}

export interface GameConfig {
  /** House edge e. RTP = 1 - e. Default 0.03 → 97% RTP. */
  readonly houseEdge: number;
  /**
   * Mean multiplier the three-outcome Beyond pays on the worth-at-death, in
   * [0, 1). >0 means dying is no longer a flat loss: it resolves into
   * Legacy/Nothing/Dark End on the worth reached. This payout is funded by
   * steepening the mortality curve by exactly the right amount, so RTP stays
   * fixed and identical for every strategy (see MATH.md). 0 = classic crash
   * (death pays nothing).
   */
  readonly deathBeyondMean: number;
  readonly currency: string;
  readonly locale: string;
  readonly minBet: number;
  readonly maxBet: number;
  /** Maximum multiplier the client will render / server will honour (safety cap). */
  readonly maxMultiplier: number;
  readonly dispositions: readonly DispositionConfig[];
  readonly ambitions: readonly AmbitionTier[];
  readonly beyond: BeyondConfig;
  /** Base worth-growth: multipliers-per-second of real time at Coast pace. */
  readonly baseGrowthPerSecond: number;
  /** Pace multipliers applied to worth-growth rate (timing only, EV-neutral). */
  readonly paceRates: { readonly push: number; readonly coast: number; readonly tend: number };
  /** Responsible-gaming hook points (operator-enforced). */
  readonly responsibleGaming: {
    readonly sessionReminderMinutes: number;
    readonly defaultLossLimit: number | null;
    readonly defaultTimeLimitMinutes: number | null;
  };
}

export const DEFAULT_CONFIG: GameConfig = {
  houseEdge: 0.03,
  deathBeyondMean: 0.25,
  currency: 'USD',
  locale: 'en-US',
  minBet: 0.1,
  maxBet: 1000,
  maxMultiplier: 100000,
  dispositions: [
    { id: 'spark', name: 'Spark', worthRate: 1.6, beyondBoldness: 1.0, vitalityDrain: 1.6 },
    { id: 'wanderer', name: 'Wanderer', worthRate: 1.0, beyondBoldness: 0.5, vitalityDrain: 1.0 },
    { id: 'steady', name: 'Steady', worthRate: 0.65, beyondBoldness: 0.15, vitalityDrain: 0.6 },
  ],
  ambitions: [
    { id: 'modest', name: 'A Quiet Life', target: 2 },
    { id: 'bold', name: 'A Full Life', target: 5 },
    { id: 'grand', name: 'A Legend', target: 12 },
  ],
  beyond: {
    legacyMultiplier: 5,
    darkMultiplier: 0.2,
  },
  baseGrowthPerSecond: 0.08,
  paceRates: { push: 2.6, coast: 1.0, tend: 0.35 },
  responsibleGaming: {
    sessionReminderMinutes: 60,
    defaultLossLimit: null,
    defaultTimeLimitMinutes: null,
  },
};

export function withConfig(overrides: Partial<GameConfig>): GameConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}
