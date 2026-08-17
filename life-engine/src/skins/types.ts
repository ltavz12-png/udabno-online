/**
 * Skin layer — the same engine powers many products. A skin defines the palette,
 * atmosphere and vocabulary of the "face" the player sees. The human life is the
 * flagship default; cosmos is a proven alternate. Skins never touch game logic.
 */

export interface SkyPalette {
  /** Two-stop vertical gradient [top, bottom] as hex. */
  readonly dawn: readonly [string, string];
  readonly day: readonly [string, string];
  readonly dusk: readonly [string, string];
  readonly night: readonly [string, string];
}

export interface SkinConfig {
  readonly id: string;
  readonly name: string;
  /** What the living thing is called ("a life", "a star", "a dynasty"). */
  readonly nounSingular: string;
  /** Stage names, indexed like engine LIFE_STAGES (infant…elder). */
  readonly stageNames: readonly string[];
  readonly sky: SkyPalette;
  /** Avatar/aura core and glow colours (hex). */
  readonly auraCore: string;
  readonly auraGlow: string;
  /** Figure fill and outline. */
  readonly figure: string;
  readonly figureAccent: string;
  /** Particle colours for life-sparks. */
  readonly sparks: readonly string[];
  /** The growing "life-tree" / world bloom colour. */
  readonly bloom: string;
  /** Colour used for the Legacy / ascension bloom. */
  readonly legacy: string;
  /** Ground/horizon line colour. */
  readonly ground: string;
  /** Verb copy for the endings. */
  readonly copy: {
    readonly rest: string;
    readonly fulfil: string;
    readonly suddenDeath: string;
    readonly legacy: string;
    readonly nothing: string;
    readonly dark: string;
  };
}
