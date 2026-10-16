import { Injector } from '@angular/core';

import { err } from '../../shared/kernel/result';
import { Authenticator } from '../domain/authenticator';
import { ProfileGateway } from '../domain/profile-gateway';
import { SessionRepository } from '../domain/session-repository';
import type { Session } from '../domain/session';
import type { AccountError } from '../domain/account-error';
import { aSession, aUser } from '../testing/account.fixture';
import { FakeAuthenticator, FakeProfileGateway, InMemorySessionRepository } from '../testing/doubles';
import { ChangePassword } from './change-password.use-case';
import { GetCurrentUser } from './get-current-user.use-case';
import { Login } from './login.use-case';
import { Logout } from './logout.use-case';
import { UpdateProfile } from './update-profile.use-case';

const NETWORK: AccountError = { kind: 'NETWORK' };

interface Options {
  stored?: Session | null;
  authenticator?: FakeAuthenticator;
  gateway?: FakeProfileGateway;
}

const setup = (options: Options = {}) => {
  const sessions = new InMemorySessionRepository(options.stored ?? null);
  const authenticator = options.authenticator ?? new FakeAuthenticator();
  const gateway = options.gateway ?? new FakeProfileGateway();
  const injector = Injector.create({
    providers: [
      { provide: SessionRepository, useValue: sessions },
      { provide: Authenticator, useValue: authenticator },
      { provide: ProfileGateway, useValue: gateway },
      Login,
      Logout,
      GetCurrentUser,
      UpdateProfile,
      ChangePassword,
    ],
  });
  return { sessions, authenticator, gateway, injector };
};

describe('Login', () => {
  it('ouvre et enregistre la session', async () => {
    const { sessions, authenticator, injector } = setup();
    const result = await injector.get(Login).execute({ email: ' john@example.com ', password: 'secret1' });

    expect(result).toEqual({ ok: true, value: aSession() });
    expect(authenticator.received).toEqual({ email: 'john@example.com', password: 'secret1' });
    expect(sessions.stored).toEqual(aSession());
  });

  it('refuse des identifiants invalides sans appeler l’authentificateur', async () => {
    const { sessions, authenticator, injector } = setup();
    const result = await injector.get(Login).execute({ email: 'nope', password: 'secret1' });

    expect(result).toEqual({ ok: false, error: 'INVALID_EMAIL' });
    expect(authenticator.received).toBeNull();
    expect(sessions.saveCount).toBe(0);
  });

  it('n’enregistre rien quand l’authentification échoue', async () => {
    const { sessions, injector } = setup({ authenticator: new FakeAuthenticator(err(NETWORK)) });
    const result = await injector.get(Login).execute({ email: 'john@example.com', password: 'secret1' });

    expect(result).toEqual({ ok: false, error: NETWORK });
    expect(sessions.saveCount).toBe(0);
  });
});

describe('Logout et GetCurrentUser', () => {
  it('renvoie l’utilisateur de la session', () => {
    expect(setup({ stored: aSession() }).injector.get(GetCurrentUser).execute()).toEqual(aUser());
  });

  it('renvoie null sans session', () => {
    expect(setup().injector.get(GetCurrentUser).execute()).toBeNull();
  });

  it('efface la session', () => {
    const { sessions, injector } = setup({ stored: aSession() });
    injector.get(Logout).execute();
    expect(sessions.stored).toBeNull();
  });
});

describe('UpdateProfile', () => {
  const updated = aUser({ firstName: 'Jane' });

  it('met à jour le profil et la session', async () => {
    const { sessions, injector } = setup({ stored: aSession() });
    const result = await injector.get(UpdateProfile).execute(updated);

    expect(result).toEqual({ ok: true, value: updated });
    expect(sessions.stored).toEqual(aSession({ user: updated }));
  });

  it('refuse un profil invalide', async () => {
    const { injector } = setup({ stored: aSession() });
    expect(await injector.get(UpdateProfile).execute(aUser({ email: 'nope' }))).toEqual({
      ok: false,
      error: 'INVALID_EMAIL',
    });
  });

  it('conserve la session quand le serveur échoue', async () => {
    const { sessions, injector } = setup({ stored: aSession(), gateway: new FakeProfileGateway(NETWORK) });
    const result = await injector.get(UpdateProfile).execute(updated);

    expect(result).toEqual({ ok: false, error: NETWORK });
    expect(sessions.stored).toEqual(aSession());
  });
});

describe('ChangePassword', () => {
  const input = { current: 'old-password', next: 'new-password', confirmation: 'new-password' };

  it('transmet le changement validé', async () => {
    const { gateway, injector } = setup();
    expect(await injector.get(ChangePassword).execute(input)).toEqual({ ok: true, value: undefined });
    expect(gateway.passwordChange).toEqual({ current: 'old-password', next: 'new-password' });
  });

  it('refuse une confirmation différente sans appeler le serveur', async () => {
    const { gateway, injector } = setup();
    expect(await injector.get(ChangePassword).execute({ ...input, confirmation: 'autre' })).toEqual({
      ok: false,
      error: 'MISMATCH',
    });
    expect(gateway.passwordChange).toBeNull();
  });

  it('propage l’erreur du serveur', async () => {
    const { injector } = setup({ gateway: new FakeProfileGateway(NETWORK) });
    expect(await injector.get(ChangePassword).execute(input)).toEqual({ ok: false, error: NETWORK });
  });
});
