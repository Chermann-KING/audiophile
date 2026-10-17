export interface UserRecord {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly passwordHash: string;
}

export interface NewUser {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly passwordHash: string;
}

export interface ProfilePatch {
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

export interface UserStore {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(user: NewUser): Promise<UserRecord | 'EMAIL_TAKEN'>;
  update(id: string, patch: ProfilePatch): Promise<UserRecord | 'EMAIL_TAKEN' | null>;
  setPasswordHash(id: string, passwordHash: string): Promise<void>;
}

export interface SessionRecord {
  readonly tokenHash: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly lastSeenAt: Date;
  readonly expiresAt: Date;
}

export interface SessionStore {
  create(session: SessionRecord): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  touch(tokenHash: string, now: Date): Promise<void>;
  delete(tokenHash: string): Promise<void>;
  deleteAllForUser(userId: string, exceptTokenHash?: string): Promise<void>;
  deleteExpired(now: Date): Promise<void>;
}

export interface AttemptPolicy {
  readonly windowMs: number;
  readonly maxFailures: number;
  readonly lockMs: number;
}

export interface AttemptState {
  readonly failures: number;
  readonly lockedUntil: Date | null;
}

// Compteur d'échecs de connexion. `registerFailure` doit être atomique (échecs simultanés).
export interface AttemptStore {
  lockedUntil(key: string, now: Date): Promise<Date | null>;
  registerFailure(key: string, now: Date, policy: AttemptPolicy): Promise<AttemptState>;
  reset(key: string): Promise<void>;
}

export interface Stores {
  readonly users: UserStore;
  readonly sessions: SessionStore;
  readonly attempts: AttemptStore;
}
