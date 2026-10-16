import { err, ok, type Result } from '../../shared/kernel/result';
import { isValidEmail } from './user';

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export type CredentialsError = 'INVALID_EMAIL' | 'PASSWORD_TOO_SHORT';

export const MIN_PASSWORD_LENGTH = 6;

export function createCredentials(email: string, password: string): Result<Credentials, CredentialsError> {
  const trimmed = email.trim();
  if (!isValidEmail(trimmed)) return err('INVALID_EMAIL');
  if (password.length < MIN_PASSWORD_LENGTH) return err('PASSWORD_TOO_SHORT');
  return ok({ email: trimmed, password });
}
