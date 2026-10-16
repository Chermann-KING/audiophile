import { TestBed } from '@angular/core/testing';

import { err } from '../../shared/kernel/result';
import { ChangePassword } from '../application/change-password.use-case';
import { GetCurrentUser } from '../application/get-current-user.use-case';
import { Login } from '../application/login.use-case';
import { Logout } from '../application/logout.use-case';
import { UpdateProfile } from '../application/update-profile.use-case';
import { Authenticator } from '../domain/authenticator';
import { ProfileGateway } from '../domain/profile-gateway';
import { SessionRepository } from '../domain/session-repository';
import { aSession, aUser } from '../testing/account.fixture';
import { FakeAuthenticator, FakeProfileGateway, InMemorySessionRepository } from '../testing/doubles';
import { AccountStore } from './account.store';

const setup = (stored = null as ReturnType<typeof aSession> | null, authenticator = new FakeAuthenticator()) => {
  const sessions = new InMemorySessionRepository(stored);
  TestBed.configureTestingModule({
    providers: [
      { provide: SessionRepository, useValue: sessions },
      { provide: Authenticator, useValue: authenticator },
      { provide: ProfileGateway, useValue: new FakeProfileGateway() },
      Login,
      Logout,
      GetCurrentUser,
      UpdateProfile,
      ChangePassword,
      AccountStore,
    ],
  });
  return { sessions, store: TestBed.inject(AccountStore) };
};

describe('AccountStore', () => {
  it('démarre déconnecté sans session enregistrée', () => {
    const { store } = setup();
    expect(store.user()).toBeNull();
    expect(store.isLoggedIn()).toBe(false);
  });

  it('reprend la session enregistrée', () => {
    const { store } = setup(aSession());
    expect(store.user()).toEqual(aUser());
    expect(store.isLoggedIn()).toBe(true);
  });

  it('connecte l’utilisateur', async () => {
    const { store } = setup();
    const result = await store.signIn({ email: 'john@example.com', password: 'secret1' });

    expect(result.ok).toBe(true);
    expect(store.user()).toEqual(aUser());
  });

  it('reste déconnecté quand la connexion échoue', async () => {
    const { store } = setup(null, new FakeAuthenticator(err({ kind: 'NETWORK' })));
    const result = await store.signIn({ email: 'john@example.com', password: 'secret1' });

    expect(result).toEqual({ ok: false, error: { kind: 'NETWORK' } });
    expect(store.isLoggedIn()).toBe(false);
  });

  it('déconnecte et efface la session', () => {
    const { store, sessions } = setup(aSession());
    store.signOut();

    expect(store.isLoggedIn()).toBe(false);
    expect(sessions.stored).toBeNull();
  });

  it('reflète le profil mis à jour', async () => {
    const { store } = setup(aSession());
    await store.updateProfile(aUser({ firstName: 'Jane' }));

    expect(store.user()?.firstName).toBe('Jane');
  });
});
