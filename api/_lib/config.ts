// Réglages de sécurité centralisés : un seul endroit à relire lors d'un audit.

const minutes = (count: number) => count * 60_000;
const hours = (count: number) => count * 3_600_000;
const days = (count: number) => count * 86_400_000;

export const SESSION = {
  /** Durée de vie maximale d'une session, quoi qu'il arrive. */
  absoluteMs: days(7),
  /** Une session inactive plus longtemps que cela expire. */
  idleMs: hours(24),
  /** La dernière activité n'est réécrite en base qu'à cet intervalle (évite une écriture par requête). */
  touchIntervalMs: minutes(5),
} as const;

export const LOGIN_LIMITS = {
  /** 3 échecs pour un même couple email + IP, puis 15 minutes de verrouillage. */
  pair: { windowMs: minutes(15), maxFailures: 3, lockMs: minutes(15) },
  /** Plafond par IP seule : contre le credential stuffing sur de nombreux comptes. */
  ip: { windowMs: minutes(15), maxFailures: 20, lockMs: minutes(15) },
} as const;

export const REGISTER_LIMIT = { windowMs: hours(1), maxFailures: 5, lockMs: hours(1) } as const;

export const PASSWORD_CHANGE_LIMIT = { windowMs: minutes(15), maxFailures: 3, lockMs: minutes(15) } as const;
