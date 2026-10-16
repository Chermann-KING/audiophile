import { err, ok, type Result } from '../../shared/kernel/result';

export interface PasswordChange {
  readonly current: string;
  readonly next: string;
}

export interface PasswordChangeInput extends PasswordChange {
  readonly confirmation: string;
}

export type PasswordChangeError = 'CURRENT_REQUIRED' | 'NEW_TOO_SHORT' | 'MISMATCH';

export const MIN_NEW_PASSWORD_LENGTH = 8;

export function createPasswordChange(input: PasswordChangeInput): Result<PasswordChange, PasswordChangeError> {
  if (input.current === '') return err('CURRENT_REQUIRED');
  if (input.next.length < MIN_NEW_PASSWORD_LENGTH) return err('NEW_TOO_SHORT');
  if (input.next !== input.confirmation) return err('MISMATCH');
  return ok({ current: input.current, next: input.next });
}
