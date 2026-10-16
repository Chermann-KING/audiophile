import { Injectable } from '@angular/core';

import { ok, type Result } from '../../shared/kernel/result';
import type { AccountError } from '../domain/account-error';
import { Authenticator } from '../domain/authenticator';
import type { Credentials } from '../domain/credentials';
import type { Session } from '../domain/session';

const SIMULATED_LATENCY_MS = 800;

// Authentification de démonstration : tout couple email / mot de passe valide ouvre une session.
// À remplacer par un adaptateur HTTP quand un backend d'authentification existera.
@Injectable()
export class MockAuthenticator extends Authenticator {
  async login(credentials: Credentials): Promise<Result<Session, AccountError>> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    return ok({
      user: { id: '1', email: credentials.email, firstName: 'John', lastName: 'Doe' },
      token: 'mock-jwt-token',
    });
  }
}
