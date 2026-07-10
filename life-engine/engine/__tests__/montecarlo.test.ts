import { describe, it, expect } from 'vitest';
import { STRATEGIES, runBucket } from './simulate';
import { LifeRound, type Declaration } from '../round';
import { DEFAULT_CONFIG } from '../config';
import { mulberry32 } from './prng';

const TARGET_RTP = 1 - DEFAULT_CONFIG.houseEdge;

// Rounds per bucket. Override with MC_ROUNDS for a heavier local run.
const ROUNDS = Number(process.env.MC_ROUNDS ?? 1_500_000);

describe('Monte-Carlo RTP invariance', () => {
  it('every strategy bucket realises RTP = 97% (within 0.1% or 4·SE)', () => {
    STRATEGIES.forEach((strategy, i) => {
      const r = runBucket(strategy, ROUNDS, 1000 + i);
      // eslint-disable-next-line no-console
      console.log(
        `  ${r.name.padEnd(40)} RTP=${(r.rtp * 100).toFixed(3)}% ` +
          `dev=${(r.deviation * 100).toFixed(3)}% SE=${(r.stdError * 100).toFixed(3)}% ` +
          `${r.withinTolerance ? 'OK' : 'FAIL'}`,
      );
      expect(r.withinTolerance).toBe(true);
    });
  });

  it('the canonical low-variance bucket hits the tight ±0.1% band', () => {
    // fulfil@2 has low variance; a few million rounds pins it to ±0.1% absolutely.
    const r = runBucket(STRATEGIES[0], Math.max(ROUNDS, 3_000_000), 4242);
    expect(Math.abs(r.rtp - TARGET_RTP)).toBeLessThan(0.001);
  });

  it('pacing (push/coast/tend/re-declare) is EV-neutral via the live round', () => {
    // Drives the real-time LifeRound with M-independent random pacing and rest
    // timing to prove the time path preserves EV.
    const rng = mulberry32(9090);
    const N = 120_000;
    const wanderer = DEFAULT_CONFIG.dispositions[1];
    const grand = DEFAULT_CONFIG.ambitions[2];
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      const decl: Declaration = {
        stake: 1,
        disposition: wanderer,
        ambition: grand,
        beyondWager: rng() < 0.5,
      };
      const round = new LifeRound(
        decl,
        { serverSeed: `s${i}`, clientSeed: 'crew', nonce: i },
        DEFAULT_CONFIG,
      );
      const restAfter = Math.floor(rng() * 40) + 1; // rest after a random # of ticks
      let alive = true;
      let ticks = 0;
      while (alive && ticks < restAfter) {
        const roll = rng();
        round.setPace(roll < 0.4 ? 'push' : roll < 0.8 ? 'coast' : 'tend');
        alive = round.tick(120);
        ticks++;
      }
      const outcome = alive ? round.rest() : round.view().outcome!;
      sum += outcome.payoutMultiplier;
      sumSq += outcome.payoutMultiplier * outcome.payoutMultiplier;
    }
    const rtp = sum / N;
    const se = Math.sqrt(Math.max(0, sumSq / N - rtp * rtp) / N);
    // Random resting (independent of M) yields EV = 1 - e; allow 4·SE.
    expect(Math.abs(rtp - TARGET_RTP)).toBeLessThan(Math.max(0.004, 4 * se));
  });
});
