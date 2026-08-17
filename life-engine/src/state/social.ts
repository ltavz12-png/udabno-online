/**
 * The social field — other players' lives unfolding in parallel, a scrolling
 * live feed, and crews (a shared constellation). This is a *cosmetic* simulation
 * (it touches no wallet and no fairness), so it uses plain Math.random. Its job
 * is to make the round feel alive and shareable, exactly as a crash lobby does.
 */
import { DEFAULT_CONFIG, type GameConfig } from '../../engine/config';
import { mortalityFromUniform } from '../../engine/mortality';
import { lifeStageForWorth } from '../../engine/worth';
import type { Settlement } from './protocol';

export interface OtherLife {
  id: string;
  name: string;
  crew: string;
  worth: number;
  mortality: number;
  target: number;
  dispositionId: string;
  alive: boolean;
  bornAt: number;
  stage: string;
}

export type FeedKind = 'birth' | 'rest' | 'fulfil' | 'death' | 'legacy' | 'system' | 'you';

export interface FeedItem {
  id: string;
  name: string;
  crew: string;
  kind: FeedKind;
  text: string;
  multiplier: number;
}

const FIRST = [
  'Ada', 'Kai', 'Nour', 'Sol', 'Wren', 'Idris', 'Mira', 'Tavi', 'Esme', 'Rune',
  'Lior', 'Yara', 'Enzo', 'Suki', 'Oren', 'Vela', 'Cyrus', 'Anya', 'Milo', 'Zaya',
];
const CREWS = ['Dawnkeepers', 'The Long Road', 'Emberfold', 'Stillwater', 'Northlight', 'The Kindled'];

let uid = 0;
const id = () => `s${++uid}`;
const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export class SocialField {
  private readonly cfg: GameConfig;
  private readonly others = new Map<string, OtherLife>();
  private readonly items: FeedItem[] = [];
  private tickCount = 0;

  constructor(cfg: GameConfig = DEFAULT_CONFIG) {
    this.cfg = cfg;
  }

  start(): void {
    for (let i = 0; i < 22; i++) this.spawn();
  }

  private spawn(): void {
    const disposition = pick(this.cfg.dispositions);
    const target = pick(this.cfg.ambitions).target;
    const life: OtherLife = {
      id: id(),
      name: pick(FIRST),
      crew: pick(CREWS),
      worth: 1,
      mortality: mortalityFromUniform(Math.random(), this.cfg.houseEdge),
      target,
      dispositionId: disposition.id,
      alive: true,
      bornAt: this.tickCount,
      stage: 'infant',
    };
    this.others.set(life.id, life);
    this.push({ id: id(), name: life.name, crew: life.crew, kind: 'birth', text: 'was born', multiplier: 1 });
  }

  tick(): void {
    this.tickCount++;
    for (const life of this.others.values()) {
      if (!life.alive) continue;
      const disp = this.cfg.dispositions.find((d) => d.id === life.dispositionId)!;
      // Cosmetic exponential climb; pace jitter for variety.
      life.worth *= Math.exp(0.09 * disp.worthRate * (0.6 + Math.random() * 0.9));
      life.stage = lifeStageForWorth(life.worth).id;

      if (life.worth >= life.mortality) {
        life.alive = false;
        const legacy = Math.random() < 0.12;
        this.push({
          id: id(),
          name: life.name,
          crew: life.crew,
          kind: legacy ? 'legacy' : 'death',
          text: legacy ? `left a legacy at ${life.mortality.toFixed(2)}×` : `rested eternal at ${life.mortality.toFixed(2)}×`,
          multiplier: legacy ? life.mortality : 0,
        });
      } else if (life.worth >= life.target && Math.random() < 0.5) {
        life.alive = false;
        this.push({
          id: id(),
          name: life.name,
          crew: life.crew,
          kind: 'fulfil',
          text: `fulfilled a life at ${life.target.toFixed(2)}×`,
          multiplier: life.target,
        });
      } else if (Math.random() < 0.06) {
        life.alive = false;
        this.push({
          id: id(),
          name: life.name,
          crew: life.crew,
          kind: 'rest',
          text: `chose to rest at ${life.worth.toFixed(2)}×`,
          multiplier: life.worth,
        });
      }
    }
    // Reap the dead and keep the field populated.
    for (const [key, life] of this.others) {
      if (!life.alive && this.tickCount - life.bornAt > 3) this.others.delete(key);
    }
    while (this.others.size < 22) this.spawn();
  }

  announcePlayerLife(s: Settlement): void {
    const kind: FeedKind =
      s.beyond?.bucket === 'legacy'
        ? 'legacy'
        : s.ending === 'sudden-death'
          ? 'death'
          : s.ending === 'fulfil'
            ? 'fulfil'
            : 'you';
    const text =
      s.ending === 'sudden-death'
        ? 'the thread was cut'
        : `banked ${s.payoutMultiplier.toFixed(2)}×`;
    this.push({ id: id(), name: 'You', crew: 'Your Life', kind, text, multiplier: s.payoutMultiplier });
  }

  announce(message: string): void {
    this.push({ id: id(), name: '—', crew: '', kind: 'system', text: message, multiplier: 0 });
  }

  private push(item: FeedItem): void {
    this.items.unshift(item);
    if (this.items.length > 40) this.items.pop();
  }

  feed(): FeedItem[] {
    return [...this.items];
  }

  lives(): OtherLife[] {
    return [...this.others.values()].filter((l) => l.alive);
  }
}
