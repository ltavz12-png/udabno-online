/**
 * Mortality point M — the single hidden outcome per round.
 *
 * We generalise the crash distribution with a "death dividend" μ = deathBeyondMean
 * ∈ [0, 1). When dying pays a three-outcome Beyond worth (on average) μ × the
 * worth-at-death, we fund it by steepening the mortality curve by exactly the
 * right amount so RTP stays fixed and identical for every strategy.
 *
 * Given a uniform u ∈ [0, 1) and house edge e:
 *
 *     M = max(1, ((1 - e) / (1 - u)) ^ (1 - μ))
 *
 * This yields, for every v ≥ 1:
 *
 *     P(M ≥ v) = (1 - e) · v ^ (-1/(1-μ)),     P(M = 1) = e.
 *
 * With μ = 0 this is exactly the standard crash law P(M ≥ v) = (1-e)/v. With
 * μ > 0 the curve is steeper (you die sooner on average), and that lost upside
 * is returned as the death Beyond — netting to the same 97% RTP. Full proof and
 * EV consequences are in MATH.md.
 *
 * M is kept as a full-precision float (no quantisation) so the identity is exact
 * for every possible rest worth — the source of strategy-independent RTP.
 */

export function mortalityFromUniform(u: number, houseEdge: number, deathBeyondMean = 0): number {
  if (u < 0 || u >= 1) throw new Error(`uniform out of range: ${u}`);
  if (houseEdge < 0 || houseEdge >= 1) throw new Error(`houseEdge out of range: ${houseEdge}`);
  if (deathBeyondMean < 0 || deathBeyondMean >= 1) {
    throw new Error(`deathBeyondMean out of range: ${deathBeyondMean}`);
  }
  const base = (1 - houseEdge) / (1 - u);
  const m = Math.pow(base, 1 - deathBeyondMean);
  return m < 1 ? 1 : m;
}

/** Survival function P(M ≥ v) — used in tests and the fairness explainer. */
export function survivalProbability(v: number, houseEdge: number, deathBeyondMean = 0): number {
  if (v <= 1) return 1;
  return (1 - houseEdge) * Math.pow(v, -1 / (1 - deathBeyondMean));
}

/** Display helper: round a multiplier to 2 decimals for UI only (never used in math). */
export function displayMultiplier(m: number): number {
  return Math.floor(m * 100) / 100;
}
