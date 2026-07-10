/**
 * Monte-Carlo simulation core for RTP verification. Shared by the unit test and
 * the standalone RTP report. Uses a seeded PRNG (not HMAC) for speed — the
 * fairness path that maps HMAC→u is validated separately in fairness.test.ts;
 * here we only need a uniform stream to certify the EV of the money core.
 */

import { DEFAULT_CONFIG, type GameConfig } from '../config';
import { mortalityFromUniform } from '../mortality';
import { resolveLife } from '../round';
import { mulberry32 } from './prng';

export interface Strategy {
  readonly name: string;
  /**
   * Produce a rest decision that is INDEPENDENT of the hidden mortality M —
   * this independence is exactly why every strategy shares one EV. `rng` is a
   * fresh uniform stream reserved for the strategy's own choices.
   */
  decide(rng: () => number): {
    restWorth: number;
    target: number;
    beyondWager: boolean;
    boldness: number;
  };
}

export interface BucketResult {
  readonly name: string;
  readonly rounds: number;
  readonly rtp: number;
  readonly targetRtp: number;
  readonly stdError: number;
  readonly deviation: number;
  /** Passes if within 0.1% OR within 4 standard errors (statistically sound). */
  readonly withinTolerance: boolean;
}

const D = DEFAULT_CONFIG.dispositions;
const boldnessOf = (id: string) => D.find((d) => d.id === id)!.beyondBoldness;

/** A spread of strategy buckets covering targets, dispositions, Beyond, and adaptivity. */
export const STRATEGIES: readonly Strategy[] = [
  {
    name: 'fulfil@2 · no-beyond',
    decide: () => ({ restWorth: Infinity, target: 2, beyondWager: false, boldness: 0.5 }),
  },
  {
    name: 'fulfil@5 · no-beyond',
    decide: () => ({ restWorth: Infinity, target: 5, beyondWager: false, boldness: 0.5 }),
  },
  {
    name: 'fulfil@12 · no-beyond',
    decide: () => ({ restWorth: Infinity, target: 12, beyondWager: false, boldness: 0.5 }),
  },
  {
    name: 'rest@random[1.1,25] · no-beyond',
    decide: (rng) => ({
      restWorth: 1.1 + rng() * 23.9,
      target: 100000,
      beyondWager: false,
      boldness: 0.5,
    }),
  },
  {
    name: 'adaptive: rest at random, target random',
    decide: (rng) => ({
      restWorth: 1.05 + rng() * 40,
      target: 1.5 + rng() * 30,
      beyondWager: rng() < 0.5,
      boldness: rng(),
    }),
  },
  {
    name: 'fulfil@12 · beyond · spark(bold)',
    decide: () => ({
      restWorth: Infinity,
      target: 12,
      beyondWager: true,
      boldness: boldnessOf('spark'),
    }),
  },
  {
    name: 'rest@random · beyond · steady(gentle)',
    decide: (rng) => ({
      restWorth: 1.2 + rng() * 15,
      target: 100000,
      beyondWager: true,
      boldness: boldnessOf('steady'),
    }),
  },
];

export function runBucket(
  strategy: Strategy,
  rounds: number,
  seed: number,
  cfg: GameConfig = DEFAULT_CONFIG,
): BucketResult {
  const mRng = mulberry32(seed);
  const sRng = mulberry32(seed ^ 0x9e3779b9);
  const bRng = mulberry32(seed ^ 0x1b56c4e9);
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < rounds; i++) {
    const m = mortalityFromUniform(mRng(), cfg.houseEdge);
    const choice = strategy.decide(sRng);
    const payout = resolveLife({
      mortality: m,
      restWorth: choice.restWorth,
      target: choice.target,
      beyondWager: choice.beyondWager,
      beyondUniform: bRng(),
      boldness: choice.boldness,
      cfg,
    }).payoutMultiplier;
    sum += payout;
    sumSq += payout * payout;
  }
  const rtp = sum / rounds;
  const variance = Math.max(0, sumSq / rounds - rtp * rtp);
  const stdError = Math.sqrt(variance / rounds);
  const targetRtp = 1 - cfg.houseEdge;
  const deviation = rtp - targetRtp;
  const tol = Math.max(0.001, 4 * stdError);
  return {
    name: strategy.name,
    rounds,
    rtp,
    targetRtp,
    stdError,
    deviation,
    withinTolerance: Math.abs(deviation) <= tol,
  };
}
