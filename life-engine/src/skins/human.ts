import type { SkinConfig } from './types';

/** The flagship skin: a human life, born, aged, lived and rested with dignity. */
export const HUMAN_SKIN: SkinConfig = {
  id: 'human',
  name: 'A Human Life',
  nounSingular: 'a life',
  stageNames: ['Infant', 'Child', 'Youth', 'Adult', 'Prime', 'Elder'],
  sky: {
    dawn: ['#f7c9a0', '#7a5a8e'],
    day: ['#8ec5e2', '#3a5c86'],
    dusk: ['#e88a5a', '#3d2a56'],
    night: ['#1a1330', '#070512'],
  },
  auraCore: '#fff4d6',
  auraGlow: '#ffce7a',
  figure: '#f4e4c8',
  figureAccent: '#c98a5a',
  sparks: ['#ffe9b0', '#ffd27a', '#fff7e6', '#ffbf6b'],
  bloom: '#7fd6a6',
  legacy: '#ffe08a',
  ground: '#241a38',
  copy: {
    rest: 'A life well-lived.',
    fulfil: 'The ambition, fulfilled.',
    suddenDeath: 'The thread was cut.',
    legacy: 'A lasting legacy blooms.',
    nothing: 'The light holds, then fades to a single star.',
    dark: 'The light dims, quietly, into the dark.',
  },
};
