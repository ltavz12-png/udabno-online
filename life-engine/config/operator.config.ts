/**
 * Operator configuration entry point.
 *
 * This is the single file an operator edits to tune the product: RTP, bet
 * limits, currency/locale, ambition tiers, dispositions, The Beyond spread, and
 * responsible-gaming hooks. It builds on the engine's DEFAULT_CONFIG via
 * `withConfig`, so you only specify what you change. Nothing here affects the
 * EV-invariance proof — see docs/MATH.md.
 */
import { withConfig, type GameConfig } from '../engine/config';

export const operatorConfig: GameConfig = withConfig({
  // --- money model ---
  houseEdge: 0.03, // RTP = 97%
  currency: 'USD',
  locale: 'en-US',
  minBet: 0.1,
  maxBet: 1000,

  // --- responsible gaming (operator-enforced) ---
  responsibleGaming: {
    sessionReminderMinutes: 60,
    defaultLossLimit: null, // e.g. 500 to cap session losses
    defaultTimeLimitMinutes: null, // e.g. 120 to cap session length
  },

  // Ambition tiers, dispositions, Beyond spread, and pacing all inherit sensible
  // defaults from the engine; override here as your jurisdiction/brand requires.
});
