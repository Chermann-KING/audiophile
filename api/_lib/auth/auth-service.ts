import { createHash } from 'node:crypto';

import { PASSWORD_CHANGE_LIMIT, REGISTER_LIMIT, SESSION } from '../config';
import type { SecurityLogger } from '../logger';
import { err, ok, type Result } from '../result';
import type { LoginThrottle } from '../security/login-throttle';
import { validatePasswordPolicy, type PasswordHasher, type PasswordPolicyError } from '../security/password';
import { generateSessionToken, hashToken } from '../security/tokens';
import type { AttemptPolicy, ProfilePatch, Stores, UserRecord } from '../store/ports';

export interface UserView {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface AuthSuccess {
  readonly user: UserView;
  readonly token: string;
  readonly maxAgeSeconds: number;
}

export interface Authenticated {
  readonly user: UserView;
}

export type LockedError = { readonly kind: 'LOCKED'; readonly retryAfterSeconds: number };
export type WeakPasswordError = { readonly kind: 'WEAK_PASSWORD'; readonly reason: PasswordPolicyError };

export type RegisterError = WeakPasswordError | LockedError | { readonly kind: 'EMAIL_TAKEN' };
export type LoginError = LockedError | { readonly kind: 'INVALID_CREDENTIALS' };
export type ChangePasswordError = WeakPasswordError | LockedError | { readonly kind: 'INVALID_CURRENT_PASSWORD' };

export interface AuthDeps {
  readonly stores: Stores;
  readonly hasher: PasswordHasher;
  readonly throttle: LoginThrottle;
  readonly logger: SecurityLogger;
  readonly now: () => Date;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const digest = (value: string): string => createHash('sha256').update(value).digest('hex').slice(0, 32);

const toView = (user: UserRecord): UserView => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
});

export class AuthService {
  constructor(private readonly deps: AuthDeps) {}

  async register(input: { email: string; password: string; firstName: string; lastName: string; ip: string }): Promise<Result<AuthSuccess, RegisterError>> {
    const { stores, hasher, logger } = this.deps;
    const email = normalizeEmail(input.email);

    const limited = await this.hit(`register:${digest(input.ip)}`, REGISTER_LIMIT);
    if (limited) return err(limited);

    const weakness = validatePasswordPolicy(input.password, { email });
    if (weakness) return err({ kind: 'WEAK_PASSWORD', reason: weakness });

    const created = await stores.users.create({
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      passwordHash: await hasher.hash(input.password),
    });
    if (created === 'EMAIL_TAKEN') {
      logger.event('register_rejected', { reason: 'email_taken', email, ip: input.ip });
      return err({ kind: 'EMAIL_TAKEN' });
    }

    logger.event('register', { email, ip: input.ip });
    return ok(await this.openSession(created));
  }

  async login(input: { email: string; password: string; ip: string }): Promise<Result<AuthSuccess, LoginError>> {
    const { stores, hasher, throttle, logger } = this.deps;
    const email = normalizeEmail(input.email);
    const now = this.deps.now();

    const decision = await throttle.check(email, input.ip, now);
    if (decision.locked) {
      logger.event('login_locked', { email, ip: input.ip });
      return err({ kind: 'LOCKED', retryAfterSeconds: decision.retryAfterSeconds });
    }

    const user = await stores.users.findByEmail(email);
    // Compte inconnu : même coût de calcul, même réponse — rien ne trahit l'existence d'un email.
    const valid = user ? await hasher.verify(input.password, user.passwordHash) : (await hasher.verifyDummy(input.password), false);

    if (!user || !valid) {
      await throttle.recordFailure(email, input.ip, now);
      logger.event('login_failure', { email, ip: input.ip, reason: user ? 'bad_password' : 'unknown_user' });
      return err({ kind: 'INVALID_CREDENTIALS' });
    }

    await throttle.recordSuccess(email, input.ip);
    if (hasher.needsRehash(user.passwordHash)) {
      await stores.users.setPasswordHash(user.id, await hasher.hash(input.password));
    }

    logger.event('login_success', { email, ip: input.ip });
    return ok(await this.openSession(user));
  }

  async authenticate(token: string | null): Promise<Result<Authenticated, 'UNAUTHENTICATED'>> {
    if (!token) return err('UNAUTHENTICATED');

    const { stores } = this.deps;
    const tokenHash = hashToken(token);
    const session = await stores.sessions.findByTokenHash(tokenHash);
    if (!session) return err('UNAUTHENTICATED');

    const now = this.deps.now();
    const expired = session.expiresAt <= now || now.getTime() - session.lastSeenAt.getTime() > SESSION.idleMs;
    const user = expired ? null : await stores.users.findById(session.userId);
    if (!user) {
      await stores.sessions.delete(tokenHash);
      return err('UNAUTHENTICATED');
    }

    if (now.getTime() - session.lastSeenAt.getTime() >= SESSION.touchIntervalMs) {
      await stores.sessions.touch(tokenHash, now);
    }
    return ok({ user: toView(user) });
  }

  async logout(token: string): Promise<void> {
    await this.deps.stores.sessions.delete(hashToken(token));
    this.deps.logger.event('logout');
  }

  async updateProfile(userId: string, patch: ProfilePatch): Promise<Result<UserView, 'EMAIL_TAKEN' | 'NOT_FOUND'>> {
    const email = patch.email === undefined ? undefined : normalizeEmail(patch.email);
    const updated = await this.deps.stores.users.update(userId, { ...patch, ...(email === undefined ? {} : { email }) });

    if (updated === 'EMAIL_TAKEN') return err('EMAIL_TAKEN');
    return updated ? ok(toView(updated)) : err('NOT_FOUND');
  }

  async changePassword(input: {
    userId: string;
    sessionToken: string;
    currentPassword: string;
    newPassword: string;
    ip: string;
  }): Promise<Result<void, ChangePasswordError>> {
    const { stores, hasher, logger } = this.deps;
    const limitKey = `pwchange:${digest(input.userId)}`;

    if (await this.isLocked(limitKey)) return err(await this.lockedError(limitKey));

    const user = await stores.users.findById(input.userId);
    const valid = user ? await hasher.verify(input.currentPassword, user.passwordHash) : false;
    if (!user || !valid) {
      await this.hit(limitKey, PASSWORD_CHANGE_LIMIT);
      logger.event('password_change_failure', { reason: 'bad_current_password', ip: input.ip });
      return err({ kind: 'INVALID_CURRENT_PASSWORD' });
    }

    const weakness = validatePasswordPolicy(input.newPassword, { email: user.email });
    if (weakness) return err({ kind: 'WEAK_PASSWORD', reason: weakness });

    await stores.users.setPasswordHash(user.id, await hasher.hash(input.newPassword));
    // Un mot de passe changé invalide tous les autres appareils (ASVS V7.4.3).
    await stores.sessions.deleteAllForUser(user.id, hashToken(input.sessionToken));
    await stores.attempts.reset(limitKey);

    logger.event('password_changed', { ip: input.ip });
    return ok(undefined);
  }

  private async openSession(user: UserRecord): Promise<AuthSuccess> {
    const now = this.deps.now();
    const token = generateSessionToken();

    await this.deps.stores.sessions.create({
      tokenHash: hashToken(token),
      userId: user.id,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + SESSION.absoluteMs),
    });
    return { user: toView(user), token, maxAgeSeconds: SESSION.absoluteMs / 1000 };
  }

  // Compte chaque tentative ; renvoie une erreur de verrouillage quand le seuil est franchi par un appel précédent.
  private async hit(key: string, policy: AttemptPolicy): Promise<LockedError | null> {
    if (await this.isLocked(key)) return this.lockedError(key);
    await this.deps.stores.attempts.registerFailure(key, this.deps.now(), policy);
    return null;
  }

  private async isLocked(key: string): Promise<boolean> {
    return (await this.deps.stores.attempts.lockedUntil(key, this.deps.now())) !== null;
  }

  private async lockedError(key: string): Promise<LockedError> {
    const now = this.deps.now();
    const until = await this.deps.stores.attempts.lockedUntil(key, now);
    return { kind: 'LOCKED', retryAfterSeconds: until ? Math.ceil((until.getTime() - now.getTime()) / 1000) : 0 };
  }
}
