import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AccountStore } from './account.store';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const run = (isLoggedIn: boolean) => {
    TestBed.configureTestingModule({
      providers: [{ provide: AccountStore, useValue: { isLoggedIn: () => isLoggedIn } }],
    });
    return TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  };

  it('autorise un utilisateur authentifié', () => {
    expect(run(true)).toBe(true);
  });

  it('redirige un visiteur vers /auth/login', () => {
    const result = run(false);

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/auth/login');
  });
});
