# Art & Skinning Guide

How the avatar art is produced, how to replace it wholesale with bespoke art, and
how to add a new skin — all without touching the certifiable engine or the
money-authoritative server.

## How the procedural avatar art works

The "face" of a round is a single living **avatar** rendered on the stage
(PixiJS v8 / WebGL). It is drawn **procedurally** — vector shapes plus a particle
system — rather than from pre-authored assets, so the product runs with zero art
dependencies:

- A **silhouette** (vector figure with a glowing aura) that **morphs across the
  engine's `LIFE_STAGES`** as worth climbs: `infant → child → youth → adult →
  prime → elder` (`engine/worth.ts`). `lifeStageForWorth(worth)` selects the
  current stage and `stageProgress(worth)` gives a `[0,1]` fraction through it,
  driving smooth interpolation between stage silhouettes rather than hard swaps.
- A **particle field** of "life-sparks" whose colours come from the active skin,
  layered over a two-stop sky gradient that shifts dawn → day → dusk → night.
- Palette, aura, figure, spark, bloom, legacy, and ground colours all come from
  the active **skin** (see below), so the same procedural renderer produces the
  human life, a star's life, or any registered skin.

Because the visuals are derived entirely from three public, client-safe inputs —
the current life **stage/worth**, the player's **disposition**, and (at the end)
the **ending** — they never depend on and never leak the hidden mortality point.

## How to replace the avatar art

Rendering is designed to sit behind an **`AvatarView` abstraction** in
`src/stage/`: a small class surface that the game drives with high-level calls,
decoupled from *how* those calls are drawn. The rest of the app — engine, server,
store, and the `LifeStage` stage controller that owns the Pixi scene — only ever
calls the `AvatarView` methods; it never reaches into rendering internals. That
makes the art fully swappable.

The surface the game drives is intentionally minimal and maps 1:1 onto the
client-safe values the engine already exposes:

```ts
// src/stage/  — the rendering seam
export interface AvatarView {
  /** Update the morph target as the life ages (from LIFE_STAGES + worth). */
  setLifeStage(stage: LifeStage, progress: number): void;
  /** Reflect the current banked worth (drives scale / bloom / intensity). */
  setWorth(worth: number): void;
  /** Tint / body language from the declared disposition (Spark/Wanderer/Steady). */
  setDisposition(disposition: DispositionConfig): void;
  /** Play the terminal animation for an ending: 'rest' | 'fulfil' | 'sudden-death'. */
  playEnding(ending: Ending, beyond: BeyondOutcome | null): void;
}
```

`LifeStage`, `DispositionConfig`, `Ending`, and `BeyondOutcome` are the real
engine/types (`engine/worth.ts`, `engine/config.ts`, `engine/round.ts`,
`engine/beyond.ts`) — no new game concepts are introduced by the art layer.

To drop in bespoke art (hand-drawn sprite sheets, or Spine / skeletal animation):

1. **Implement `AvatarView`** with your renderer — e.g. a `SpineAvatarView` that
   maps each `LifeStage` to a skeleton skin and `progress` to an animation-mix
   weight, or a `SpriteSheetAvatarView` that cross-fades stage frames.
2. **Consume the same signals:** in `playEnding`, branch on the `Ending` (and the
   optional `BeyondOutcome` bucket — `legacy` / `nothing` / `dark`) to trigger the
   matching animation and the skin's ending copy.
3. **Swap it in** at the single construction point in the `LifeStage` stage
   controller (`src/stage/`) — instantiate your implementation instead of the
   default procedural one. Keep the method calls identical; nothing upstream
   changes.

Because engine and server are framework-free and never import the stage layer,
replacing the avatar art has **zero impact on fairness, RTP, or money handling**
and needs no re-certification of the game core.

## How to add a new skin

A **skin** defines the palette, atmosphere, and vocabulary of the face the player
sees — never game logic (`src/skins/types.ts`). `human.ts` is the flagship
default; `cosmos.ts` is a working, proven alternate ("The Life of a Star").

### The `SkinConfig` shape (field by field)

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string` | Stable key used in the `SKINS` registry and `getSkin(id)`. |
| `name` | `string` | Display name (e.g. "A Human Life"). |
| `nounSingular` | `string` | What the living thing is called ("a life", "a star"). |
| `stageNames` | `readonly string[]` | Stage labels, indexed like engine `LIFE_STAGES` (infant…elder). |
| `sky` | `SkyPalette` | Four two-stop vertical gradients `[top, bottom]`: `dawn`, `day`, `dusk`, `night`. |
| `auraCore` | `string` (hex) | Avatar/aura core colour. |
| `auraGlow` | `string` (hex) | Avatar/aura glow colour. |
| `figure` | `string` (hex) | Figure fill. |
| `figureAccent` | `string` (hex) | Figure outline/accent. |
| `sparks` | `readonly string[]` | Particle colours for life-sparks. |
| `bloom` | `string` (hex) | The growing "life-tree" / world-bloom colour. |
| `legacy` | `string` (hex) | Colour of the Legacy / ascension bloom. |
| `ground` | `string` (hex) | Ground / horizon line colour. |
| `copy` | object | Ending copy: `rest`, `fulfil`, `suddenDeath`, `legacy`, `nothing`, `dark`. |

`SkyPalette` is `{ dawn, day, dusk, night }`, each a `readonly [string, string]`
top/bottom gradient pair. Hex strings are converted to Pixi-friendly `0xRRGGBB`
numbers with `hexToNumber()` (`src/skins/index.ts`).

### Steps to add a third skin

1. **Create the `SkinConfig`.** Add `src/skins/<yourskin>.ts` exporting a typed
   object, e.g.:
   ```ts
   import type { SkinConfig } from './types';

   export const GARDEN_SKIN: SkinConfig = {
     id: 'garden',
     name: 'The Life of a Garden',
     nounSingular: 'a garden',
     stageNames: ['Seed', 'Sprout', 'Sapling', 'Bloom', 'Canopy', 'Fallow'],
     sky: { dawn: ['#…', '#…'], day: ['#…', '#…'], dusk: ['#…', '#…'], night: ['#…', '#…'] },
     auraCore: '#…', auraGlow: '#…',
     figure: '#…', figureAccent: '#…',
     sparks: ['#…', '#…', '#…', '#…'],
     bloom: '#…', legacy: '#…', ground: '#…',
     copy: {
       rest: '…', fulfil: '…', suddenDeath: '…',
       legacy: '…', nothing: '…', dark: '…',
     },
   };
   ```
   Provide exactly six `stageNames` (one per `LIFE_STAGES` entry) and all six
   `copy` strings.
2. **Register it** in `src/skins/index.ts`: import it, re-export it, and add it to
   the `SKINS` map:
   ```ts
   import { GARDEN_SKIN } from './garden';
   export { GARDEN_SKIN } from './garden';

   export const SKINS: Record<string, SkinConfig> = {
     human: HUMAN_SKIN,
     cosmos: COSMOS_SKIN,
     garden: GARDEN_SKIN,
   };
   ```
   `getSkin('garden')` will now resolve it; unknown ids fall back to
   `DEFAULT_SKIN` (the human skin).

That is the entire change. Skins never touch the engine, the server, or money
logic, so adding one is a pure content addition.

## Audio pairs with the art

Sound follows the same swap philosophy (`src/audio/sound.ts`): a self-contained
Web Audio synthesizer produces an ambient pad and event cues with **zero audio
assets**, behind the same tiny surface the game uses — `unlock()`, `setMuted()`,
`setStage(stageIndex)`, and `cue(cue)` where `cue` is one of
`birth | milestone | tension | rest | death | legacy | click`. To use produced
audio, back that same interface with Howler.js (a dependency already in
`package.json`); the game keeps calling `cue()` / `setStage()` unchanged.
