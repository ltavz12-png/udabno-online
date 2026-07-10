# FAIRNESS.md — Provably-fair algorithm & independent verification

The Life Engine uses the standard commit-reveal, HMAC-based scheme from the
crash family. Every round's hidden mortality point `M` is fully determined by
three public values, and can be reproduced by anyone after the round.

---

## 1. Inputs

| Input | Who sets it | When it's known |
| --- | --- | --- |
| `serverSeed` | server | secret during the round; **revealed** after |
| `serverSeedHash` = `SHA-256(serverSeed)` | server | **published before** the round (the commitment) |
| `clientSeed` | player (editable) | always |
| `nonce` | server | increments by 1 each round for a seed pair |

Because the server publishes `serverSeedHash` **before** the round and cannot
change `serverSeed` without changing the hash, and because the player controls
`clientSeed`, neither side can bias the outcome.

---

## 2. Derivation

```
digest = HMAC-SHA256(key = serverSeed, message = `${clientSeed}:${nonce}`)
u      = first 52 bits of digest  ÷  2^52          → uniform in [0, 1)
M      = max(1, (1 − e) / (1 − u))                 → the mortality point
```

Implemented in `engine/fairness.ts` (`deriveFairness`, `uniformFromDigest`) and
`engine/mortality.ts` (`mortalityFromUniform`). The Beyond draws a second,
independent uniform from the same seeds using the message
`` `${clientSeed}:${nonce}:beyond` `` (`deriveBeyondUniform`).

The SHA-256 / HMAC-SHA256 used are a dependency-free implementation
(`engine/crypto/sha256.ts`) validated against the FIPS-180-4 and RFC-4231 test
vectors, so verification is byte-for-byte reproducible in any environment
(browser, Node, or a lab's own tooling).

---

## 3. Round lifecycle

1. **Commit.** Before betting, the server shows `serverSeedHash`, `clientSeed`,
   `nonce` (`GET /api/fairness`). The player may set their own `clientSeed`.
2. **Play.** The round runs; the client never receives `serverSeed` or `M`.
3. **Reveal.** On settlement the server returns the `reveal` block —
   `serverSeed`, `serverSeedHash`, `clientSeed`, `nonce`, and `M` — and rotates
   to a fresh `serverSeed` (new commitment) with `nonce` incremented
   (`server/rgs.ts:maybeSettle`).

The player can then confirm two things:

- `SHA-256(serverSeed) == serverSeedHash` (the server didn't swap the seed), and
- re-deriving `M` from the seeds matches the `M` they were paid against.

---

## 4. Verify a round independently

### In the app
Open **Provably Fair → Verify a round**. The revealed seeds from your last round
are pre-filled; press **Verify**. It runs `engine/verify.ts` in your browser —
the exact code the engine ships — and prints the reproduced `u`, `M`, the HMAC,
and whether the commitment matches.

### From the CLI
```bash
npm run verify -- <serverSeed> <clientSeed> <nonce> [committedHash] [houseEdge]
# e.g.
npm run verify -- the-server-seed player-seed 42 <hash> 0.03
```
Prints a JSON report including `serverSeedHash`, `commitmentMatches`, `hmac`,
`uniform`, and `mortality`. A third party or certification lab needs nothing
from us but these seeds.

### As a library
```ts
import { verifyRound } from './engine/verify';
const r = verifyRound(serverSeed, clientSeed, nonce, committedHash, houseEdge);
// r.mortality, r.commitmentMatches, r.hmac, r.uniform, r.beyondUniform
```

---

## 5. Guarantees & swap points

- **Server-authoritative.** All seeds, nonces, wallet debits/credits and outcome
  resolution live in `server/rgs.ts`; the client only renders. An operator
  replaces the in-memory seed store / wallet with their own without changing the
  algorithm (see `INTEGRATION.md`).
- **Seed rotation.** A fresh `serverSeed` is generated after every settlement, so
  each round has an independent commitment. (Operators who prefer a
  rotate-on-request model — reveal only when the player asks for a new
  `serverSeed` — can adjust `maybeSettle` accordingly; the verification math is
  identical.)
