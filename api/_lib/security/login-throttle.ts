import { createHash } from 'node:crypto';

import { LOGIN_LIMITS } from '../config';
import type { AttemptStore } from '../store/ports';

export type ThrottleDecision = { readonly locked: false } | { readonly locked: true; readonly retryAfterSeconds: number };

// Les clés sont hachées : la table des tentatives ne contient ni email ni adresse IP en clair.
const digest = (value: string): string => createHash('sha256').update(value).digest('hex').slice(0, 32);

/**
 * Limitation des tentatives de connexion.
 * - par couple email + IP : un tiers ne peut pas verrouiller le compte d'une victime depuis une autre adresse ;
 * - par IP seule : plafond contre l'essai d'un même mot de passe sur de nombreux comptes.
 */
export class LoginThrottle {
  constructor(private readonly store: AttemptStore) {}

  async check(email: string, ip: string, now: Date): Promise<ThrottleDecision> {
    const locks = await Promise.all([
      this.store.lockedUntil(this.pairKey(email, ip), now),
      this.store.lockedUntil(this.ipKey(ip), now),
    ]);

    const until = locks.filter((lock): lock is Date => lock !== null).sort((a, b) => b.getTime() - a.getTime())[0];
    return until ? { locked: true, retryAfterSeconds: Math.ceil((until.getTime() - now.getTime()) / 1000) } : { locked: false };
  }

  async recordFailure(email: string, ip: string, now: Date): Promise<void> {
    await Promise.all([
      this.store.registerFailure(this.pairKey(email, ip), now, LOGIN_LIMITS.pair),
      this.store.registerFailure(this.ipKey(ip), now, LOGIN_LIMITS.ip),
    ]);
  }

  async recordSuccess(email: string, ip: string): Promise<void> {
    await this.store.reset(this.pairKey(email, ip));
  }

  private pairKey(email: string, ip: string): string {
    return `login:pair:${digest(`${email.trim().toLowerCase()}|${ip}`)}`;
  }

  private ipKey(ip: string): string {
    return `login:ip:${digest(ip)}`;
  }
}
