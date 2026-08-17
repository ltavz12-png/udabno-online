import type { SkinConfig } from './types';

/** Proven alternate skin: a star's life, from spark to supernova to remnant. */
export const COSMOS_SKIN: SkinConfig = {
  id: 'cosmos',
  name: 'The Life of a Star',
  nounSingular: 'a star',
  stageNames: ['Spark', 'Protostar', 'Main Sequence', 'Giant', 'Supergiant', 'Remnant'],
  sky: {
    dawn: ['#1b2a4a', '#0a0f24'],
    day: ['#22407a', '#0b1330'],
    dusk: ['#3a2160', '#0a0620'],
    night: ['#0a0518', '#020008'],
  },
  auraCore: '#eaf3ff',
  auraGlow: '#7fb4ff',
  figure: '#dcecff',
  figureAccent: '#5f8fff',
  sparks: ['#bcd8ff', '#8fb6ff', '#ffffff', '#a0c4ff'],
  bloom: '#6ad0ff',
  legacy: '#b98cff',
  ground: '#0a0a1e',
  copy: {
    rest: 'The star settles, radiant and whole.',
    fulfil: 'The declared brilliance, reached.',
    suddenDeath: 'The core collapses in an instant.',
    legacy: 'A supernova seeds a lasting constellation.',
    nothing: 'The light holds, then cools to a single point.',
    dark: 'The star dims into a quiet remnant.',
  },
};
