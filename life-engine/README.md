# The Life Engine

**The Life Engine** is a provably-fair HTML5 iGaming product in the crash family.
Instead of a rising multiplier, the player lives a life: they **DECLARE** how it
begins (stake, disposition, ambition, and an optional Beyond wager), then **LIVE**
it in real time — pacing the climb of their *worth* and choosing when to rest —
until the **RECKONING**, where they either rest / fulfil their ambition and bank
`stake × worth` (optionally routed through the mean-1 "Beyond" lottery), or reach
their hidden, provably-fair mortality point first and lose the stake. Every player
choice moves only variance; the expected return is fixed at `1 − houseEdge` for
every strategy.

## Quick start

```bash
npm install          # install dependencies

npm run dev          # Vite dev server (standalone, in-browser mock RGS)
npm run build        # type-check + production static bundle (tsc -b && vite build)
npm run server       # reference Express RGS backend on :8787 (tsx server/index.ts)

npm test             # Vitest: engine unit + fairness + Monte-Carlo (vitest run)
npm run rtp:report   # regenerate docs/RTP_REPORT.md from a Monte-Carlo run
npm run verify       # standalone provably-fair round verifier (engine/verify.ts)
```

Other scripts: `npm run test:watch`, `npm run preview`, `npm run typecheck`,
`npm run e2e` (Playwright).

## Architecture

Money and pixels are separated by a hard boundary. The **engine** and **server**
are framework-free, money-/outcome-authoritative, and independently certifiable;
the client only renders and mirrors.

| Path | Purpose |
| --- | --- |
| `engine/` | Pure, framework-free, certifiable game core: fairness (HMAC-SHA256 derivation), mortality distribution, worth/pacing, The Beyond, and `resolveLife`. No DOM, no React, no money custody. |
| `server/` | Money- and outcome-authoritative RGS. `rgs.ts` (`RgsService`) owns wallet, seeds, nonce, and round lifecycle; `index.ts` is a thin Express REST adapter. |
| `src/state/` | Client protocol + adapters: `RgsClient` interface, `LocalRgsClient`/`HttpRgsClient`, and the Zustand store that mirrors RGS responses. |
| `src/stage/` | Rendering seam — the `AvatarView` abstraction and PixiJS stage that draw the procedural avatar. Fully swappable (see `docs/ART.md`). |
| `src/ui/` | Presentation helpers: the `t()` i18n dictionary and `Intl` currency/multiplier formatting. |
| `src/skins/` | Skin layer — palette/atmosphere/vocabulary configs (`human`, `cosmos`) with no game logic. |
| `src/audio/` | `SoundManager`: zero-asset Web Audio synth behind a Howler-ready interface. |
| `config/` | Deployment/build configuration. |
| `docs/` | Math, fairness, integration, art, and the generated RTP report. |
| `scripts/` | Tooling, e.g. `rtp-report.ts`. |

The engine and server can be run, tested, and certified with no client present:
`resolveLife` is the single source of truth for money outcomes and is shared by
live play and the Monte-Carlo RTP harness, so what the tests certify is exactly
what players experience.

## Stack rationale

- **TypeScript (strict)** — one language across engine, server, and client; strict
  types make the money contract (`protocol.ts`) self-documenting and safe to
  refactor.
- **Vite** — fast dev server and a lean static production bundle that drops into an
  operator iframe.
- **React** — declarative UI for the declare/live/reckoning screens.
- **Zustand** — minimal store that mirrors the server-authoritative RGS and drives
  the render/tick loop without computing any money itself.
- **PixiJS v8 (WebGL)** — high-performance stage for the procedural avatar, sky,
  and particle field.
- **Howler-ready audio** — ships a zero-asset Web Audio synth behind a small
  interface that Howler.js can back once produced audio exists.
- **Vitest** — fast unit, fairness, and Monte-Carlo tests for the engine core.
- **Playwright** — smoke E2E for the assembled client.

## Documentation

- [`docs/MATH.md`](docs/MATH.md) — EV / RTP derivation and the strategy-invariance proof.
- [`docs/FAIRNESS.md`](docs/FAIRNESS.md) — the provably-fair commit–reveal scheme and how to verify a round.
- [`docs/INTEGRATION.md`](docs/INTEGRATION.md) — REST API contract, `RgsClient` swap point, wallet/RGS integration, config, responsible gaming, iframe embedding.
- [`docs/ART.md`](docs/ART.md) — procedural avatar art, replacing it via `AvatarView`, and adding skins.
- [`docs/RTP_REPORT.md`](docs/RTP_REPORT.md) — auto-generated Monte-Carlo RTP verification.
