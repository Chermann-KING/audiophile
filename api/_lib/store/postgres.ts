import type { AttemptState, ProfilePatch, SessionRecord, Stores, UserRecord } from './ports';

// Accès Postgres minimal : fonctionne avec le pilote Neon (production) et PGlite (tests).
// Toutes les requêtes sont paramétrées : aucune valeur n'est jamais concaténée dans le SQL.
export interface Queryable {
  query(text: string, params: unknown[]): Promise<{ rows: unknown[] }>;
}

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
}

interface SessionRow {
  token_hash: string;
  user_id: string;
  created_at: Date | string;
  last_seen_at: Date | string;
  expires_at: Date | string;
}

interface AttemptRow {
  failures: number;
  locked_until: Date | string | null;
}

const USER_COLUMNS = 'id, email, first_name, last_name, password_hash';
const UNIQUE_VIOLATION = '23505';

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

const toUser = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  passwordHash: row.password_hash,
});

const toSession = (row: SessionRow): SessionRecord => ({
  tokenHash: row.token_hash,
  userId: row.user_id,
  createdAt: toDate(row.created_at),
  lastSeenAt: toDate(row.last_seen_at),
  expiresAt: toDate(row.expires_at),
});

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

// Une seule instruction atomique : les échecs simultanés ne peuvent pas être sous-comptés.
// Le compteur repart de 1 quand la fenêtre est écoulée ou quand un verrou est arrivé à échéance.
// Paramètres : $1 clé, $2 maintenant, $3 fenêtre (ms), $4 seuil d'échecs, $5 durée du verrou (ms).
const WINDOW_OVER = `a.window_started_at + ($3::bigint * interval '1 millisecond') < $2::timestamptz`;
const LOCK_OVER = `(a.locked_until IS NOT NULL AND a.locked_until <= $2::timestamptz)`;
const EXPIRED = `(${WINDOW_OVER} OR ${LOCK_OVER})`;
const NEXT_FAILURES = `(CASE WHEN ${EXPIRED} THEN 1 ELSE a.failures + 1 END)`;
const LOCK_UNTIL = `$2::timestamptz + ($5::bigint * interval '1 millisecond')`;

const REGISTER_FAILURE_SQL = `
  INSERT INTO login_attempts AS a (key, failures, window_started_at, locked_until)
  VALUES ($1, 1, $2::timestamptz, CASE WHEN 1 >= $4::int THEN ${LOCK_UNTIL} END)
  ON CONFLICT (key) DO UPDATE SET
    failures = ${NEXT_FAILURES},
    window_started_at = CASE WHEN ${EXPIRED} THEN $2::timestamptz ELSE a.window_started_at END,
    locked_until = CASE
      WHEN ${NEXT_FAILURES} >= $4::int THEN ${LOCK_UNTIL}
      WHEN ${EXPIRED} THEN NULL
      ELSE a.locked_until
    END
  RETURNING a.failures, a.locked_until`;

export function createPostgresStores(db: Queryable): Stores {
  const rows = async <T>(text: string, params: unknown[]): Promise<T[]> => (await db.query(text, params)).rows as T[];

  return {
    users: {
      async findByEmail(email) {
        const [row] = await rows<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE lower(email) = lower($1)`, [email]);
        return row ? toUser(row) : null;
      },

      async findById(id) {
        const [row] = await rows<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
        return row ? toUser(row) : null;
      },

      async create(user) {
        try {
          const [row] = await rows<UserRow>(
            `INSERT INTO users (email, first_name, last_name, password_hash)
             VALUES ($1, $2, $3, $4) RETURNING ${USER_COLUMNS}`,
            [user.email, user.firstName, user.lastName, user.passwordHash]
          );
          return toUser(row as UserRow);
        } catch (error) {
          if (isUniqueViolation(error)) return 'EMAIL_TAKEN';
          throw error;
        }
      },

      async update(id, patch: ProfilePatch) {
        try {
          const [row] = await rows<UserRow>(
            `UPDATE users SET
               email = COALESCE($2, email),
               first_name = COALESCE($3, first_name),
               last_name = COALESCE($4, last_name),
               updated_at = now()
             WHERE id = $1 RETURNING ${USER_COLUMNS}`,
            [id, patch.email ?? null, patch.firstName ?? null, patch.lastName ?? null]
          );
          return row ? toUser(row) : null;
        } catch (error) {
          if (isUniqueViolation(error)) return 'EMAIL_TAKEN';
          throw error;
        }
      },

      async setPasswordHash(id, passwordHash) {
        await db.query('UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1', [id, passwordHash]);
      },
    },

    sessions: {
      async create(session) {
        await db.query(
          `INSERT INTO sessions (token_hash, user_id, created_at, last_seen_at, expires_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [session.tokenHash, session.userId, session.createdAt, session.lastSeenAt, session.expiresAt]
        );
      },

      async findByTokenHash(tokenHash) {
        const [row] = await rows<SessionRow>(
          'SELECT token_hash, user_id, created_at, last_seen_at, expires_at FROM sessions WHERE token_hash = $1',
          [tokenHash]
        );
        return row ? toSession(row) : null;
      },

      async touch(tokenHash, now) {
        await db.query('UPDATE sessions SET last_seen_at = $2 WHERE token_hash = $1', [tokenHash, now]);
      },

      async delete(tokenHash) {
        await db.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
      },

      async deleteAllForUser(userId, exceptTokenHash) {
        await db.query('DELETE FROM sessions WHERE user_id = $1 AND ($2::text IS NULL OR token_hash <> $2)', [
          userId,
          exceptTokenHash ?? null,
        ]);
      },

      async deleteExpired(now) {
        await db.query('DELETE FROM sessions WHERE expires_at <= $1', [now]);
      },
    },

    attempts: {
      async lockedUntil(key, now) {
        const [row] = await rows<{ locked_until: Date | string }>(
          'SELECT locked_until FROM login_attempts WHERE key = $1 AND locked_until > $2',
          [key, now]
        );
        return row ? toDate(row.locked_until) : null;
      },

      async registerFailure(key, now, policy): Promise<AttemptState> {
        const params = [key, now, policy.windowMs, policy.maxFailures, policy.lockMs];
        const [row] = await rows<AttemptRow>(REGISTER_FAILURE_SQL, params);
        const state = row as AttemptRow;
        return { failures: state.failures, lockedUntil: state.locked_until ? toDate(state.locked_until) : null };
      },

      async reset(key) {
        await db.query('DELETE FROM login_attempts WHERE key = $1', [key]);
      },
    },
  };
}
