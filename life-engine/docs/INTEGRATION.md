# Integration Guide

How to embed and back **The Life Engine** with a real operator platform: the API
contract, the swap points for your RGS/wallet, the full configuration surface,
responsible-gaming hooks, and iframe embedding.

## Architecture at a glance

The product is split into three layers with a hard boundary between money and
pixels:

| Layer | Location | Responsibility | Certifiable? |
| --- | --- | --- | --- |
| **Engine** | `engine/` | Pure, framework-free game core: fairness derivation, mortality, worth/pacing, The Beyond, and `resolveLife`. No DOM, no React, no money custody. | Yes — unit-tested and Monte-Carlo-verified in isolation. |
| **Server (RGS)** | `server/` | Money- and outcome-authoritative. Owns wallet, provably-fair seeds + nonce, and the lifecycle of every live round. `RgsService` is framework-free; `server/index.ts` is a thin Express adapter. | Yes — the authoritative money boundary. |
| **Client** | `src/` | Renders and mirrors only. The Zustand store (`src/state/store.ts`) reflects RGS responses and drives the render/tick loop; it never computes money or outcomes. | N/A — display only. |

The client speaks to the server through the **`RgsClient`** interface
(`src/state/protocol.ts`). Because the store depends only on that interface, the
same UI runs standalone in-browser (`LocalRgsClient`, wrapping `RgsService`
directly) or against a hosted HTTP backend (`HttpRgsClient`) with no other code
change.

The client is **never** shown the server seed or the hidden mortality point `M`
until a round settles. `RoundView` (`LiveState & { roundId }`) is the redacted,
client-safe snapshot; `LifeRound.view()` deliberately omits mortality.

---

## REST API contract

Reference backend: `server/index.ts` (Express over `RgsService`, default port
`8787`, override with `PORT`). Every route returns JSON; request/response shapes
are the exact types from `src/state/protocol.ts`. Errors are returned as
`{ "error": string }` with status `400` for an `RgsError` (bad stake, unknown
disposition/ambition, insufficient balance, unknown round) and `500` otherwise.

### `GET /api/config`
Returns the full `GameConfig` (see the config table below).

### `GET /api/balance`
```jsonc
// response
{ "balance": 1000 }
```

### `GET /api/fairness`
Pre-round fairness commitment (`FairnessCommitment`).
```jsonc
// response
{ "serverSeedHash": "…sha256(serverSeed)…", "clientSeed": "…", "nonce": 0 }
```

### `POST /api/fairness/client-seed`
Set the player-chosen client seed. Trimmed; accepted when length is 1–256.
```jsonc
// request
{ "clientSeed": "my-lucky-seed" }
// response  (FairnessCommitment — the new commitment)
{ "serverSeedHash": "…", "clientSeed": "my-lucky-seed", "nonce": 0 }
```

### `POST /api/bet`
Place a bet and begin a life. Debits the stake immediately (server-authoritative).
```jsonc
// request  (PlaceBetRequest)
{ "stake": 1, "dispositionId": "wanderer", "ambitionId": "bold", "beyondWager": false }
// response (PlaceBetResponse)
{
  "roundId": "r1",
  "balance": 999,
  "commitment": { "serverSeedHash": "…", "clientSeed": "…", "nonce": 0 },
  "view": { "roundId": "r1", "phase": "live", "worth": 1.0, "vitality": 1.0,
            "pace": "coast", "elapsedMs": 0, "stage": { "id": "infant", "name": "Infant", "fromWorth": 1 },
            "target": 5, "ending": null, "outcome": null }
}
```

### `POST /api/round/:id/tick`
Advance the round by wall-clock elapsed time. Returns the current view and, once
the life reaches its reckoning, the `Settlement` (otherwise `settlement: null`).
```jsonc
// response (TickResponse)
{ "view": { /* RoundView */ }, "settlement": null }
```

### `POST /api/round/:id/pace`
Set the pace (timing/variance only, EV-neutral). Returns the updated `RoundView`.
```jsonc
// request
{ "pace": "push" }   // "push" | "coast" | "tend"
```

### `POST /api/round/:id/redeclare`
Lower the ambition target mid-life to hedge. Can only be lowered, never raised,
and never below 1. Returns the updated `RoundView`.
```jsonc
// request
{ "target": 3 }
```

### `POST /api/round/:id/rest`
Rest at the current worth and settle. Advances to "now" first so the player rests
at the true current worth. Returns a `TickResponse` whose `settlement` is
populated.

### `GET /api/history`
Returns `HistoryEntry[]` (most recent first, capped at 100 server-side).
```jsonc
// each entry
{ "roundId": "r1", "ending": "rest", "multiplier": 2.31, "payout": 2.31,
  "stake": 1, "won": true, "nonce": 0 }
```

### The `Settlement` shape (returned by tick/rest on reckoning)
```jsonc
{
  "roundId": "r1",
  "ending": "rest",              // "rest" | "fulfil" | "sudden-death"
  "worthAtEnd": 2.31,
  "beyond": null,                // BeyondOutcome | null (bucket, multiplier, probabilities)
  "payoutMultiplier": 2.31,
  "stake": 1,
  "payout": 2.31,
  "balance": 1001.31,
  "reveal": {                    // post-round provably-fair reveal
    "serverSeed": "…",           // the previously-secret seed
    "serverSeedHash": "…",       // sha256(serverSeed) — matches the prior commitment
    "clientSeed": "…",
    "nonce": 0,
    "mortality": 3.87            // the hidden mortality point M, now disclosed
  },
  "nextCommitment": { "serverSeedHash": "…", "clientSeed": "…", "nonce": 1 }
}
```

---

## The `RgsClient` interface — the swap point

An operator points the client at their own backend by implementing one interface.
The store never references Express, `fetch`, or `RgsService` directly — only
`RgsClient` (`src/state/protocol.ts`):

```ts
export interface RgsClient {
  getConfig(): Promise<GameConfig>;
  getBalance(): Promise<number>;
  getCommitment(): Promise<FairnessCommitment>;
  setClientSeed(seed: string): Promise<FairnessCommitment>;
  placeBet(req: PlaceBetRequest): Promise<PlaceBetResponse>;
  tick(roundId: string): Promise<TickResponse>;
  setPace(roundId: string, pace: 'push' | 'coast' | 'tend'): Promise<RoundView>;
  reDeclare(roundId: string, target: number): Promise<RoundView>;
  rest(roundId: string): Promise<TickResponse>;
  getHistory(): Promise<HistoryEntry[]>;
}
```

Two reference implementations ship in `src/state/rgs-client.ts`:

- **`LocalRgsClient`** — wraps an in-process `RgsService`. Zero backend required;
  used for demos and `npm run dev`. Constructed by default in the store
  (`useGame`), and accepts `RgsOptions` (config, starting balance, injectable
  randomness/clock, `maxLifeMs`).
- **`HttpRgsClient(base)`** — talks to the Express reference backend over the
  REST routes above. Swapping is a one-liner: `store.init(new HttpRgsClient('https://your-rgs.example.com'))`.

To integrate a real platform, implement `RgsClient` against your own transport
(REST, WebSocket, your SDK) and pass it to `init()`. Nothing else in the client
changes.

---

## Wallet / RGS swap

`RgsService` (`server/rgs.ts`) is the money-authoritative core, and it ships with
a **trivial in-memory wallet stub** meant to be replaced:

- **Balance** is a single private `balance` field, seeded from
  `RgsOptions.startingBalance` (default `1000`).
- **Debit on bet:** `placeBet()` validates the stake against `minBet`/`maxBet`
  and available balance, then subtracts the stake up front — before the round
  begins. Money is server-authoritative; the client is told the new balance.
- **Credit on settle:** when a round reaches reckoning, `maybeSettle()` computes
  `payout = stake × payoutMultiplier` and adds it back to the balance.

Where a real operator plugs in:

| Stub in `RgsService` | Replace with |
| --- | --- |
| `private balance` + debit/credit arithmetic | Your wallet service (authoritative debit/credit, transaction ledger, currency rounding, idempotency keys). |
| `serverSeed` / `clientSeed` / `nonce` fields + `randomSeed()` | Your seed store (per-session server seed, secure RNG, persisted nonce). |
| The single process-wide `rgs` instance in `server/index.ts` (`// One session per process for the mock. A real deployment keys sessions by auth.`) | Per-session instances keyed by authenticated player/session (JWT, operator session token). |
| `active` round map + `history` array (in-memory) | Durable round + history storage. |

**Seed reveal + nonce rotation on settle.** On every settlement `RgsService`:

1. Reveals the round's `serverSeed`, its hash, the `clientSeed`, the `nonce`, and
   the now-disclosed `mortality` (in `settlement.reveal`).
2. Increments `nonce` by 1.
3. Generates a fresh `serverSeed` and publishes its new hash as `nextCommitment`.

This is the standard commit–reveal cycle: the pre-round commitment is published,
the round derives its outcome deterministically from `(serverSeed, clientSeed,
nonce)`, and the post-round reveal lets anyone recompute and verify it (see the
provably-fair section).

---

## Configuration — every `GameConfig` field

Defined in `engine/config.ts` as `DEFAULT_CONFIG`; override with
`withConfig(overrides)`. Changing `houseEdge` changes RTP and nothing else — the
EV-invariance property holds for any value in `(0, 1)`.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `houseEdge` | `number` | `0.03` | House edge `e`. RTP = `1 − e` (0.03 → 97% RTP). |
| `currency` | `string` | `'USD'` | ISO currency code for wallet display/formatting. |
| `locale` | `string` | `'en-US'` | BCP-47 locale for `Intl` number/currency formatting. |
| `minBet` | `number` | `0.1` | Minimum accepted stake. |
| `maxBet` | `number` | `1000` | Maximum accepted stake. |
| `maxMultiplier` | `number` | `100000` | Safety cap on the multiplier the client renders / server honours. |
| `dispositions` | `DispositionConfig[]` | Spark / Wanderer / Steady | How a life is born — affects pacing & variance only, never EV (see below). |
| `ambitions` | `AmbitionTier[]` | A Quiet Life @2 / A Full Life @5 / A Legend @12 | Declarable auto-rest target multipliers. All tiers share one EV. |
| `beyond` | `BeyondConfig` | `{ legacyMultiplier: 5, darkMultiplier: 0.2 }` | The Beyond bucket multipliers; probabilities are derived so `E[mult] = 1`. |
| `baseGrowthPerSecond` | `number` | `0.08` | Base worth-growth in multipliers-per-second of real time at Coast pace. |
| `paceRates` | `{ push; coast; tend }` | `{ 2.6, 1.0, 0.35 }` | Growth-rate multipliers per pace (timing only, EV-neutral). |
| `responsibleGaming` | object | see below | Responsible-gaming hook points (operator-enforced). |

**`DispositionConfig`** (`id`, `name`, `worthRate`, `beyondBoldness`,
`vitalityDrain`):

| id | name | worthRate | beyondBoldness | vitalityDrain |
| --- | --- | ---: | ---: | ---: |
| `spark` | Spark | 1.6 | 1.0 | 1.6 |
| `wanderer` | Wanderer | 1.0 | 0.5 | 1.0 |
| `steady` | Steady | 0.65 | 0.15 | 0.6 |

- `worthRate` — multiplier on worth-growth rate (`>1` climbs faster).
- `beyondBoldness` — in `[0,1]`; tilts The Beyond spread between Legacy and Dark
  End while keeping `E[multiplier] = 1` exactly.
- `vitalityDrain` — pure visual/feel, decoupled from mortality.

**`AmbitionTier`** (`id`, `name`, `target`): the declared target multiplier `T`;
fulfilling pays `stake × T`.

**`BeyondConfig`** (`legacyMultiplier`, `darkMultiplier`): "Nothing" is always
`×1`; the three probabilities are derived so `E[mult] = 1` (see `engine/beyond.ts`).

---

## Responsible-gaming hooks

The `responsibleGaming` config block exposes the hook points; **enforcement is
the operator's responsibility** (the engine and mock RGS do not enforce them):

| Field | Type | Default | Operator use |
| --- | --- | --- | --- |
| `sessionReminderMinutes` | `number` | `60` | Show a session-time reminder every N minutes (the client i18n has an `rg.session` string ready). |
| `defaultLossLimit` | `number \| null` | `null` | Per-session net-loss cap; enforce in your wallet/RGS by refusing `placeBet` once reached. |
| `defaultTimeLimitMinutes` | `number \| null` | `null` | Per-session play-time cap; enforce by ending/blocking sessions server-side. |

Operators typically wire these to their platform's central RG service and enforce
them at the wallet/session boundary (i.e. inside their `RgsClient` /
`RgsService` replacement) so limits cannot be bypassed by the client.

---

## iframe embedding

- **CORS.** `server/index.ts` sets `Access-Control-Allow-Origin: *`,
  `Access-Control-Allow-Headers: Content-Type`, and
  `Access-Control-Allow-Methods: GET,POST,OPTIONS`, and answers preflight
  `OPTIONS` with `204`. Tighten the origin allow-list for production; the wildcard
  is a dev/embedding convenience.
- **Static bundle.** `npm run build` produces a static Vite bundle
  (`tsc -b && vite build`) that can be served from any static host and dropped
  into an operator iframe. It talks to the RGS over the REST contract via
  `HttpRgsClient`.
- **Mobile / safe-area friendly.** The client is display-only and designed to sit
  inside a responsive operator shell; combine with the operator's own
  viewport/safe-area handling in the wrapping page.

---

## Provably-fair endpoints

- **Commitment — `GET /api/fairness`.** Publishes `serverSeedHash`
  (`sha256(serverSeed)`), the current `clientSeed`, and the `nonce` *before* the
  round. The player may set their own seed via `POST /api/fairness/client-seed`.
- **Derivation.** The hidden mortality point is
  `M = mortalityFromUniform(u, houseEdge)` where `u` is extracted from
  `HMAC-SHA256(serverSeed, "${clientSeed}:${nonce}")` (first 52 bits). The Beyond
  uses an independent uniform from the message suffixed `:beyond`
  (`engine/fairness.ts`).
- **Reveal — in the `Settlement`.** On settle, `reveal` discloses `serverSeed`,
  its hash, `clientSeed`, `nonce`, and `mortality`, and `nextCommitment` carries
  the rotated seed's hash and incremented nonce.
- **Independent verification.** `verifyRound()` in `engine/verify.ts` (also a CLI:
  `npx tsx engine/verify.ts <serverSeed> <clientSeed> <nonce> [committedHash] [houseEdge]`)
  recomputes `u`, `M`, and `sha256(serverSeed)` from the revealed values and
  confirms they match the pre-published commitment. See `docs/FAIRNESS.md` and
  `docs/MATH.md`.
