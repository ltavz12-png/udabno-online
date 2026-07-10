/**
 * LifeStage — orchestrates the PixiJS scene: World (sky/tree/social) behind the
 * AvatarView (the life). React feeds it a plain state object via `setInput`; the
 * stage owns the 60fps render loop, smoothing Worth and atmosphere so the life
 * reads as a continuous passage rather than discrete ticks.
 *
 * The avatar is created through a factory so bespoke art can replace the default
 * procedural figure without touching this orchestrator (see docs/ART.md).
 */
import { Application, Container } from 'pixi.js';
import { World } from './World';
import { ProceduralAvatar, type AvatarView } from './AvatarView';
import { lifeStageForWorth, stageProgress, LIFE_STAGES } from '../../engine/worth';
import type { SkinConfig } from '../skins/types';
import type { Ending } from '../../engine/round';
import type { BeyondOutcome } from '../../engine/beyond';
import type { OtherLife } from '../state/social';

export interface StageInput {
  active: boolean; // a life is being lived (or in reckoning)
  worth: number;
  vitality: number;
  pace: 'push' | 'coast' | 'tend';
  dispositionId: string;
  ending: Ending | null;
  beyond: BeyondOutcome | null;
  skin: SkinConfig;
  reducedMotion: boolean;
  social: OtherLife[];
}

type AvatarFactory = () => AvatarView;

export class LifeStage {
  private app: Application | null = null;
  private world = new World();
  private avatarLayer = new Container();
  private avatar: AvatarView;
  private input: StageInput | null = null;
  private displayWorth = 1;
  private displayVitality = 1;
  private lastEnding: Ending | null = null;
  private elapsed = 0;
  private onCue?: (cue: 'birth' | 'milestone' | 'tension' | 'rest' | 'death' | 'legacy') => void;
  private lastStageIndex = 0;

  constructor(private readonly makeAvatar: AvatarFactory = () => new ProceduralAvatar()) {
    this.avatar = this.makeAvatar();
  }

  async init(parent: HTMLElement, onCue?: LifeStage['onCue']): Promise<void> {
    this.onCue = onCue;
    const app = new Application();
    await app.init({
      resizeTo: parent,
      antialias: true,
      backgroundAlpha: 1,
      preference: 'webgl',
      powerPreference: 'high-performance',
    });
    parent.appendChild(app.canvas);
    app.stage.addChild(this.world.container);
    this.avatarLayer.addChild(this.avatar.container);
    app.stage.addChild(this.avatarLayer);
    app.ticker.add(() => this.frame(app.ticker.deltaMS));
    this.app = app;
  }

  setInput(input: StageInput): void {
    this.input = input;
    if (input.ending && input.ending !== this.lastEnding) {
      this.lastEnding = input.ending;
      this.avatar.playEnding(input.ending, input.beyond);
      if (input.ending === 'sudden-death') this.onCue?.('death');
      else if (input.beyond?.bucket === 'legacy') this.onCue?.('legacy');
      else this.onCue?.('rest');
    }
    if (!input.active) this.lastEnding = null;
  }

  private frame(dtMs: number): void {
    const app = this.app;
    if (!app) return;
    const w = app.renderer.width;
    const h = app.renderer.height;
    this.elapsed += dtMs;
    const dtSec = Math.min(0.05, dtMs / 1000);

    const inp = this.input;
    const skin = inp?.skin;
    if (!inp || !skin) return;

    // Smooth Worth & vitality toward targets.
    const targetWorth = inp.active ? Math.max(1, inp.worth) : 1;
    const targetVit = inp.active ? inp.vitality : 1;
    const ease = inp.reducedMotion ? 1 : 1 - Math.pow(0.001, dtSec);
    this.displayWorth += (targetWorth - this.displayWorth) * ease;
    this.displayVitality += (targetVit - this.displayVitality) * ease;

    const idx = LIFE_STAGES.indexOf(lifeStageForWorth(this.displayWorth));
    const prog = stageProgress(this.displayWorth);
    if (idx !== this.lastStageIndex && inp.active) {
      this.lastStageIndex = idx;
      this.onCue?.(idx <= 1 ? 'birth' : 'milestone');
    }

    // Atmosphere: dawn at birth → night as vitality drains / life pushes.
    const tension = inp.active && inp.pace === 'push' ? 0.12 : 0;
    const atmosphere = Math.max(0, Math.min(1, 1 - this.displayVitality * 0.9 + tension));

    this.world.update(
      {
        worth: this.displayWorth,
        stageIndex: idx,
        atmosphere,
        skin,
        width: w,
        height: h,
        reducedMotion: inp.reducedMotion,
        social: inp.social,
      },
      dtSec,
    );

    // Position & fade the avatar.
    this.avatarLayer.x = w * 0.42;
    this.avatarLayer.y = h * 0.8;
    this.avatarLayer.alpha = inp.active ? 1 : 0.5;

    this.avatar.update(
      {
        worth: this.displayWorth,
        stageIndex: idx,
        stageProgress: prog,
        vitality: this.displayVitality,
        pace: inp.pace,
        dispositionId: inp.dispositionId,
        skin,
        reducedMotion: inp.reducedMotion,
      },
      dtMs,
    );
  }

  /** Rebuild the avatar from a different factory (e.g. to hot-swap bespoke art). */
  swapAvatar(factory: AvatarFactory): void {
    this.avatarLayer.removeChildren();
    this.avatar.destroy();
    this.avatar = factory();
    this.avatarLayer.addChild(this.avatar.container);
  }

  destroy(): void {
    this.app?.destroy(true, { children: true });
    this.app = null;
  }
}
