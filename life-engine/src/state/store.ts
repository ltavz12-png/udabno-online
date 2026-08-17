/**
 * Client state store (Zustand). A thin mirror of the server-authoritative RGS:
 * it never computes money or outcomes, it only reflects RGS responses and drives
 * the render/tick loop. All monetary truth comes from `RgsClient`.
 */
import { create } from 'zustand';
import type { GameConfig } from '../../engine/config';
import type {
  RgsClient,
  FairnessCommitment,
  RoundView,
  Settlement,
  HistoryEntry,
} from './protocol';
import { LocalRgsClient } from './rgs-client';
import type { Pace } from '../../engine/worth';
import { SocialField, type FeedItem, type OtherLife } from './social';
import { operatorConfig } from '../../config/operator.config';

export type Status = 'loading' | 'idle' | 'living' | 'reckoning';

export interface Settings {
  muted: boolean;
  reducedMotion: boolean;
  autoPlay: boolean;
  autoRestAtTarget: boolean;
}

interface Draft {
  stake: number;
  dispositionId: string;
  ambitionId: string;
  beyondWager: boolean;
}

export interface GameState {
  client: RgsClient;
  status: Status;
  config: GameConfig | null;
  balance: number;
  commitment: FairnessCommitment | null;
  history: HistoryEntry[];
  draft: Draft;
  clientSeedInput: string;
  skinId: string;
  /** Stake of the life currently being lived (frozen at bet time). */
  activeStake: number;

  roundId: string | null;
  view: RoundView | null;
  settlement: Settlement | null;

  settings: Settings;

  social: SocialField;
  feed: FeedItem[];
  otherLives: OtherLife[];

  // lifecycle
  init(client?: RgsClient): Promise<void>;
  setStake(v: number): void;
  adjustStake(delta: number): void;
  setDisposition(id: string): void;
  setAmbition(id: string): void;
  toggleBeyond(): void;
  setClientSeedInput(v: string): void;
  commitClientSeed(): Promise<void>;
  beginLife(): Promise<void>;
  setPace(p: Pace): void;
  reDeclare(target: number): void;
  rest(): Promise<void>;
  dismissReckoning(): void;
  toggleMuted(): void;
  toggleReducedMotion(): void;
  toggleAutoPlay(): void;
  toggleAutoRest(): void;
  setSkin(id: string): void;
}

let rafHandle: number | null = null;
let socialHandle: ReturnType<typeof setInterval> | null = null;

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export const useGame = create<GameState>((set, get) => ({
  client: new LocalRgsClient({ config: operatorConfig }),
  status: 'loading',
  config: null,
  balance: 0,
  commitment: null,
  history: [],
  draft: { stake: 1, dispositionId: 'wanderer', ambitionId: 'bold', beyondWager: false },
  clientSeedInput: '',
  skinId: 'human',
  activeStake: 1,
  roundId: null,
  view: null,
  settlement: null,
  settings: { muted: false, reducedMotion: false, autoPlay: false, autoRestAtTarget: false },
  social: new SocialField(),
  feed: [],
  otherLives: [],

  async init(client) {
    const c = client ?? get().client;
    const [config, balance, commitment, history] = await Promise.all([
      c.getConfig(),
      c.getBalance(),
      c.getCommitment(),
      c.getHistory(),
    ]);
    const social = new SocialField(config);
    social.start();
    if (socialHandle) clearInterval(socialHandle);
    socialHandle = setInterval(() => {
      social.tick();
      set({ feed: social.feed(), otherLives: social.lives() });
    }, 900);
    set({
      client: c,
      config,
      balance,
      commitment,
      history,
      status: 'idle',
      clientSeedInput: commitment.clientSeed,
      draft: {
        stake: Math.max(config.minBet, 1),
        dispositionId: config.dispositions[1]?.id ?? config.dispositions[0].id,
        ambitionId: config.ambitions[1]?.id ?? config.ambitions[0].id,
        beyondWager: false,
      },
      social,
      feed: social.feed(),
      otherLives: social.lives(),
    });
  },

  setStake(v) {
    const cfg = get().config;
    if (!cfg) return;
    const clamped = Math.min(cfg.maxBet, Math.max(cfg.minBet, Number.isFinite(v) ? v : cfg.minBet));
    set({ draft: { ...get().draft, stake: Math.round(clamped * 100) / 100 } });
  },
  adjustStake(delta) {
    get().setStake(get().draft.stake + delta);
  },
  setDisposition(id) {
    set({ draft: { ...get().draft, dispositionId: id } });
  },
  setAmbition(id) {
    set({ draft: { ...get().draft, ambitionId: id } });
  },
  toggleBeyond() {
    set({ draft: { ...get().draft, beyondWager: !get().draft.beyondWager } });
  },
  setClientSeedInput(v) {
    set({ clientSeedInput: v });
  },
  async commitClientSeed() {
    const commitment = await get().client.setClientSeed(get().clientSeedInput);
    set({ commitment });
  },

  async beginLife() {
    const { client, draft, status } = get();
    if (status !== 'idle') return;
    let res;
    try {
      res = await client.placeBet({
        stake: draft.stake,
        dispositionId: draft.dispositionId,
        ambitionId: draft.ambitionId,
        beyondWager: draft.beyondWager,
      });
    } catch (err) {
      // Surface insufficient-balance / limit errors via feed for now.
      get().social.announce((err as Error).message);
      set({ feed: get().social.feed() });
      return;
    }
    set({
      status: 'living',
      roundId: res.roundId,
      view: res.view,
      balance: res.balance,
      commitment: res.commitment,
      settlement: null,
      activeStake: draft.stake,
    });
    startLoop(set, get);
  },

  setPace(p) {
    const { client, roundId, status } = get();
    if (!roundId || status !== 'living') return;
    client.setPace(roundId, p).then((view) => set({ view }));
  },
  reDeclare(target) {
    const { client, roundId, status } = get();
    if (!roundId || status !== 'living') return;
    client.reDeclare(roundId, target).then((view) => set({ view }));
  },
  async rest() {
    const { client, roundId, status } = get();
    if (!roundId || status !== 'living') return;
    stopLoop();
    const res = await client.rest(roundId);
    applyTick(set, get, res.view, res.settlement);
  },
  dismissReckoning() {
    const { status } = get();
    if (status !== 'reckoning') return;
    set({ status: 'idle', settlement: null, view: null, roundId: null });
    if (get().settings.autoPlay) {
      setTimeout(() => get().beginLife(), 600);
    }
  },

  toggleMuted() {
    set({ settings: { ...get().settings, muted: !get().settings.muted } });
  },
  toggleReducedMotion() {
    set({ settings: { ...get().settings, reducedMotion: !get().settings.reducedMotion } });
  },
  toggleAutoPlay() {
    set({ settings: { ...get().settings, autoPlay: !get().settings.autoPlay } });
  },
  toggleAutoRest() {
    set({ settings: { ...get().settings, autoRestAtTarget: !get().settings.autoRestAtTarget } });
  },
  setSkin(id) {
    set({ skinId: id });
  },
}));

function startLoop(set: SetFn, get: GetFn): void {
  stopLoop();
  let last = now();
  const step = async () => {
    const { client, roundId, status } = get();
    if (!roundId || status !== 'living') return;
    const t = now();
    if (t - last >= 60) {
      last = t;
      try {
        const res = await client.tick(roundId);
        applyTick(set, get, res.view, res.settlement);
      } catch {
        stopLoop();
        return;
      }
    }
    if (get().status === 'living') scheduleFrame(step);
  };
  scheduleFrame(step);
}

function applyTick(set: SetFn, get: GetFn, view: RoundView, settlement: Settlement | null): void {
  if (settlement) {
    stopLoop();
    get().social.announcePlayerLife(settlement);
    set({
      view,
      settlement,
      status: 'reckoning',
      balance: settlement.balance,
      commitment: settlement.nextCommitment,
      history: [
        {
          roundId: settlement.roundId,
          ending: settlement.ending,
          multiplier: settlement.payoutMultiplier,
          payout: settlement.payout,
          stake: settlement.stake,
          won: settlement.payout > settlement.stake,
          nonce: settlement.reveal.nonce,
        },
        ...get().history,
      ].slice(0, 50),
      feed: get().social.feed(),
    });
  } else {
    set({ view });
  }
}

function scheduleFrame(fn: () => void): void {
  if (typeof requestAnimationFrame !== 'undefined') {
    rafHandle = requestAnimationFrame(fn);
  } else {
    rafHandle = setTimeout(fn, 16) as unknown as number;
  }
}
function stopLoop(): void {
  if (rafHandle != null) {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(rafHandle);
    else clearTimeout(rafHandle);
    rafHandle = null;
  }
}

type SetFn = (partial: Partial<GameState>) => void;
type GetFn = () => GameState;
