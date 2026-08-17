import { describe, it, expect } from 'vitest';
import { resolveLife, LifeRound, type Declaration } from '../round';
import { DEFAULT_CONFIG } from '../config';

const cfg = DEFAULT_CONFIG;
const wanderer = cfg.dispositions.find((d) => d.id === 'wanderer')!;
const grand = cfg.ambitions.find((a) => a.id === 'grand')!;

describe('resolveLife (pure money core)', () => {
  it('rest before mortality banks worth', () => {
    const o = resolveLife({
      mortality: 5,
      restWorth: 3,
      target: 12,
      beyondWager: false,
      beyondUniform: 0.5,
      boldness: 0.5,
      cfg,
    });
    expect(o.ending).toBe('rest');
    expect(o.payoutMultiplier).toBeCloseTo(3, 10);
  });

  it('fulfilling the ambition pays the target', () => {
    const o = resolveLife({
      mortality: 20,
      restWorth: Infinity,
      target: 12,
      beyondWager: false,
      beyondUniform: 0.5,
      boldness: 0.5,
      cfg,
    });
    expect(o.ending).toBe('fulfil');
    expect(o.payoutMultiplier).toBeCloseTo(12, 10);
  });

  it('sudden death resolves into the three-outcome Beyond on worth-at-death', () => {
    const o = resolveLife({
      mortality: 2,
      restWorth: 8,
      target: 12,
      beyondWager: false,
      beyondUniform: 0.5,
      boldness: 0.5,
      cfg,
    });
    expect(o.ending).toBe('sudden-death');
    expect(o.beyond).not.toBeNull();
    // payout = worthAtDeath · deathBeyondMean · bucketMultiplier (> 0).
    expect(o.payoutMultiplier).toBeCloseTo(2 * cfg.deathBeyondMean * o.beyond!.multiplier, 10);
    expect(o.payoutMultiplier).toBeGreaterThan(0);
  });

  it('an instant end at birth leaves nothing behind', () => {
    const o = resolveLife({
      mortality: 1,
      restWorth: 8,
      target: 12,
      beyondWager: false,
      beyondUniform: 0.5,
      boldness: 0.5,
      cfg,
    });
    expect(o.ending).toBe('sudden-death');
    expect(o.payoutMultiplier).toBe(0);
  });

  it('Beyond wager multiplies the banked worth by the drawn bucket', () => {
    // u=0 lands in Legacy for boldness>0.
    const o = resolveLife({
      mortality: 5,
      restWorth: 3,
      target: 12,
      beyondWager: true,
      beyondUniform: 0,
      boldness: 1,
      cfg,
    });
    expect(o.beyond?.bucket).toBe('legacy');
    expect(o.payoutMultiplier).toBeCloseTo(3 * cfg.beyond.legacyMultiplier, 10);
  });
});

describe('LifeRound (live wrapper)', () => {
  const decl: Declaration = {
    stake: 1,
    disposition: wanderer,
    ambition: grand,
    beyondWager: false,
  };

  it('never exposes mortality in the client view', () => {
    const round = new LifeRound(decl, { serverSeed: 's', clientSeed: 'c', nonce: 1 }, cfg);
    const view = round.view();
    expect(view).not.toHaveProperty('mortality');
    expect(view.worth).toBeGreaterThanOrEqual(1);
  });

  it('resting yields a settled outcome', () => {
    const round = new LifeRound(decl, { serverSeed: 's', clientSeed: 'c', nonce: 2 }, cfg);
    round.setPace('push');
    round.tick(500);
    const outcome = round.rest();
    expect(['rest', 'fulfil', 'sudden-death']).toContain(outcome.ending);
    expect(round.view().phase).toBe('reckoning');
  });

  it('re-declare can only lower the ambition', () => {
    const round = new LifeRound(decl, { serverSeed: 's', clientSeed: 'c', nonce: 3 }, cfg);
    round.reDeclare(3);
    expect(round.view().target).toBe(3);
    round.reDeclare(9); // higher — ignored
    expect(round.view().target).toBe(3);
  });
});
