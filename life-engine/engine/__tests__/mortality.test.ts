import { describe, it, expect } from 'vitest';
import { mortalityFromUniform, survivalProbability } from '../mortality';
import { mulberry32 } from './prng';

describe('mortality distribution', () => {
  const e = 0.03;

  it('is always >= 1', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 100_000; i++) {
      expect(mortalityFromUniform(rng(), e)).toBeGreaterThanOrEqual(1);
    }
  });

  it('produces the instant-bust point mass P(M=1)=e', () => {
    const rng = mulberry32(2);
    const N = 2_000_000;
    let busts = 0;
    for (let i = 0; i < N; i++) if (mortalityFromUniform(rng(), e) === 1) busts++;
    expect(busts / N).toBeCloseTo(e, 2);
  });

  it('empirical survival P(M>=v) matches (1-e)/v', () => {
    const rng = mulberry32(3);
    const N = 3_000_000;
    const targets = [1.5, 2, 5, 10, 20];
    const counts = targets.map(() => 0);
    for (let i = 0; i < N; i++) {
      const m = mortalityFromUniform(rng(), e);
      targets.forEach((v, k) => {
        if (m >= v) counts[k]++;
      });
    }
    targets.forEach((v, k) => {
      const empirical = counts[k] / N;
      const theory = survivalProbability(v, e);
      expect(Math.abs(empirical - theory)).toBeLessThan(0.002);
    });
  });

  it('a death dividend steepens the curve (you die sooner) matching theory', () => {
    const rng = mulberry32(5);
    const mu = 0.35;
    const N = 3_000_000;
    const targets = [1.5, 2, 5, 10];
    const counts = targets.map(() => 0);
    for (let i = 0; i < N; i++) {
      const m = mortalityFromUniform(rng(), e, mu);
      targets.forEach((v, k) => {
        if (m >= v) counts[k]++;
      });
    }
    targets.forEach((v, k) => {
      const empirical = counts[k] / N;
      const theory = survivalProbability(v, e, mu);
      expect(theory).toBeLessThan(survivalProbability(v, e)); // steeper than crash
      expect(Math.abs(empirical - theory)).toBeLessThan(0.002);
    });
  });
});
