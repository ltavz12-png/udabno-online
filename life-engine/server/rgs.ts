/**
 * Mock Remote Gaming Server (RGS).
 *
 * Owns all money- and outcome-authoritative state: wallet, provably-fair seeds
 * and nonce, and the lifecycle of every live round. Money logic lives here, not
 * in the client. It is framework-free (no Express, no DOM) so it can run
 * in-browser as a local mock OR behind the Express adapter in server/index.ts.
 *
 * An operator swaps this out for their own RGS/wallet by implementing the same
 * surface (see INTEGRATION.md). The wallet here is a trivial in-memory stub.
 */

import {
  DEFAULT_CONFIG,
  type GameConfig,
  LifeRound,
  type Declaration,
  hashServerSeed,
} from '../engine/index';
import type {
  FairnessCommitment,
  PlaceBetRequest,
  PlaceBetResponse,
  RoundView,
  Settlement,
  TickResponse,
  HistoryEntry,
} from '../src/state/protocol';

/** Injectable randomness so the RGS is testable/deterministic if needed. */
export interface RgsOptions {
  readonly config?: GameConfig;
  readonly startingBalance?: number;
  randomSeed?: () => string;
  now?: () => number;
  /** Safety: a life auto-rests after this long (real RGS enforces server-side). */
  readonly maxLifeMs?: number;
}

interface ActiveRound {
  readonly id: string;
  readonly round: LifeRound;
  readonly stake: number;
  readonly serverSeed: string;
  readonly clientSeed: string;
  readonly nonce: number;
  lastTickAt: number;
  startedAt: number;
}

function defaultRandomSeed(): string {
  // 32 hex chars of entropy. globalThis.crypto exists in browsers and Node 19+.
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export class RgsService {
  readonly config: GameConfig;
  private balance: number;
  private readonly randomSeed: () => string;
  private readonly now: () => number;
  private readonly maxLifeMs: number;

  private serverSeed: string;
  private clientSeed: string;
  private nonce = 0;

  private readonly active = new Map<string, ActiveRound>();
  private readonly history: HistoryEntry[] = [];
  private roundCounter = 0;

  constructor(opts: RgsOptions = {}) {
    this.config = opts.config ?? DEFAULT_CONFIG;
    this.balance = opts.startingBalance ?? 1000;
    this.randomSeed = opts.randomSeed ?? defaultRandomSeed;
    this.now = opts.now ?? (() => Date.now());
    this.maxLifeMs = opts.maxLifeMs ?? 120_000;
    this.serverSeed = this.randomSeed();
    this.clientSeed = this.randomSeed().slice(0, 12);
  }

  getConfig(): GameConfig {
    return this.config;
  }

  getBalance(): number {
    return this.balance;
  }

  getCommitment(): FairnessCommitment {
    return {
      serverSeedHash: hashServerSeed(this.serverSeed),
      clientSeed: this.clientSeed,
      nonce: this.nonce,
    };
  }

  setClientSeed(seed: string): FairnessCommitment {
    const trimmed = seed.trim();
    if (trimmed.length > 0 && trimmed.length <= 256) this.clientSeed = trimmed;
    return this.getCommitment();
  }

  getHistory(): HistoryEntry[] {
    return [...this.history];
  }

  placeBet(req: PlaceBetRequest): PlaceBetResponse {
    const { config } = this;
    if (!Number.isFinite(req.stake)) throw new RgsError('invalid stake');
    if (req.stake < config.minBet || req.stake > config.maxBet) {
      throw new RgsError(`stake must be between ${config.minBet} and ${config.maxBet}`);
    }
    if (req.stake > this.balance) throw new RgsError('insufficient balance');

    const disposition = config.dispositions.find((d) => d.id === req.dispositionId);
    const ambition = config.ambitions.find((a) => a.id === req.ambitionId);
    if (!disposition || !ambition) throw new RgsError('unknown disposition or ambition');

    // Debit the stake up front (server-authoritative).
    this.balance -= req.stake;

    const declaration: Declaration = {
      stake: req.stake,
      disposition,
      ambition,
      beyondWager: req.beyondWager,
    };
    const fairness = { serverSeed: this.serverSeed, clientSeed: this.clientSeed, nonce: this.nonce };
    const round = new LifeRound(declaration, fairness, config);
    const id = `r${++this.roundCounter}`;
    const t = this.now();
    this.active.set(id, {
      id,
      round,
      stake: req.stake,
      serverSeed: this.serverSeed,
      clientSeed: this.clientSeed,
      nonce: this.nonce,
      lastTickAt: t,
      startedAt: t,
    });

    return {
      roundId: id,
      balance: this.balance,
      commitment: this.getCommitment(),
      view: this.viewOf(id, round),
    };
  }

  tick(roundId: string): TickResponse {
    const a = this.mustGet(roundId);
    const t = this.now();
    let dt = t - a.lastTickAt;
    a.lastTickAt = t;
    if (dt < 0) dt = 0;
    if (dt > 250) dt = 250; // clamp long gaps (tab was hidden) — advance gently

    const alive = a.round.tick(dt);
    // Safety auto-rest for over-long lives.
    if (alive && t - a.startedAt > this.maxLifeMs) {
      a.round.rest();
    }
    return this.maybeSettle(a);
  }

  setPace(roundId: string, pace: 'push' | 'coast' | 'tend'): RoundView {
    const a = this.mustGet(roundId);
    a.round.setPace(pace);
    return this.viewOf(a.id, a.round);
  }

  reDeclare(roundId: string, target: number): RoundView {
    const a = this.mustGet(roundId);
    a.round.reDeclare(target);
    return this.viewOf(a.id, a.round);
  }

  rest(roundId: string): TickResponse {
    const a = this.mustGet(roundId);
    // Advance to "now" first so the player rests at the true current worth.
    const t = this.now();
    let dt = Math.min(250, Math.max(0, t - a.lastTickAt));
    a.lastTickAt = t;
    if (a.round.view().phase === 'live') {
      a.round.tick(dt);
      if (a.round.view().phase === 'live') a.round.rest();
    }
    return this.maybeSettle(a);
  }

  // ---- internal ----

  private maybeSettle(a: ActiveRound): TickResponse {
    const view = this.viewOf(a.id, a.round);
    const state = a.round.view();
    if (state.phase !== 'reckoning' || !state.outcome) {
      return { view, settlement: null };
    }
    const outcome = state.outcome;
    const payout = a.stake * outcome.payoutMultiplier;
    this.balance += payout;

    // Reveal & rotate seeds for the next round.
    const mortality = a.round.revealMortality();
    const reveal = {
      serverSeed: a.serverSeed,
      serverSeedHash: hashServerSeed(a.serverSeed),
      clientSeed: a.clientSeed,
      nonce: a.nonce,
      mortality,
    };
    this.nonce += 1;
    this.serverSeed = this.randomSeed(); // fresh secret, new commitment

    const settlement: Settlement = {
      roundId: a.id,
      ending: outcome.ending,
      worthAtEnd: outcome.worthAtEnd,
      beyond: outcome.beyond,
      payoutMultiplier: outcome.payoutMultiplier,
      stake: a.stake,
      payout,
      balance: this.balance,
      reveal,
      nextCommitment: this.getCommitment(),
    };

    this.history.unshift({
      roundId: a.id,
      ending: outcome.ending,
      multiplier: outcome.payoutMultiplier,
      payout,
      stake: a.stake,
      won: payout > a.stake,
      nonce: a.nonce,
    });
    if (this.history.length > 100) this.history.pop();
    this.active.delete(a.id);

    return { view, settlement };
  }

  private viewOf(id: string, round: LifeRound): RoundView {
    return { ...round.view(), roundId: id };
  }

  private mustGet(roundId: string): ActiveRound {
    const a = this.active.get(roundId);
    if (!a) throw new RgsError(`no active round ${roundId}`);
    return a;
  }
}

export class RgsError extends Error {}
