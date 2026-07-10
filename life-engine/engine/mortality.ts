/**
 * Mortality point M — the single hidden outcome per round.
 *
 * We use the standard crash distribution, generalised. Given house edge e and a
 * uniform draw u ∈ [0, 1):
 *
 *     M = max(1, (1 - e) / (1 - u))
 *
 * This yields, for every v ≥ 1:
 *
 *     P(M ≥ v) = (1 - e) / v          and          P(M = 1) = e
 *
 * Proof and EV consequences are in MATH.md. The crucial property: a player who
 * commits to rest at worth v wins v with probability P(M ≥ v) = (1-e)/v, so
 *
 *     EV = v · (1-e)/v = (1 - e)   for every target v.
 *
 * M is kept as a full-precision float (no quantisation) so the identity is
 * exact for every possible rest worth — the source of strategy-independent RTP.
 */

export function mortalityFromUniform(u: number, houseEdge: number): number {
  if (u < 0 || u >= 1) throw new Error(`uniform out of range: ${u}`);
  if (houseEdge < 0 || houseEdge >= 1) throw new Error(`houseEdge out of range: ${houseEdge}`);
  const m = (1 - houseEdge) / (1 - u);
  return m < 1 ? 1 : m;
}

/** Survival function P(M ≥ v) — used in tests and the fairness explainer. */
export function survivalProbability(v: number, houseEdge: number): number {
  if (v <= 1) return 1;
  return (1 - houseEdge) / v;
}

/** Display helper: round a multiplier to 2 decimals for UI only (never used in math). */
export function displayMultiplier(m: number): number {
  return Math.floor(m * 100) / 100;
}
