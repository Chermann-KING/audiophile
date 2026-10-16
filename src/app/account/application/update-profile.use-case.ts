import { Injectable, inject } from '@angular/core';

import { err, type Result } from '../../shared/kernel/result';
import type { AccountError } from '../domain/account-error';
import { ProfileGateway } from '../domain/profile-gateway';
import { SessionRepository } from '../domain/session-repository';
import { createUser, type User, type UserError } from '../domain/user';

export type UpdateProfileError = UserError | AccountError;

@Injectable()
export class UpdateProfile {
  private readonly gateway = inject(ProfileGateway);
  private readonly sessions = inject(SessionRepository);

  async execute(user: User): Promise<Result<User, UpdateProfileError>> {
    const valid = createUser(user);
    if (!valid.ok) return err(valid.error);

    const updated = await this.gateway.updateProfile(valid.value);
    if (!updated.ok) return updated;

    const session = this.sessions.load();
    if (session) this.sessions.save({ ...session, user: updated.value });
    return updated;
  }
}
