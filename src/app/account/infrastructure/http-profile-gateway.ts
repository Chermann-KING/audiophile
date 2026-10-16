import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../core/api-base-url';
import { err, ok, type Result } from '../../shared/kernel/result';
import type { AccountError } from '../domain/account-error';
import type { PasswordChange } from '../domain/password-change';
import { ProfileGateway } from '../domain/profile-gateway';
import { createUser, type User } from '../domain/user';
import { userDtoSchema } from './user.dto';

@Injectable()
export class HttpProfileGateway extends ProfileGateway {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  async updateProfile(user: User): Promise<Result<User, AccountError>> {
    try {
      const raw = await firstValueFrom(this.http.put<unknown>(`${this.baseUrl}/users/${user.id}`, user));
      return this.toUser(raw);
    } catch (error) {
      return err(toAccountError(error));
    }
  }

  async changePassword(change: PasswordChange): Promise<Result<void, AccountError>> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/users/change-password`, {
          currentPassword: change.current,
          newPassword: change.next,
        })
      );
      return ok(undefined);
    } catch (error) {
      return err(toAccountError(error));
    }
  }

  private toUser(raw: unknown): Result<User, AccountError> {
    const parsed = userDtoSchema.safeParse(raw);
    if (!parsed.success) return err({ kind: 'INVALID_DATA', detail: parsed.error.message });

    const created = createUser(parsed.data);
    return created.ok ? created : err({ kind: 'INVALID_DATA', detail: created.error });
  }
}

function toAccountError(error: unknown): AccountError {
  if (error instanceof HttpErrorResponse && error.status !== 0) {
    return { kind: 'SERVER', status: error.status };
  }
  return { kind: 'NETWORK' };
}
