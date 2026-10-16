import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
    const run = (isAuthenticated: boolean) => {
        TestBed.configureTestingModule({
            providers: [{ provide: AuthService, useValue: { isAuthenticated: () => isAuthenticated } }],
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
