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
crash distribution generalised with a **death dividend** `μ = deathBeyondMean ∈
[0, 1)` (default `0.25`). Given a uniform `u ∈ [0, 1)`:

```
M = max(1, ((1 − e) / (1 − u)) ^ (1 − μ))     (engine/mortality.ts)
```

This gives, for every `v ≥ 1`:

$$P(M \ge v) = (1-e)\,v^{-\frac{1}{1-\mu}}, \qquad P(M = 1) = e.$$

With `μ = 0` this is exactly the standard crash law `P(M ≥ v) = (1−e)/v`. With
`μ > 0` the curve is **steeper** (you reach mortality sooner on average); that
surrendered upside is paid back as the death Beyond (§4), netting to the same
RTP (§3). `P(M = 1) = P(u ≤ e) = e` is a genuine instant-bust point mass (an end
at birth, which pays nothing). `M` is kept as a full-precision float (never
quantised), which is what makes the identities below *exact* for every possible
rest worth.

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

- **Rest / Fulfil** with `v ≤ M`: `payout = s · v` (optionally × a mean-1 Beyond
  wager, §4.2). Resting always pays exactly the worth you see — WYSIWYG.
- **Sudden death** (`W` reaches `M` first): `payout = s · M · μ · B`, where `B ∈
  {L, 1, d}` is the three-outcome Beyond (§4) — a Legacy/Nothing/Dark End on the
  worth-at-death. An end at birth (`M = 1`) pays nothing.

**Theorem (strategy-independent RTP).** Every strategy whose decisions are
independent of `M` has expected payout `s · (1 − e)`, for any `μ ∈ [0, 1)`.

*Proof.* Fix a rest target `v` and write `a = 1/(1−μ)`, so `S(v) = P(M ≥ v) =
(1−e)v^{−a}` with density `f(m) = (1−e)a·m^{−a−1}` and instant-bust mass `e`
(paying 0). The Beyond has mean `E[B] = 1` (§4.1), so death pays `μ·m` in
expectation at worth `m`. Then

$$\mathbb{E}[\text{payout}]/s = \underbrace{v\,S(v)}_{\text{rest}} + \underbrace{\int_1^v \mu\,m\,f(m)\,dm}_{\text{death Beyond}} = (1-e)v^{1-a} + (1-e)\big(1 - v^{1-a}\big) = (1-e).$$

(The integral evaluates to `(1−e)(1 − v^{1−a})` because `a/(1−a)·μ = −1`.) The
result is **independent of `v`** — and of `μ`. A general strategy rests at a
(possibly random) worth `V` chosen without knowledge of `M`, so conditioning on
`V` gives `E[payout] = E_V[s(1−e)] = s(1−e)`. ∎

So the steepened mortality (§1) exactly funds the death Beyond: dying sooner on
average is worth precisely what dying now pays. Disposition, ambition, pace,
re-declare, and the optional rest-Beyond move **variance and feel only**.

> The pathological *never-rest* strategy still returns `1 − e` in expectation
> (`μ·E[M] = 1 − e`), but its payout is heavy-tailed (dominated by rare Legacy-on-
> huge-worth events), so its finite-sample RTP converges slowly — see the note in
> `RTP_REPORT.md`.

---

## 4. The Beyond — three outcomes, mean exactly 1

The Beyond is a three-bucket lottery with multiplier `B ∈ {L (Legacy), 1
(Nothing), d (Dark End)}`, calibrated so `E[B] = 1` **exactly**. It appears in
two places, both EV-neutral:

- **On death (default):** the life resolves into The Beyond on its worth-at-
  death, paying `s·M·μ·B`. Mean `s·M·μ` — funded exactly by the steepened
  mortality curve (§3). This is what makes dying a three-way reckoning
  (Legacy / Nothing / Dark End) rather than a flat loss.
- **On rest (optional wager):** if the player declared `beyondWager`, the banked
  worth is routed through the same mean-1 lottery, `s·v·B`. Mean `s·v` — pure
  variance, no EV change.

### 4.1 Calibration (`engine/beyond.ts`)

Let boldness `β ∈ [0,1]` (from the disposition) set the *spread mass* `s' =
s_min + β(s_max − s_min)` — how often a life resolves to something other than
Nothing. With Legacy `L` and Dark `d`:

$$p_L = s'\frac{1-d}{L-d}, \quad p_d = s'\frac{L-1}{L-d}, \quad p_N = 1 - s'.$$

Then, for every `β`, `L`, `d`:

$$p_L L + p_N\cdot 1 + p_d\, d = s'\frac{L(1-d) + d(L-1)}{L-d} + (1-s') = s' + (1-s') = 1.$$

So `E[B] = 1` identically — bold lives (Spark) hit the extremes far more often
than gentle ones (Steady) with **the same mean**. Unit-tested to 10 decimals
across all boldness values and dispositions (`beyond.test.ts`).

### 4.2 Why this is the honest way to pay on death

A naïve "mean-1 Beyond on the worth-at-death, on top of an unchanged crash
curve" is **not** EV-invariant: it would make pushing to death strictly `+EV`
(and even diverges, since the unsteepened `E[M] = ∞`). The fix is not to forbid
paying on death — it is to **pay for it out of the mortality curve**. Setting
`μ > 0` steepens `M` by exactly the exponent `1/(1−μ)` (§1); the funds recovered
by dying sooner are returned as the death Beyond (§3 proof). With `deathBeyondMean
= 0`, death pays nothing and the model collapses to classic crash. Operators
tune the trade-off — bigger `μ` means a richer death Beyond but shorter lives —
in one config field, and re-certify with `npm run rtp:report`.

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
