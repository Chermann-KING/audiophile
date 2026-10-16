import type { Result } from '../../shared/kernel/result';
import type { AccountError } from './account-error';
import type { Credentials } from './credentials';
import type { Session } from './session';

// Port sortant : vérifie des identifiants et ouvre une session (simulé tant qu'il n'y a pas de backend).
export abstract class Authenticator {
  abstract login(credentials: Credentials): Promise<Result<Session, AccountError>>;
}
