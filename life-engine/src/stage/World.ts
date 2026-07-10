/**
 * The world around the avatar: a layered gradient sky that shifts dawn → day →
 * dusk → night with the life, a horizon, a life-tree that blooms beside the
 * figure as Worth grows, drifting light-motes, and the social field — small
 * distant lights, each an other player's life unfolding in parallel.
 */
import { Container, Graphics, FillGradient, BlurFilter } from 'pixi.js';
import type { SkinConfig } from '../skins/types';
import { hexNum, skyGradientColors } from './colors';
import type { OtherLife } from '../state/social';

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

export interface WorldState {
  worth: number;
  stageIndex: number;
  atmosphere: number; // 0 dawn .. 1 night
  skin: SkinConfig;
  width: number;
  height: number;
  reducedMotion: boolean;
  social: OtherLife[];
}

export class World {
  readonly container = new Container();
  private readonly sky = new Graphics();
  private readonly stars = new Graphics();
  private readonly ground = new Graphics();
  private readonly tree = new Graphics();
  private readonly motesG = new Graphics();
  private readonly socialG = new Graphics();
  private motes: Mote[] = [];
  private lastAtmo = -1;
  private lastW = 0;
  private lastH = 0;
  private starSeed: number[] = [];

  constructor() {
    this.motesG.blendMode = 'add';
    this.stars.blendMode = 'add';
    this.socialG.blendMode = 'add';
    this.socialG.filters = [new BlurFilter({ strength: 2, quality: 2 })];
    this.container.addChild(this.sky, this.stars, this.socialG, this.ground, this.tree, this.motesG);
    for (let i = 0; i < 90; i++) this.starSeed.push(Math.random());
  }

  private ensureMotes(w: number, h: number): void {
    if (this.motes.length) return;
    for (let i = 0; i < 46; i++) {
      this.motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 6,
        vy: -6 - Math.random() * 10,
        r: 0.6 + Math.random() * 1.8,
        a: 0.1 + Math.random() * 0.5,
      });
    }
  }

  update(s: WorldState, dtSec: number): void {
    const { width: w, height: h, skin } = s;
    this.ensureMotes(w, h);

    // Sky gradient — rebuilt only when atmosphere or size changes meaningfully.
    if (Math.abs(s.atmosphere - this.lastAtmo) > 0.015 || w !== this.lastW || h !== this.lastH) {
      this.lastAtmo = s.atmosphere;
      this.lastW = w;
      this.lastH = h;
      const [top, bottom] = skyGradientColors(s.atmosphere, skin.sky);
      const grad = new FillGradient(0, 0, 0, h);
      grad.addColorStop(0, top);
      grad.addColorStop(1, bottom);
      this.sky.clear().rect(0, 0, w, h).fill(grad);

      // Stars fade in as night deepens.
      this.stars.clear();
      const starAlpha = Math.max(0, s.atmosphere - 0.45) * 1.6;
      if (starAlpha > 0.01) {
        for (let i = 0; i < this.starSeed.length; i += 2) {
          const x = this.starSeed[i] * w;
          const y = this.starSeed[i + 1] * h * 0.7;
          this.stars.circle(x, y, 0.8 + this.starSeed[i] * 1.2).fill({ color: 0xffffff, alpha: starAlpha * (0.4 + this.starSeed[i + 1] * 0.6) });
        }
      }

      // Ground / horizon.
      const horizon = h * 0.82;
      this.ground.clear().rect(0, horizon, w, h - horizon).fill({ color: hexNum(skin.ground), alpha: 0.9 });
      this.ground.moveTo(0, horizon).lineTo(w, horizon).stroke({ width: 2, color: hexNum(skin.auraGlow), alpha: 0.15 });
    }

    // Life-tree beside the avatar, growing with worth & stage.
    this.renderTree(s, w, h);

    // Social field — distant lights.
    this.renderSocial(s, w, h);

    // Drifting motes.
    this.motesG.clear();
    for (const m of this.motes) {
      if (!s.reducedMotion) {
        m.x += m.vx * dtSec;
        m.y += m.vy * dtSec;
        if (m.y < -10) {
          m.y = h + 10;
          m.x = Math.random() * w;
        }
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;
      }
      const color = hexNum(skin.sparks[0]);
      this.motesG.circle(m.x, m.y, m.r).fill({ color, alpha: m.a });
    }
  }

  private renderTree(s: WorldState, w: number, h: number): void {
    this.tree.clear();
    const baseX = w * 0.5 + Math.min(w * 0.28, 150);
    const baseY = h * 0.82;
    const growth = Math.min(1, Math.log2(Math.max(1, s.worth)) / 5);
    const trunkH = 20 + growth * (h * 0.32);
    const color = hexNum(s.skin.bloom);
    this.tree.moveTo(baseX, baseY).lineTo(baseX, baseY - trunkH).stroke({ width: 3, color, alpha: 0.35 });
    const branches = Math.floor(growth * 6);
    for (let i = 0; i < branches; i++) {
      const by = baseY - (trunkH * (i + 1)) / (branches + 1);
      const len = 12 + growth * 40 * (1 - i / (branches + 1));
      const dir = i % 2 === 0 ? 1 : -1;
      this.tree
        .moveTo(baseX, by)
        .quadraticCurveTo(baseX + dir * len * 0.6, by - len * 0.3, baseX + dir * len, by - len * 0.5)
        .stroke({ width: 2, color, alpha: 0.3 });
      this.tree.circle(baseX + dir * len, by - len * 0.5, 3 + growth * 3).fill({ color, alpha: 0.4 * growth });
    }
    if (growth > 0.05) this.tree.circle(baseX, baseY - trunkH, 6 + growth * 18).fill({ color, alpha: 0.25 });
  }

  private renderSocial(s: WorldState, w: number, h: number): void {
    this.socialG.clear();
    const n = Math.min(s.social.length, 18);
    for (let i = 0; i < n; i++) {
      const life = s.social[i];
      const x = ((i * 137.5) % 100) / 100 * w * 0.9 + w * 0.05;
      const y = h * 0.16 + ((i * 61) % 100) / 100 * h * 0.5;
      const glow = Math.min(1, Math.log2(Math.max(1, life.worth)) / 5);
      const color = hexNum(life.dispositionId === 'spark' ? '#ffb26b' : life.dispositionId === 'steady' ? '#8fe6c4' : s.skin.auraGlow);
      this.socialG.circle(x, y, 1.5 + glow * 4).fill({ color, alpha: 0.25 + glow * 0.5 });
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
