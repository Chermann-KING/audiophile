import { Injectable, inject } from '@angular/core';

import { err, type Result } from '../../shared/kernel/result';
import type { AccountError } from '../domain/account-error';
import { Authenticator } from '../domain/authenticator';
import { createCredentials, type CredentialsError } from '../domain/credentials';
import type { Session } from '../domain/session';
import { SessionRepository } from '../domain/session-repository';

export type LoginError = CredentialsError | AccountError;

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

@Injectable()
export class Login {
  private readonly authenticator = inject(Authenticator);
  private readonly sessions = inject(SessionRepository);

  async execute(input: LoginInput): Promise<Result<Session, LoginError>> {
    const credentials = createCredentials(input.email, input.password);
    if (!credentials.ok) return err(credentials.error);

    const session = await this.authenticator.login(credentials.value);
    if (session.ok) this.sessions.save(session.value);
    return session;
  }
}
