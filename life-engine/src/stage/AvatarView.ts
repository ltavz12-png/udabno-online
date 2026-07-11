/**
 * AvatarView — the abstraction that keeps the character system independent of
 * game logic. The default `ProceduralAvatar` renders a code-only, articulated
 * human silhouette (head, torso, two arms, two legs) that visibly ages across
 * the engine's life stages (infant → elder), walks the path of life, and
 * resolves its reckoning — including The Beyond — as a large, legible moment.
 *
 * Bespoke art (sprite sheets, Spine/skeletal rigs) can replace it by
 * implementing this same interface and swapping the factory in LifeStage — no
 * engine or UI change required. See docs/ART.md.
 */
import { Container, Graphics, BlurFilter } from 'pixi.js';
import type { SkinConfig } from '../skins/types';
import type { Ending } from '../../engine/round';
import type { BeyondOutcome } from '../../engine/beyond';
import { hexNum, mix } from './colors';

export interface AvatarState {
  readonly worth: number;
  readonly stageIndex: number;
  readonly stageProgress: number;
  readonly vitality: number;
  readonly pace: 'push' | 'coast' | 'tend';
  readonly dispositionId: string;
  readonly skin: SkinConfig;
  readonly reducedMotion: boolean;
}

export interface AvatarView {
  readonly container: Container;
  update(state: AvatarState, elapsed: number): void;
  playEnding(ending: Ending, beyond: BeyondOutcome | null): void;
  destroy(): void;
}

/** Per-stage articulated proportions (in px), interpolated for smooth aging. */
interface Proportions {
  legLen: number;
  torsoLen: number;
  armLen: number;
  headR: number;
  shoulderW: number;
  hipW: number;
  thickness: number;
  stoop: number;
  walkAmp: number;
  staff: number; // 0..1 staff presence (elder leans on one)
}

const STAGE_PROPS: Proportions[] = [
  // infant — big head, tiny curled body, no real walk
  { legLen: 16, torsoLen: 20, armLen: 14, headR: 18, shoulderW: 16, hipW: 14, thickness: 9, stoop: 0.35, walkAmp: 0.05, staff: 0 },
  // child
  { legLen: 34, torsoLen: 30, armLen: 26, headR: 17, shoulderW: 22, hipW: 18, thickness: 8, stoop: 0.06, walkAmp: 0.55, staff: 0 },
  // youth
  { legLen: 52, torsoLen: 40, armLen: 38, headR: 17, shoulderW: 28, hipW: 22, thickness: 8.5, stoop: 0.03, walkAmp: 0.6, staff: 0 },
  // adult
  { legLen: 66, torsoLen: 50, armLen: 48, headR: 18, shoulderW: 36, hipW: 27, thickness: 10, stoop: 0.02, walkAmp: 0.5, staff: 0 },
  // prime — strongest, broadest
  { legLen: 70, torsoLen: 54, armLen: 52, headR: 18, shoulderW: 42, hipW: 30, thickness: 11, stoop: 0.03, walkAmp: 0.42, staff: 0 },
  // elder — shorter, stooped, a staff
  { legLen: 60, torsoLen: 48, armLen: 46, headR: 18, shoulderW: 36, hipW: 30, thickness: 10, stoop: 0.32, walkAmp: 0.28, staff: 1 },
];

function lerpProps(i: number, f: number): Proportions {
  const a = STAGE_PROPS[Math.min(STAGE_PROPS.length - 1, i)];
  const b = STAGE_PROPS[Math.min(STAGE_PROPS.length - 1, i + 1)];
  const L = (k: keyof Proportions) => a[k] + (b[k] - a[k]) * f;
  return {
    legLen: L('legLen'), torsoLen: L('torsoLen'), armLen: L('armLen'), headR: L('headR'),
    shoulderW: L('shoulderW'), hipW: L('hipW'), thickness: L('thickness'), stoop: L('stoop'),
    walkAmp: L('walkAmp'), staff: L('staff'),
  };
}

export class ProceduralAvatar implements AvatarView {
  readonly container = new Container();
  private readonly auraFar = new Graphics();
  private readonly auraNear = new Graphics();
  private readonly shadow = new Graphics();
  private readonly figure = new Graphics();
  private readonly soul = new Graphics();
  private walkPhase = 0;
  private endingT = -1;
  private endingKind: Ending | null = null;
  private endingBucket: BeyondOutcome['bucket'] | null = null;
  private dispId = 'wanderer';

  constructor() {
    this.auraFar.filters = [new BlurFilter({ strength: 30, quality: 4 })];
    this.auraNear.filters = [new BlurFilter({ strength: 12, quality: 4 })];
    this.shadow.filters = [new BlurFilter({ strength: 8, quality: 3 })];
    this.auraFar.blendMode = 'add';
    this.auraNear.blendMode = 'add';
    this.soul.blendMode = 'add';
    this.container.addChild(this.auraFar, this.auraNear, this.shadow, this.figure, this.soul);
  }

  private tint(skin: SkinConfig): number {
    const glow = hexNum(skin.auraGlow);
    if (this.dispId === 'spark') return mix(glow, 0xff6a2a, 0.55);
    if (this.dispId === 'steady') return mix(glow, 0x54e0b0, 0.5);
    return glow;
  }

  update(state: AvatarState, elapsedDelta: number): void {
    this.dispId = state.dispositionId;
    const skin = state.skin;
    const p = lerpProps(state.stageIndex, state.stageProgress);
    const dead = this.endingKind === 'sudden-death' && this.endingT >= 0;

    // Advance a walk cycle; faster on Push, calmest on Tend.
    const speed = state.reducedMotion ? 0 : state.pace === 'push' ? 0.012 : state.pace === 'tend' ? 0.004 : 0.007;
    this.walkPhase += elapsedDelta * speed;
    const swing = Math.sin(this.walkPhase) * p.walkAmp;
    const bob = state.reducedMotion ? 0 : Math.abs(Math.cos(this.walkPhase)) * p.walkAmp * 4;
    const breath = state.reducedMotion ? 0 : Math.sin(this.walkPhase * 0.4) * 1.5;

    // Geometry (feet at y=0, growing upward -y).
    const hipY = -p.legLen - bob;
    const shoulderY = hipY - p.torsoLen;
    const stoopX = p.stoop * (p.torsoLen + p.legLen) * 0.28;
    const headY = shoulderY - p.headR * 1.05 + breath * 0.3;

    // --- Aura: grows with worth (log), brighter on Push, dims with vitality.
    const auraR = 46 + Math.log2(Math.max(1, state.worth)) * 30;
    const paceBoost = state.pace === 'push' ? 1.4 : state.pace === 'tend' ? 0.82 : 1;
    const vitGlow = 0.4 + state.vitality * 0.6;
    const core = hexNum(skin.auraCore);
    const glow = this.tint(skin);
    const auraCY = (shoulderY + headY) / 2;

    this.auraFar.clear();
    this.auraFar.circle(stoopX * 0.5, auraCY, auraR * 2.2 * paceBoost).fill({ color: glow, alpha: 0.12 * vitGlow });
    this.auraNear.clear();
    this.auraNear
      .circle(stoopX * 0.5, auraCY, auraR * paceBoost).fill({ color: glow, alpha: 0.24 * vitGlow })
      .circle(stoopX * 0.5, headY, auraR * 0.45 * paceBoost).fill({ color: core, alpha: 0.34 * vitGlow });

    // --- Ground shadow anchors the figure to the path.
    this.shadow.clear();
    this.shadow.ellipse(0, 4, p.shoulderW * 0.9, 7).fill({ color: 0x000000, alpha: 0.28 });

    // --- Figure.
    this.figure.clear();
    this.figure.alpha = dead ? Math.max(0, 1 - this.endingT * 1.4) : 1;
    const skinCol = hexNum(skin.figure);
    const accent = hexNum(skin.figureAccent);
    const th = p.thickness;
    this.limbColor = skinCol;

    const hipL = { x: -p.hipW / 2 + stoopX * 0.4, y: hipY };
    const hipR = { x: p.hipW / 2 + stoopX * 0.4, y: hipY };
    const shoL = { x: -p.shoulderW / 2 + stoopX, y: shoulderY };
    const shoR = { x: p.shoulderW / 2 + stoopX, y: shoulderY };

    // Legs (swing opposite each other).
    const legReach = p.legLen * 0.5;
    this.limb(hipL, { x: hipL.x - swing * legReach, y: 0 }, th);
    this.limb(hipR, { x: hipR.x + swing * legReach, y: 0 }, th);

    // Torso — a tapered trunk from hips to shoulders.
    this.figure
      .moveTo(hipL.x, hipL.y)
      .lineTo(shoL.x, shoL.y)
      .lineTo(shoR.x, shoR.y)
      .lineTo(hipR.x, hipR.y)
      .closePath()
      .fill({ color: skinCol, alpha: 0.97 });

    // Arms (swing opposite the legs). Elder's right arm holds a staff (still).
    const armReach = p.armLen;
    const armSwing = swing * 0.8;
    this.limb(shoL, { x: shoL.x + armSwing * armReach * 0.5, y: shoulderY + armReach }, th * 0.85);
    if (p.staff > 0.4) {
      const handX = shoR.x + 10, handY = shoulderY + armReach;
      this.limb(shoR, { x: handX, y: handY }, th * 0.85);
      // staff
      this.figure.moveTo(handX + 4, handY - armReach * 0.3).lineTo(handX + 8, 2).stroke({ width: 3, color: accent, alpha: 0.6, cap: 'round' });
    } else {
      this.limb(shoR, { x: shoR.x - armSwing * armReach * 0.5, y: shoulderY + armReach }, th * 0.85);
    }

    // Neck + head.
    this.figure.moveTo(stoopX, shoulderY).lineTo(stoopX, headY + p.headR * 0.6).stroke({ width: th * 0.7, color: skinCol, cap: 'round' });
    this.figure.circle(stoopX, headY, p.headR).fill({ color: skinCol, alpha: 0.99 });

    // Attire accent that accrues with the life (a sash, then a mantle).
    if (state.stageIndex >= 2) {
      this.figure.moveTo(shoL.x, shoL.y + 2).lineTo(hipR.x, hipY - 2).stroke({ width: 3.5, color: accent, alpha: 0.5, cap: 'round' });
    }
    if (state.stageIndex >= 4) {
      this.figure.moveTo(shoL.x, shoL.y).quadraticCurveTo(stoopX, shoulderY + p.torsoLen * 0.7, shoR.x, shoR.y).stroke({ width: 2.5, color: accent, alpha: 0.4 });
    }

    // --- Endings.
    if (this.endingT >= 0) {
      this.endingT += Math.min(0.04, elapsedDelta * 0.016);
      this.renderEnding(skin, headY);
    } else {
      this.soul.clear();
    }
  }

  private limb(a: { x: number; y: number }, b: { x: number; y: number }, width: number): void {
    this.figure.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width, color: this.limbColor, cap: 'round', join: 'round' });
  }
  private limbColor = 0xf4e4c8;

  playEnding(ending: Ending, beyond: BeyondOutcome | null): void {
    this.endingKind = ending;
    this.endingBucket = beyond?.bucket ?? null;
    this.endingT = 0;
  }

  private renderEnding(skin: SkinConfig, headY: number): void {
    const t = this.endingT;
    this.soul.clear();

    if (this.endingKind === 'sudden-death') {
      // A star falls — quiet, not violent: the light streaks down and out.
      const a = Math.max(0, 1 - t * 0.7);
      const y = headY + t * 220;
      this.soul.circle(0, y, 10 + t * 5).fill({ color: hexNum(skin.auraCore), alpha: a });
      this.soul.circle(0, y - 30, 4).fill({ color: hexNum(skin.auraCore), alpha: a * 0.5 });
      return;
    }

    // Rest / fulfil / Beyond — the soul-light rises and resolves, large & central.
    const rise = headY - t * 150;
    const bucket = this.endingBucket;
    const color =
      bucket === 'legacy' ? hexNum(skin.legacy) : bucket === 'dark' ? hexNum(skin.figureAccent) : hexNum(skin.auraGlow);
    const bloom = bucket === 'legacy' ? 1.8 : bucket === 'dark' ? 0.55 : 1.0;
    const a = Math.max(0, 1 - t * 0.32);

    // Rising soul orb.
    this.soul
      .circle(0, rise, (40 + t * 55) * bloom).fill({ color, alpha: 0.42 * a })
      .circle(0, rise, (16 + t * 14) * bloom).fill({ color: hexNum(skin.auraCore), alpha: 0.85 * a });

    if (bucket === 'legacy') {
      // A lasting constellation blooms outward.
      const ringA = Math.max(0, 0.6 - t * 0.5);
      this.soul.circle(0, rise, 30 + t * 120).stroke({ width: 2, color, alpha: ringA });
      const motes = 12;
      for (let i = 0; i < motes; i++) {
        const ang = (i / motes) * Math.PI * 2 + t * 0.6;
        const rad = 40 + t * 130;
        const mx = Math.cos(ang) * rad;
        const my = rise + Math.sin(ang) * rad * 0.8;
        this.soul.circle(mx, my, 3 + Math.sin(t * 3 + i) * 1.2).fill({ color, alpha: a });
        this.soul.circle(mx, my, 1.4).fill({ color: hexNum(skin.auraCore), alpha: a });
      }
    } else if (bucket === 'dark') {
      // The light dims quietly into the dark — a slow contraction.
      const dimR = Math.max(0, 22 * (1 - t * 0.6));
      this.soul.circle(0, rise, dimR).fill({ color: hexNum(skin.auraCore), alpha: a * 0.4 });
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
