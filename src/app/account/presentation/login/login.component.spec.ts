import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { err, ok } from '../../../shared/kernel/result';
import { AccountStore } from '../account.store';
import { LoginComponent } from './login.component';

const setup = (outcome = ok(undefined) as ReturnType<typeof ok<undefined>> | ReturnType<typeof err>) => {
  const signIn = vi.fn(async () => outcome);
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AccountStore, useValue: { signIn } }],
  });
  const fixture = TestBed.createComponent(LoginComponent);
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture.detectChanges();
  return { fixture, signIn, navigate, component: fixture.componentInstance };
};

const fill = (component: LoginComponent, email: string, password: string) =>
  component.loginForm.setValue({ email, password });

describe('LoginComponent', () => {
  it('ne soumet pas un formulaire invalide', async () => {
    const { component, signIn } = setup();
    fill(component, 'pas-un-email', '123');

    await component.onSubmit();

    expect(signIn).not.toHaveBeenCalled();
  });

  it('connecte puis redirige vers l’accueil', async () => {
    const { component, signIn, navigate } = setup();
    fill(component, 'me@example.com', 'secret1');

    await component.onSubmit();

    expect(signIn).toHaveBeenCalledWith({ email: 'me@example.com', password: 'secret1' });
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('affiche un message quand la connexion échoue et réactive le bouton', async () => {
    const { fixture, component, navigate } = setup(err({ kind: 'NETWORK' as const }));
    fill(component, 'me@example.com', 'secret1');

    await component.onSubmit();
    await fixture.whenStable();

    expect(navigate).not.toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.querySelector('.error-message')?.textContent).toContain('Connexion impossible');
  });
});
