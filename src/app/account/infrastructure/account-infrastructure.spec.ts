import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '../../core/api-base-url';
import { aSession, aUser } from '../testing/account.fixture';
import { HttpProfileGateway } from './http-profile-gateway';
import { LocalStorageSessionRepository } from './local-storage-session-repository';
import { MockAuthenticator } from './mock-authenticator';

describe('LocalStorageSessionRepository', () => {
  beforeEach(() => localStorage.clear());

  it('ne renvoie aucune session au premier démarrage', () => {
    expect(new LocalStorageSessionRepository().load()).toBeNull();
  });

  it('enregistre puis relit la session sous les clés historiques', () => {
    new LocalStorageSessionRepository().save(aSession());

    expect(JSON.parse(localStorage.getItem('currentUser') ?? 'null')).toEqual(aUser());
    expect(localStorage.getItem('token')).toBe('token');
    expect(new LocalStorageSessionRepository().load()).toEqual(aSession());
  });

  it('relit un utilisateur enregistré sans jeton', () => {
    localStorage.setItem('currentUser', JSON.stringify(aUser()));
    expect(new LocalStorageSessionRepository().load()).toEqual(aSession({ token: '' }));
  });

  it.each(['{pas du json', '{"id":1}'])('ignore un contenu invalide (%s)', (raw) => {
    localStorage.setItem('currentUser', raw);
    expect(new LocalStorageSessionRepository().load()).toBeNull();
  });

  it('efface la session', () => {
    const repository = new LocalStorageSessionRepository();
    repository.save(aSession());
    repository.clear();

    expect(repository.load()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('MockAuthenticator', () => {
  afterEach(() => vi.useRealTimers());

  it('ouvre une session de démonstration après un court délai', async () => {
    vi.useFakeTimers();
    const pending = new MockAuthenticator().login({ email: 'me@example.com', password: 'secret1' });

    await vi.advanceTimersByTimeAsync(800);
    const result = await pending;

    expect(result.ok && result.value.user.email).toBe('me@example.com');
    expect(result.ok && result.value.token).toBe('mock-jwt-token');
  });
});

describe('HttpProfileGateway', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        HttpProfileGateway,
      ],
    });
    return { gateway: TestBed.inject(HttpProfileGateway), http: TestBed.inject(HttpTestingController) };
  };

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('met à jour le profil', async () => {
    const { gateway, http } = setup();
    const pending = gateway.updateProfile(aUser());

    const request = http.expectOne('http://api.test/users/1');
    expect(request.request.method).toBe('PUT');
    request.flush(aUser());

    expect(await pending).toEqual({ ok: true, value: aUser() });
  });

  it('signale une réponse invalide', async () => {
    const { gateway, http } = setup();
    const pending = gateway.updateProfile(aUser());

    http.expectOne('http://api.test/users/1').flush({ nope: true });

    const result = await pending;
    expect(!result.ok && result.error.kind).toBe('INVALID_DATA');
  });

  it('change le mot de passe', async () => {
    const { gateway, http } = setup();
    const pending = gateway.changePassword({ current: 'old', next: 'new-password' });

    const request = http.expectOne('http://api.test/users/change-password');
    expect(request.request.body).toEqual({ currentPassword: 'old', newPassword: 'new-password' });
    request.flush(null);

    expect(await pending).toEqual({ ok: true, value: undefined });
  });

  it('traduit une erreur serveur', async () => {
    const { gateway, http } = setup();
    const pending = gateway.changePassword({ current: 'old', next: 'new-password' });

    http.expectOne('http://api.test/users/change-password').flush('x', { status: 404, statusText: 'Not Found' });

    expect(await pending).toEqual({ ok: false, error: { kind: 'SERVER', status: 404 } });
  });

  it('traduit une erreur réseau', async () => {
    const { gateway, http } = setup();
    const pending = gateway.updateProfile(aUser());

    http.expectOne('http://api.test/users/1').error(new ProgressEvent('error'));

    expect(await pending).toEqual({ ok: false, error: { kind: 'NETWORK' } });
  });
});
