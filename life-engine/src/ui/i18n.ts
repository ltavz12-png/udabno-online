/**
 * Localization-ready string dictionary + Intl formatting. All user-facing copy
 * flows through `t()`; numbers and currency through Intl so a new locale is a
 * dictionary + a locale code away.
 */

export type Dict = Record<string, string>;

const EN: Dict = {
  'app.title': 'The Life Engine',
  'app.tagline': 'You choose how you live — never when the end comes.',
  'bet.balance': 'Balance',
  'bet.stake': 'Stake',
  'bet.begin': 'Begin a Life',
  'bet.potential': 'Potential',
  'declare.disposition': 'Disposition — how you are born',
  'declare.ambition': 'Ambition — how far you will go',
  'declare.beyond': 'Wager on The Beyond',
  'declare.beyondHint': 'Route the reckoning through a fair mean-1 lottery. More drama, same odds.',
  'live.worth': 'Worth',
  'live.target': 'Ambition',
  'live.vitality': 'Vitality',
  'live.push': 'Push',
  'live.coast': 'Coast',
  'live.tend': 'Tend',
  'live.redeclare': 'Re-declare',
  'live.rest': 'Rest & Claim',
  'reckoning.rested': 'Rested',
  'reckoning.fulfilled': 'Fulfilled',
  'reckoning.suddenDeath': 'The End',
  'reckoning.legacy': 'A Legacy',
  'reckoning.darkEnd': 'A Dark End',
  'reckoning.passedOn': 'Passed On',
  'reckoning.payout': 'Banked',
  'reckoning.again': 'Live Again',
  'history.title': 'Recent lives',
  'feed.title': 'Lives, unfolding',
  'fair.title': 'Provably Fair',
  'fair.serverHash': 'Server seed (hashed)',
  'fair.clientSeed': 'Your seed',
  'fair.nonce': 'Nonce',
  'fair.verify': 'Verify a round',
  'settings.sound': 'Sound',
  'settings.motion': 'Reduced motion',
  'settings.auto': 'Auto-play',
  'settings.autoRest': 'Auto-rest at ambition',
  'rg.session': 'Session',
};

const DICTS: Record<string, Dict> = { en: EN };

let current = 'en';
export function setLocale(locale: string): void {
  current = DICTS[locale] ? locale : 'en';
}
export function t(key: string): string {
  return DICTS[current]?.[key] ?? EN[key] ?? key;
}

export function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatMultiplier(m: number): string {
  return `${m.toFixed(2)}×`;
}
