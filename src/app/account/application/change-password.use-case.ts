import { Injectable, inject } from '@angular/core';

import { err, type Result } from '../../shared/kernel/result';
import type { AccountError } from '../domain/account-error';
import {
  createPasswordChange,
  type PasswordChangeError,
  type PasswordChangeInput,
} from '../domain/password-change';
import { ProfileGateway } from '../domain/profile-gateway';

export type ChangePasswordError = PasswordChangeError | AccountError;

@Injectable()
export class ChangePassword {
  private readonly gateway = inject(ProfileGateway);

  async execute(input: PasswordChangeInput): Promise<Result<void, ChangePasswordError>> {
    const change = createPasswordChange(input);
    if (!change.ok) return err(change.error);
    return this.gateway.changePassword(change.value);
  }
}
