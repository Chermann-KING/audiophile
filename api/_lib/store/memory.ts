import { randomUUID } from 'node:crypto';

import type { AttemptPolicy, AttemptState, ProfilePatch, SessionRecord, Stores, UserRecord } from './ports';

// Implémentation en mémoire : sert aux tests des services et au développement sans base.
export function createMemoryStores(): Stores {
  const users = new Map<string, UserRecord>();
  const sessions = new Map<string, SessionRecord>();
  const attempts = new Map<string, { failures: number; windowStart: Date; lockedUntil: Date | null }>();

  const emailTaken = (email: string, exceptId?: string): boolean =>
    [...users.values()].some((user) => user.id !== exceptId && user.email.toLowerCase() === email.toLowerCase());

  return {
    users: {
      async findByEmail(email) {
        return [...users.values()].find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
      },
      async findById(id) {
        return users.get(id) ?? null;
      },
      async create(input) {
        if (emailTaken(input.email)) return 'EMAIL_TAKEN';
        const record: UserRecord = { id: randomUUID(), ...input };
        users.set(record.id, record);
        return record;
      },
      async update(id, patch: ProfilePatch) {
        const current = users.get(id);
        if (!current) return null;
        if (patch.email !== undefined && emailTaken(patch.email, id)) return 'EMAIL_TAKEN';
        const updated: UserRecord = { ...current, ...definedOnly(patch) };
        users.set(id, updated);
        return updated;
      },
      async setPasswordHash(id, passwordHash) {
        const current = users.get(id);
        if (current) users.set(id, { ...current, passwordHash });
      },
    },

    sessions: {
      async create(session) {
        sessions.set(session.tokenHash, session);
      },
      async findByTokenHash(tokenHash) {
        return sessions.get(tokenHash) ?? null;
      },
      async touch(tokenHash, now) {
        const current = sessions.get(tokenHash);
        if (current) sessions.set(tokenHash, { ...current, lastSeenAt: now });
      },
      async delete(tokenHash) {
        sessions.delete(tokenHash);
      },
      async deleteAllForUser(userId, exceptTokenHash) {
        for (const [hash, session] of sessions) {
          if (session.userId === userId && hash !== exceptTokenHash) sessions.delete(hash);
        }
      },
      async deleteExpired(now) {
        for (const [hash, session] of sessions) {
          if (session.expiresAt <= now) sessions.delete(hash);
        }
      },
    },

    attempts: {
      async lockedUntil(key, now) {
        const entry = attempts.get(key);
        return entry?.lockedUntil && entry.lockedUntil > now ? entry.lockedUntil : null;
      },
      async registerFailure(key, now, policy: AttemptPolicy): Promise<AttemptState> {
        const entry = attempts.get(key);
        const expired =
          !entry ||
          now.getTime() - entry.windowStart.getTime() > policy.windowMs ||
          (entry.lockedUntil !== null && entry.lockedUntil <= now);

        const failures = expired ? 1 : entry.failures + 1;
        const windowStart = expired ? now : entry.windowStart;
        const lockedUntil =
          failures >= policy.maxFailures ? new Date(now.getTime() + policy.lockMs) : expired ? null : entry.lockedUntil;

        attempts.set(key, { failures, windowStart, lockedUntil });
        return { failures, lockedUntil };
      },
      async reset(key) {
        attempts.delete(key);
      },
    },
  };
}

const definedOnly = (patch: ProfilePatch): ProfilePatch =>
  Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
