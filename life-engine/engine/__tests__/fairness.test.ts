import { describe, it, expect } from 'vitest';
import {
  deriveFairness,
  hashServerSeed,
  verifyServerSeed,
  uniformFromDigest,
} from '../fairness';
import { verifyRound } from '../verify';
import { mulberry32 } from './prng';
import { hmacSha256, utf8 } from '../crypto/sha256';

describe('provably-fair derivation', () => {
  it('is deterministic and reproducible from seeds', () => {
    const a = deriveFairness({ serverSeed: 'srv', clientSeed: 'cli', nonce: 7 });
    const b = deriveFairness({ serverSeed: 'srv', clientSeed: 'cli', nonce: 7 });
    expect(a).toEqual(b);
    expect(a.u).toBeGreaterThanOrEqual(0);
    expect(a.u).toBeLessThan(1);
  });

  it('changes with nonce and client seed', () => {
    const base = deriveFairness({ serverSeed: 'srv', clientSeed: 'cli', nonce: 1 });
    expect(deriveFairness({ serverSeed: 'srv', clientSeed: 'cli', nonce: 2 }).u).not.toBe(base.u);
    expect(deriveFairness({ serverSeed: 'srv', clientSeed: 'xxx', nonce: 1 }).u).not.toBe(base.u);
  });

  it('verifies a server seed against its commitment', () => {
    const hash = hashServerSeed('super-secret-seed');
    expect(verifyServerSeed('super-secret-seed', hash)).toBe(true);
    expect(verifyServerSeed('wrong-seed', hash)).toBe(false);
  });

  it('verifyRound reproduces the round and confirms the commitment', () => {
    const commitment = hashServerSeed('the-server-seed');
    const report = verifyRound('the-server-seed', 'player-seed', 42, commitment);
    expect(report.commitmentMatches).toBe(true);
    expect(report.mortality).toBeGreaterThanOrEqual(1);
    // Re-deriving independently gives the same M.
    const again = verifyRound('the-server-seed', 'player-seed', 42);
    expect(again.mortality).toBe(report.mortality);
  });

  it('extracted uniforms are ~uniformly distributed', () => {
    const rng = mulberry32(999);
    const buckets = new Array(10).fill(0);
    const N = 100_000;
    for (let i = 0; i < N; i++) {
      const seed = Math.floor(rng() * 1e9).toString(36);
      const digest = hmacSha256(utf8(seed), utf8(`c:${i}`));
      const u = uniformFromDigest(digest);
      buckets[Math.min(9, Math.floor(u * 10))]++;
    }
    // Each decile should hold ~10% (± a loose tolerance).
    for (const c of buckets) {
      expect(c / N).toBeGreaterThan(0.09);
      expect(c / N).toBeLessThan(0.11);
    }
  });
});
