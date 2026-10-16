import type { Provider } from '@angular/core';

import { ChangePassword } from '../application/change-password.use-case';
import { GetCurrentUser } from '../application/get-current-user.use-case';
import { Login } from '../application/login.use-case';
import { Logout } from '../application/logout.use-case';
import { UpdateProfile } from '../application/update-profile.use-case';
import { Authenticator } from '../domain/authenticator';
import { ProfileGateway } from '../domain/profile-gateway';
import { SessionRepository } from '../domain/session-repository';
import { AccountStore } from '../presentation/account.store';
import { HttpProfileGateway } from './http-profile-gateway';
import { LocalStorageSessionRepository } from './local-storage-session-repository';
import { MockAuthenticator } from './mock-authenticator';

// La session est un état global (en-tête, guards, commande) : fournie à la racine de l'application.
export const provideAccount = (): Provider[] => [
  { provide: SessionRepository, useClass: LocalStorageSessionRepository },
  { provide: Authenticator, useClass: MockAuthenticator },
  { provide: ProfileGateway, useClass: HttpProfileGateway },
  Login,
  Logout,
  GetCurrentUser,
  UpdateProfile,
  ChangePassword,
  AccountStore,
];
