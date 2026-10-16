import { err, ok, type Result } from '../../shared/kernel/result';
import type { AccountError } from '../domain/account-error';
import { Authenticator } from '../domain/authenticator';
import type { Credentials } from '../domain/credentials';
import type { PasswordChange } from '../domain/password-change';
import { ProfileGateway } from '../domain/profile-gateway';
import type { Session } from '../domain/session';
import { SessionRepository } from '../domain/session-repository';
import type { User } from '../domain/user';
import { aSession } from './account.fixture';

export class InMemorySessionRepository extends SessionRepository {
  saveCount = 0;

  constructor(public stored: Session | null = null) {
    super();
  }

  load(): Session | null {
    return this.stored;
  }

  save(session: Session): void {
    this.stored = session;
    this.saveCount++;
  }

  clear(): void {
    this.stored = null;
  }
}

export class FakeAuthenticator extends Authenticator {
  received: Credentials | null = null;

  constructor(private readonly outcome: Result<Session, AccountError> = ok(aSession())) {
    super();
  }

  async login(credentials: Credentials): Promise<Result<Session, AccountError>> {
    this.received = credentials;
    return this.outcome;
  }
}

export class FakeProfileGateway extends ProfileGateway {
  passwordChange: PasswordChange | null = null;

  constructor(private readonly failure?: AccountError) {
    super();
  }

  async updateProfile(user: User): Promise<Result<User, AccountError>> {
    return this.failure ? err(this.failure) : ok(user);
  }

  async changePassword(change: PasswordChange): Promise<Result<void, AccountError>> {
    this.passwordChange = change;
    return this.failure ? err(this.failure) : ok(undefined);
  }
}
