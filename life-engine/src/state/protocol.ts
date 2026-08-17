/**
 * The operator API contract. This is the surface an operator's RGS/wallet
 * backend implements; the client speaks only these messages and never sees the
 * server seed or mortality point until a round is settled. See INTEGRATION.md.
 */

import type { Ending, LiveState } from '../../engine/round';
import type { BeyondOutcome } from '../../engine/beyond';

/** Pre-round fairness commitment shown to the player. */
export interface FairnessCommitment {
  readonly serverSeedHash: string;
  readonly clientSeed: string;
  readonly nonce: number;
}

export interface PlaceBetRequest {
  readonly stake: number;
  readonly dispositionId: string;
  readonly ambitionId: string;
  readonly beyondWager: boolean;
}

/** Redacted, client-safe snapshot of a living round. Never contains mortality. */
export type RoundView = LiveState & { readonly roundId: string };

export interface PlaceBetResponse {
  readonly roundId: string;
  readonly balance: number;
  readonly commitment: FairnessCommitment;
  readonly view: RoundView;
}

export interface Settlement {
  readonly roundId: string;
  readonly ending: Ending;
  readonly worthAtEnd: number;
  readonly beyond: BeyondOutcome | null;
  readonly payoutMultiplier: number;
  readonly stake: number;
  readonly payout: number;
  readonly balance: number;
  /** Post-round reveal enabling independent verification. */
  readonly reveal: {
    readonly serverSeed: string;
    readonly serverSeedHash: string;
    readonly clientSeed: string;
    readonly nonce: number;
    readonly mortality: number;
  };
  /** Commitment for the NEXT round (seed rotated). */
  readonly nextCommitment: FairnessCommitment;
}

export interface TickResponse {
  readonly view: RoundView;
  readonly settlement: Settlement | null;
}

export interface HistoryEntry {
  readonly roundId: string;
  readonly ending: Ending;
  readonly multiplier: number;
  readonly payout: number;
  readonly stake: number;
  readonly won: boolean;
  readonly nonce: number;
}

/** The client's view of the RGS. Implemented locally (in-browser) or over HTTP. */
export interface RgsClient {
  getConfig(): Promise<import('../../engine/config').GameConfig>;
  getBalance(): Promise<number>;
  getCommitment(): Promise<FairnessCommitment>;
  setClientSeed(seed: string): Promise<FairnessCommitment>;
  placeBet(req: PlaceBetRequest): Promise<PlaceBetResponse>;
  tick(roundId: string): Promise<TickResponse>;
  setPace(roundId: string, pace: 'push' | 'coast' | 'tend'): Promise<RoundView>;
  reDeclare(roundId: string, target: number): Promise<RoundView>;
  rest(roundId: string): Promise<TickResponse>;
  getHistory(): Promise<HistoryEntry[]>;
}
