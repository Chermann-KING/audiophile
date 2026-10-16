import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AccountStore } from './account.store';

// Confort de navigation uniquement : l'autorisation réelle doit être vérifiée côté serveur.
export const authGuard: CanActivateFn = () =>
  inject(AccountStore).isLoggedIn() || inject(Router).createUrlTree(['/auth/login']);
