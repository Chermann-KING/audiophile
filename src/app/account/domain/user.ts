import { err, ok, type Result } from '../../shared/kernel/result';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly photoURL?: string;
}

export type UserError = 'INVALID_EMAIL' | 'EMPTY_NAME';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => EMAIL_PATTERN.test(email);

export function createUser(user: User): Result<User, UserError> {
  if (!isValidEmail(user.email)) return err('INVALID_EMAIL');
  if (user.firstName.trim() === '' || user.lastName.trim() === '') return err('EMPTY_NAME');
  return ok(user);
}
