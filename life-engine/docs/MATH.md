# MATH.md — The Life Engine money model

This document specifies the money model, proves that the return-to-player (RTP)
is fixed and **identical for every player strategy**, derives The Beyond, and
reports the Monte-Carlo verification. Everything here is implemented in
`/engine` and checked in `/engine/__tests__`.

Notation: house edge `e` (default `0.03`), RTP `= 1 − e` (default `0.97`),
stake `s`, mortality point `M`, worth `W`.

---

## 1. The single hidden outcome: the mortality point `M`

Each round draws one hidden outcome, the mortality multiplier `M`, from the
standard crash distribution. Given a uniform `u ∈ [0, 1)`:

```
M = max(1, (1 − e) / (1 − u))          (engine/mortality.ts)
```

This gives, for every `v ≥ 1`:

$$P(M \ge v) = \frac{1-e}{v}, \qquad P(M = 1) = e.$$

**Derivation.** For `v > 1`,
`P(M ≥ v) = P((1−e)/(1−u) ≥ v) = P(u ≥ 1 − (1−e)/v) = (1−e)/v`.
For `u ≤ e` the formula yields a value `≤ 1`, clamped to `1`, so
`P(M = 1) = P(u ≤ e) = e` — a genuine instant-bust point mass. `M` is kept as a
full-precision float (never quantised), which is what makes the identity below
*exact* for every possible rest worth.

---

## 2. Worth, pacing, and why timing is EV-neutral

Worth `W` climbs exponentially from `1.00×`. Pacing (push/coast/tend) and
disposition scale only the **rate** `dW/dt` (`engine/worth.ts`), i.e. the
real-time speed at which a given `W` is reached. They never change `M` and never
change the map from a rested worth to its payout. Therefore pacing is a pure
time-reparameterisation and cannot affect expected value. (Verified directly by
driving the real-time `LifeRound` in `montecarlo.test.ts`.)

Vitality is intentionally **decoupled** from `M`. A vitality meter derived from
the distance to `M` would leak the hidden outcome and let a player play
perfectly, breaking fairness. Vitality is a monotone function of accumulated
strain (`engine/worth.ts:advanceVitality`) — atmosphere only. Death is governed
by `M` alone.

---

## 3. Outcomes and the EV-invariance theorem

Let the player rest at worth `v` (fulfilling an ambition `T` is exactly resting
at `v = T`). Payout:

- **Rest / Fulfil** with `v ≤ M`: `payout = s · v` (optionally × Beyond, §4).
- **Sudden death**, `W` reaches `M` before resting: `payout = 0`.

**Theorem (strategy-independent RTP).** Any stopping rule whose decision is
independent of `M` has expected payout `s · (1 − e)`.

*Proof.* A pure target `v` wins `v` iff `M ≥ v`:

$$\mathbb{E}[\text{payout}] = s\,v\,P(M \ge v) = s\,v\,\frac{1-e}{v} = s\,(1-e).$$

This is independent of `v`. A general strategy chooses a (possibly random) rest
worth `V` using only information independent of `M` (elapsed time, vitality,
pacing, RNG) — it *cannot* use `M`, which is hidden. Conditioning on `V`:

$$\mathbb{E}[\text{payout}] = \mathbb{E}_V\big[s\,V\,P(M \ge V)\big] = \mathbb{E}_V\big[s\,(1-e)\big] = s\,(1-e). \qquad\blacksquare$$

Equivalently: the worth-at-risk process is a martingale after the edge, so by
optional stopping every admissible stopping time yields the same expectation.
Disposition, ambition, pace, re-declare, and the Beyond wager therefore move
**variance and feel only**.

> Not a strategy: *never resting* dies almost surely and returns `0` — this is
> declining to cash out, exactly as in crash. Every strategy that actually rests
> or fulfils returns `1 − e`.

---

## 4. The Beyond — an EV-neutral final wager

On the reckoning of a rested/fulfilled life, the player may (optionally, per the
`beyondWager` declaration) route the banked worth through **The Beyond**: a
three-bucket lottery with multiplier `B ∈ {L (Legacy), 1 (Nothing), d (Dark
End)}`, calibrated so `E[B] = 1` **exactly**. Since `B` is independent of `M`
and mean-1, `E[s·v·B] = s·v` — the payout expectation is unchanged, so RTP is
untouched (§3 still holds). The Beyond only adds variance and drama.

**Calibration (`engine/beyond.ts`).** Let boldness `β ∈ [0,1]` (from the
disposition) set the *spread mass* `s' = s_min + β(s_max − s_min)` — how often a
life resolves to something other than Nothing. With Legacy `L` and Dark `d`:

$$p_L = s'\frac{1-d}{L-d}, \quad p_d = s'\frac{L-1}{L-d}, \quad p_N = 1 - s'.$$

Then, for every `β`, `L`, `d`:

$$p_L L + p_N\cdot 1 + p_d\, d = s'\frac{L(1-d) + d(L-1)}{L-d} + (1-s') = s' + (1-s') = 1.$$

So `E[B] = 1` identically — bold lives (Spark) hit the extremes far more often
than gentle ones (Steady) with **the same mean**. Unit-tested to 10 decimals
across all boldness values and dispositions (`beyond.test.ts`).

### 4.1 Why sudden death cannot pay (design theorem)

The brief's literal suggestion — a mean-1 Beyond multiplier applied to the
*worth at death* — is **not** EV-invariant on a crash backbone, and we
deliberately do not ship it. Consider the value of holding at worth `w`
(survived to `w`). Over `dw`, survival probability is `w/(w+dw)`, death
probability `dw/w`, and a death payout `B(w)`. Requiring "rest now" and
"continue" to have equal value (the martingale/fair-game condition) gives

$$s\,w = \Big(1 - \tfrac{dw}{w}\Big) s\,(w+dw) + \tfrac{dw}{w} B(w) \;\Rightarrow\; \tfrac{dw}{w}B(w) = 0 \;\Rightarrow\; B(w) = 0.$$

Any positive death payout makes "keep pushing" strictly better than resting and
breaks strategy-independence (and paying mean-1 × worth-at-death even diverges,
since `E[M] = ∞`). Hence: **sudden death pays 0**, and The Beyond is applied to
the *banked* worth of a rested/fulfilled life, where it is provably neutral.
This is the correct, certifiable reading of the design.

---

## 5. Monte-Carlo verification

`engine/__tests__/montecarlo.test.ts` (fast, seeded) and `scripts/rtp-report.ts`
(headline run) simulate many strategy buckets — fixed targets, random/adaptive
rest worths, both Beyond modes, and all dispositions — and assert the realised
RTP equals `1 − e` within `max(0.1%, 4·SE)`. The standard-error term keeps the
assertion statistically sound for high-variance buckets (large targets, Beyond
wager), where 0.1% is below the achievable precision even at 10M rounds; the
low-variance canonical bucket is additionally pinned to an absolute ±0.1%.

The live-round test additionally drives the real-time `LifeRound` with
`M`-independent random pacing and rest timing, proving the **time path**
preserves EV.

See **`docs/RTP_REPORT.md`** for the latest generated table
(`npm run rtp:report`). Every bucket converges to the configured 97%.

---

## 6. Operator knobs

All of the above holds for any `houseEdge ∈ (0,1)` and any ambition/disposition
/Beyond parameters. Tune them in `config/operator.config.ts` (or the engine
`GameConfig`); re-run `npm test` and `npm run rtp:report` to re-certify.
