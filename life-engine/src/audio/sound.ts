/**
 * Sound manager.
 *
 * Ships with a self-contained Web Audio synthesizer so the product makes sound
 * with ZERO audio assets — an ambient pad that shifts with the life stage, plus
 * event cues (birth, milestone, tension, death, legacy). When an operator drops
 * in produced audio, the same interface is trivially backed by Howler.js (see
 * ART.md / INTEGRATION.md); the game only ever calls `cue()` / `setStage()`.
 *
 * Respects autoplay policy: the AudioContext is created/resumed only on the
 * first user interaction via `unlock()`.
 */

export type Cue = 'birth' | 'milestone' | 'tension' | 'rest' | 'death' | 'legacy' | 'click';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private muted = false;
  private unlocked = false;
  private currentStage = 0;

  unlock(): void {
    if (this.unlocked) return;
    const Ctor =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    this.startPad();
    this.unlocked = true;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.05);
    }
  }

  /** Shift the ambient pad as the life ages (0..5 stage index). */
  setStage(stageIndex: number): void {
    if (!this.ctx || !this.padGain || stageIndex === this.currentStage) return;
    this.currentStage = stageIndex;
    const base = 110 * Math.pow(2, stageIndex / 12); // gentle rise per stage
    this.padOscs.forEach((osc, i) => {
      const ratios = [1, 1.5, 2.0, 2.996];
      osc.frequency.setTargetAtTime(base * ratios[i % ratios.length], this.ctx!.currentTime, 0.8);
    });
  }

  cue(cue: Cue): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime;
    const spec: Record<Cue, { f: number; type: OscillatorType; dur: number; gain: number; slide?: number }> = {
      birth: { f: 440, type: 'sine', dur: 1.2, gain: 0.3, slide: 660 },
      milestone: { f: 660, type: 'triangle', dur: 0.5, gain: 0.25, slide: 880 },
      tension: { f: 150, type: 'sawtooth', dur: 0.6, gain: 0.12, slide: 90 },
      rest: { f: 520, type: 'sine', dur: 1.6, gain: 0.28, slide: 390 },
      death: { f: 220, type: 'sine', dur: 1.8, gain: 0.3, slide: 70 },
      legacy: { f: 523, type: 'triangle', dur: 2.2, gain: 0.32, slide: 1046 },
      click: { f: 300, type: 'square', dur: 0.05, gain: 0.08 },
    };
    const s = spec[cue];
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = s.type;
    osc.frequency.setValueAtTime(s.f, t);
    if (s.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, s.slide), t + s.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(s.gain, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + s.dur + 0.05);
  }

  private startPad(): void {
    if (!this.ctx || !this.master) return;
    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0.12;
    this.padGain.connect(this.master);
    const base = 110;
    const ratios = [1, 1.5, 2.0, 2.996];
    for (const r of ratios) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = base * r;
      const detune = this.ctx.createGain();
      detune.gain.value = 1;
      osc.connect(detune);
      detune.connect(this.padGain);
      osc.start();
      this.padOscs.push(osc);
    }
  }

  dispose(): void {
    this.padOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* already stopped */
      }
    });
    this.padOscs = [];
    this.ctx?.close();
    this.ctx = null;
    this.unlocked = false;
  }
}

export const sound = new SoundManager();
