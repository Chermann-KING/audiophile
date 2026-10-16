import type { Result } from '../../shared/kernel/result';
import type { AccountError } from './account-error';
import type { PasswordChange } from './password-change';
import type { User } from './user';

export abstract class ProfileGateway {
  abstract updateProfile(user: User): Promise<Result<User, AccountError>>;
  abstract changePassword(change: PasswordChange): Promise<Result<void, AccountError>>;
}
