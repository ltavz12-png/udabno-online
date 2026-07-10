import type { SkinConfig } from './types';
import { HUMAN_SKIN } from './human';
import { COSMOS_SKIN } from './cosmos';

export type { SkinConfig, SkyPalette } from './types';
export { HUMAN_SKIN } from './human';
export { COSMOS_SKIN } from './cosmos';

export const SKINS: Record<string, SkinConfig> = {
  human: HUMAN_SKIN,
  cosmos: COSMOS_SKIN,
};

export const DEFAULT_SKIN = HUMAN_SKIN;

export function getSkin(id: string): SkinConfig {
  return SKINS[id] ?? DEFAULT_SKIN;
}

/** Parse hex to a Pixi-friendly 0xRRGGBB number. */
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
