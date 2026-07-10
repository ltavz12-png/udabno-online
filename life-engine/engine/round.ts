/**
 * The round state machine: DECLARE → LIVE → RECKONING.
 *
 * `resolveLife` is the single source of truth for money outcomes and is shared
 * by live play and the Monte-Carlo RTP harness, so what the tests certify is
 * exactly what players experience.
 *
 * EV summary (proved in MATH.md):
 *   - Rest / Fulfil at worth v (v ≤ M): payout = stake · v · B, with E[B] = 1.
 *   - Sudden death (worth reaches M first): payout = 0.
 *   For any strategy,  EV = stake · (1 - e).  Disposition, ambition, pacing,
 *   and the optional Beyond wager change only variance — never EV.
 */

import type { GameConfig, DispositionConfig, AmbitionTier } from './config';
import { mortalityFromUniform } from './mortality';
import { resolveBeyond, type BeyondOutcome } from './beyond';
import {
  deriveFairness,
  deriveBeyondUniform,
  hashServerSeed,
  type FairnessInputs,
} from './fairness';
import {
  advanceWorth,
  advanceVitality,
  growthRate,
  lifeStageForWorth,
  type Pace,
  type LifeStage,
} from './worth';

export type Ending = 'rest' | 'fulfil' | 'sudden-death';
export type Phase = 'declare' | 'live' | 'reckoning';

export interface Declaration {
  readonly stake: number;
  readonly disposition: DispositionConfig;
  readonly ambition: AmbitionTier;
  /** Route the reckoning payout through the mean-1 Beyond wager (EV-neutral). */
  readonly beyondWager: boolean;
}

export interface LifeInputs {
  readonly mortality: number;
  /** Worth at which the player chose to rest; Infinity if they never rest. */
  readonly restWorth: number;
  readonly target: number;
  readonly beyondWager: boolean;
  readonly beyondUniform: number;
  readonly boldness: number;
  readonly cfg: GameConfig;
}

export interface LifeOutcome {
  readonly ending: Ending;
  /** Banked worth basis for payout (0 on sudden death). */
  readonly worthAtEnd: number;
  readonly beyond: BeyondOutcome | null;
  /** Final payout as a multiple of stake. */
  readonly payoutMultiplier: number;
}

/**
 * Pure resolution of a life given its hidden mortality and the player's chosen
 * rest worth. No time, no rendering — this is the certifiable money core.
 */
export function resolveLife(input: LifeInputs): LifeOutcome {
  const { mortality, restWorth, target, beyondWager, beyondUniform, boldness, cfg } = input;

  // The player effectively rests at the earlier of their chosen worth and the
  // declared ambition (fulfil = auto-rest at target).
  const effectiveRest = Math.min(restWorth, target);

  if (effectiveRest <= mortality) {
    const ending: Ending = effectiveRest >= target ? 'fulfil' : 'rest';
    const worthAtEnd = effectiveRest;
    if (beyondWager) {
      const beyond = resolveBeyond(beyondUniform, boldness, cfg.beyond);
      return {
        ending,
        worthAtEnd,
        beyond,
        payoutMultiplier: worthAtEnd * beyond.multiplier,
      };
    }
    return { ending, worthAtEnd, beyond: null, payoutMultiplier: worthAtEnd };
  }

  // Worth reached mortality before the player rested — the thread is cut.
  return { ending: 'sudden-death', worthAtEnd: 0, beyond: null, payoutMultiplier: 0 };
}

/* ------------------------------------------------------------------ *
 *  Live round — a real-time wrapper around resolveLife.
 *  Server-authoritative: it holds `mortality`; the client mirror never does.
 * ------------------------------------------------------------------ */

export interface LiveState {
  phase: Phase;
  worth: number;
  vitality: number;
  pace: Pace;
  elapsedMs: number;
  stage: LifeStage;
  target: number;
  ending: Ending | null;
  outcome: LifeOutcome | null;
}

export class LifeRound {
  readonly declaration: Declaration;
  readonly cfg: GameConfig;
  private readonly mortality: number;
  private readonly beyondUniform: number;
  readonly serverSeedHash: string;

  private worth = 1.0;
  private vitality = 1.0;
  private pace: Pace = 'coast';
  private elapsedMs = 0;
  private phase: Phase = 'live';
  private ending: Ending | null = null;
  private outcome: LifeOutcome | null = null;
  private ambitionTarget: number;

  constructor(declaration: Declaration, fairness: FairnessInputs, cfg: GameConfig) {
    this.declaration = declaration;
    this.cfg = cfg;
    const { u } = deriveFairness(fairness);
    this.mortality = mortalityFromUniform(u, cfg.houseEdge);
    this.beyondUniform = deriveBeyondUniform(fairness);
    this.serverSeedHash = hashServerSeed(fairness.serverSeed);
    this.ambitionTarget = declaration.ambition.target;
  }

  setPace(pace: Pace): void {
    if (this.phase === 'live') this.pace = pace;
  }

  /** Lower the ambition mid-life to hedge (re-declare). Cannot raise it. */
  reDeclare(newTarget: number): void {
    if (this.phase === 'live' && newTarget < this.ambitionTarget && newTarget >= 1) {
      this.ambitionTarget = newTarget;
    }
  }

  /** Advance the life by dt ms. Returns true while still living. */
  tick(dtMs: number): boolean {
    if (this.phase !== 'live') return false;
    const rate = growthRate(this.cfg, this.pace, this.declaration.disposition.worthRate);
    this.worth = advanceWorth(this.worth, dtMs, rate);
    this.vitality = advanceVitality(
      this.vitality,
      dtMs,
      this.pace,
      this.declaration.disposition.vitalityDrain,
    );
    this.elapsedMs += dtMs;

    if (this.worth >= this.mortality) {
      this.worth = this.mortality; // clamp to the crossing
      this.finish(Infinity);
      return false;
    }
    if (this.worth >= this.ambitionTarget) {
      this.finish(this.ambitionTarget); // fulfil
      return false;
    }
    return true;
  }

  /** Player rests at the current worth. */
  rest(): LifeOutcome {
    if (this.phase === 'live') this.finish(this.worth);
    return this.outcome!;
  }

  private finish(restWorth: number): void {
    this.outcome = resolveLife({
      mortality: this.mortality,
      restWorth,
      target: this.ambitionTarget,
      beyondWager: this.declaration.beyondWager,
      beyondUniform: this.beyondUniform,
      boldness: this.declaration.disposition.beyondBoldness,
      cfg: this.cfg,
    });
    this.ending = this.outcome.ending;
    this.phase = 'reckoning';
  }

  /** Redacted state safe to send to the client (never exposes mortality). */
  view(): LiveState {
    return {
      phase: this.phase,
      worth: this.worth,
      vitality: this.vitality,
      pace: this.pace,
      elapsedMs: this.elapsedMs,
      stage: lifeStageForWorth(this.worth),
      target: this.ambitionTarget,
      ending: this.ending,
      outcome: this.outcome,
    };
  }

  /** Post-round reveal for verification. */
  revealMortality(): number {
    return this.mortality;
  }
}
