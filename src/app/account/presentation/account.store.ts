import { Injectable, computed, inject, signal } from '@angular/core';

import type { Result } from '../../shared/kernel/result';
import { ChangePassword } from '../application/change-password.use-case';
import { GetCurrentUser } from '../application/get-current-user.use-case';
import { Login, type LoginError, type LoginInput } from '../application/login.use-case';
import { Logout } from '../application/logout.use-case';
import { UpdateProfile, type UpdateProfileError } from '../application/update-profile.use-case';
import type { PasswordChangeInput } from '../domain/password-change';
import type { User } from '../domain/user';

// API publique de la tranche « account » pour les autres tranches (en-tête, commande, guards).
@Injectable()
export class AccountStore {
  private readonly login = inject(Login);
  private readonly logout = inject(Logout);
  private readonly updateProfileUseCase = inject(UpdateProfile);
  private readonly changePasswordUseCase = inject(ChangePassword);

  private readonly state = signal<User | null>(inject(GetCurrentUser).execute());

  readonly user = this.state.asReadonly();
  readonly isLoggedIn = computed(() => this.state() !== null);

  async signIn(input: LoginInput): Promise<Result<void, LoginError>> {
    const result = await this.login.execute(input);
    if (!result.ok) return result;

    this.state.set(result.value.user);
    return { ok: true, value: undefined };
  }

  signOut(): void {
    this.logout.execute();
    this.state.set(null);
  }

  async updateProfile(user: User): Promise<Result<User, UpdateProfileError>> {
    const result = await this.updateProfileUseCase.execute(user);
    if (result.ok) this.state.set(result.value);
    return result;
  }

  changePassword(input: PasswordChangeInput) {
    return this.changePasswordUseCase.execute(input);
  }
}
