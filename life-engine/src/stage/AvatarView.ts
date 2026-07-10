/**
 * AvatarView — the abstraction that keeps the character system independent of
 * game logic. The default `ProceduralAvatar` renders a code-only silhouette that
 * morphs across the engine's life stages (infant → elder). Bespoke art (sprite
 * sheets, Spine/skeletal rigs) can replace it by implementing this same
 * interface and swapping the factory in LifeStage — no engine or UI change
 * required. See docs/ART.md.
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

/** Per-stage silhouette proportions, interpolated for smooth "growing up". */
interface Proportions {
  height: number;
  headR: number;
  bodyW: number;
  stoop: number;
}

const STAGE_PROPS: Proportions[] = [
  { height: 26, headR: 11, bodyW: 13, stoop: 0.0 }, // infant — big head, tiny body
  { height: 46, headR: 12, bodyW: 15, stoop: 0.0 }, // child
  { height: 70, headR: 12, bodyW: 17, stoop: 0.02 }, // youth
  { height: 92, headR: 13, bodyW: 20, stoop: 0.04 }, // adult
  { height: 100, headR: 13, bodyW: 22, stoop: 0.06 }, // prime
  { height: 90, headR: 13, bodyW: 20, stoop: 0.2 }, // elder — stooped
];

function lerpProps(i: number, f: number): Proportions {
  const a = STAGE_PROPS[Math.min(STAGE_PROPS.length - 1, i)];
  const b = STAGE_PROPS[Math.min(STAGE_PROPS.length - 1, i + 1)];
  return {
    height: a.height + (b.height - a.height) * f,
    headR: a.headR + (b.headR - a.headR) * f,
    bodyW: a.bodyW + (b.bodyW - a.bodyW) * f,
    stoop: a.stoop + (b.stoop - a.stoop) * f,
  };
}

export class ProceduralAvatar implements AvatarView {
  readonly container = new Container();
  private readonly auraFar = new Graphics();
  private readonly auraNear = new Graphics();
  private readonly figure = new Graphics();
  private readonly soul = new Graphics();
  private endingT = -1;
  private endingKind: Ending | null = null;
  private endingBucket: BeyondOutcome['bucket'] | null = null;

  constructor() {
    const blurFar = new BlurFilter({ strength: 24, quality: 4 });
    const blurNear = new BlurFilter({ strength: 10, quality: 4 });
    this.auraFar.filters = [blurFar];
    this.auraNear.filters = [blurNear];
    this.auraFar.blendMode = 'add';
    this.auraNear.blendMode = 'add';
    this.soul.blendMode = 'add';
    this.container.addChild(this.auraFar, this.auraNear, this.figure, this.soul);
  }

  private dispositionTint(skin: SkinConfig): number {
    const glow = hexNum(skin.auraGlow);
    if (this.dispId === 'spark') return mix(glow, 0xff7a3a, 0.5);
    if (this.dispId === 'steady') return mix(glow, 0x6ad6b0, 0.4);
    return glow;
  }
  private dispId = 'wanderer';

  update(state: AvatarState, elapsed: number): void {
    this.dispId = state.dispositionId;
    const p = lerpProps(state.stageIndex, state.stageProgress);
    const skin = state.skin;
    const breath = state.reducedMotion ? 0 : Math.sin(elapsed * 0.003) * 2;
    const sway = state.reducedMotion ? 0 : Math.sin(elapsed * 0.0016) * (state.pace === 'push' ? 3 : 1);

    // --- Aura: grows with worth (log), brightens on push, dims as vitality falls.
    const auraR = 30 + Math.log2(Math.max(1, state.worth)) * 26;
    const paceBoost = state.pace === 'push' ? 1.35 : state.pace === 'tend' ? 0.8 : 1;
    const vitalityGlow = 0.35 + state.vitality * 0.65;
    const core = hexNum(skin.auraCore);
    const glow = this.dispositionTint(skin);

    this.auraFar.clear();
    this.auraFar
      .circle(0, -p.height * 0.5, auraR * 2.1 * paceBoost)
      .fill({ color: glow, alpha: 0.10 * vitalityGlow });
    this.auraNear.clear();
    this.auraNear
      .circle(0, -p.height * 0.5, auraR * paceBoost)
      .fill({ color: glow, alpha: 0.22 * vitalityGlow })
      .circle(0, -p.height * 0.5, auraR * 0.5 * paceBoost)
      .fill({ color: core, alpha: 0.3 * vitalityGlow });

    // --- Figure silhouette.
    this.figure.clear();
    if (this.endingKind === 'sudden-death' && this.endingT >= 0) {
      // handled in playEnding animation via soul; fade figure
      this.figure.alpha = Math.max(0, 1 - this.endingT * 1.5);
    } else {
      this.figure.alpha = 1;
    }
    const figColor = hexNum(skin.figure);
    const accent = hexNum(skin.figureAccent);
    const baseY = 0;
    const topY = baseY - p.height;
    const stoopX = p.stoop * p.height * 0.4 + sway;

    // Body: a tapered capsule from base to shoulders.
    const shoulderY = topY + p.headR * 1.6;
    const halfW = p.bodyW / 2;
    this.figure
      .moveTo(-halfW * 0.7, baseY)
      .quadraticCurveTo(-halfW, (baseY + shoulderY) / 2, -halfW * 0.9 + stoopX, shoulderY)
      .lineTo(halfW * 0.9 + stoopX, shoulderY)
      .quadraticCurveTo(halfW, (baseY + shoulderY) / 2, halfW * 0.7, baseY)
      .closePath()
      .fill({ color: figColor, alpha: 0.96 });

    // Head.
    this.figure
      .circle(stoopX, shoulderY - p.headR * 0.7 + breath * 0.2, p.headR)
      .fill({ color: figColor, alpha: 0.98 });

    // A faint accent sash — reads as attire that grows with the life.
    if (state.stageIndex >= 2) {
      this.figure
        .moveTo(-halfW * 0.8 + stoopX, shoulderY + 4)
        .lineTo(halfW * 0.3 + stoopX, baseY - p.height * 0.25)
        .stroke({ width: 3, color: accent, alpha: 0.5 });
    }

    this.container.y = breath; // gentle vertical breath

    // --- Ending animations advance here.
    if (this.endingT >= 0) {
      this.endingT += elapsed > 0 ? 0.016 : 0.016;
      this.renderEnding(skin, topY);
    } else {
      this.soul.clear();
    }
  }

  playEnding(ending: Ending, beyond: BeyondOutcome | null): void {
    this.endingKind = ending;
    this.endingBucket = beyond?.bucket ?? null;
    this.endingT = 0;
  }

  private renderEnding(skin: SkinConfig, topY: number): void {
    const t = this.endingT;
    this.soul.clear();
    const rise = -t * 90;
    if (this.endingKind === 'sudden-death') {
      // A star falls — quiet, not violent: a point of light streaks down and out.
      const a = Math.max(0, 1 - t * 0.8);
      this.soul
        .circle(0, topY + t * 140, 6 + t * 4)
        .fill({ color: hexNum(skin.auraCore), alpha: a });
      return;
    }
    // Rest / fulfil / beyond: the soul-light rises and resolves.
    const bucket = this.endingBucket;
    const color =
      bucket === 'legacy' ? hexNum(skin.legacy) : bucket === 'dark' ? hexNum(skin.figureAccent) : hexNum(skin.auraGlow);
    const bloom = bucket === 'legacy' ? 1.4 : bucket === 'dark' ? 0.5 : 0.9;
    const a = Math.max(0, 1 - t * 0.4);
    this.soul
      .circle(0, topY * 0.6 + rise, (24 + t * 40) * bloom)
      .fill({ color, alpha: 0.5 * a })
      .circle(0, topY * 0.6 + rise, (8 + t * 8) * bloom)
      .fill({ color: hexNum(skin.auraCore), alpha: 0.8 * a });
    // Legacy scatters lasting motes (a constellation).
    if (bucket === 'legacy') {
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * Math.PI * 2 + t;
        const rad = 30 + t * 60;
        this.soul
          .circle(Math.cos(ang) * rad, topY * 0.6 + rise + Math.sin(ang) * rad, 2.5)
          .fill({ color, alpha: a });
      }
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
