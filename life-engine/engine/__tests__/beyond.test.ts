import { describe, it, expect } from 'vitest';
import { beyondMean, beyondProbabilities, resolveBeyond } from '../beyond';
import { DEFAULT_CONFIG } from '../config';
import { mulberry32 } from './prng';

describe('The Beyond', () => {
  const cfg = DEFAULT_CONFIG.beyond;

  it('has mean exactly 1 for every boldness (closed form)', () => {
    for (let b = 0; b <= 1.0001; b += 0.05) {
      expect(beyondMean(b, cfg)).toBeCloseTo(1, 10);
    }
  });

  it('has mean 1 for every configured disposition', () => {
    for (const d of DEFAULT_CONFIG.dispositions) {
      expect(beyondMean(d.beyondBoldness, cfg)).toBeCloseTo(1, 10);
    }
  });

  it('probabilities are valid and sum to 1', () => {
    for (let b = 0; b <= 1.0001; b += 0.1) {
      const p = beyondProbabilities(b, cfg);
      expect(p.legacy).toBeGreaterThanOrEqual(0);
      expect(p.dark).toBeGreaterThanOrEqual(0);
      expect(p.nothing).toBeGreaterThanOrEqual(0);
      expect(p.legacy + p.dark + p.nothing).toBeCloseTo(1, 10);
    }
  });

  it('bolder lives reach the extremes more often (wider spread), same mean', () => {
    const gentle = beyondProbabilities(0.1, cfg);
    const bold = beyondProbabilities(1.0, cfg);
    expect(bold.legacy).toBeGreaterThan(gentle.legacy);
    expect(bold.dark).toBeGreaterThan(gentle.dark);
    expect(bold.nothing).toBeLessThan(gentle.nothing);
  });

  it('empirical Beyond mean converges to 1', () => {
    const rng = mulberry32(7);
    const N = 2_000_000;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += resolveBeyond(rng(), 0.8, cfg).multiplier;
    expect(sum / N).toBeCloseTo(1, 2);
  });
});
