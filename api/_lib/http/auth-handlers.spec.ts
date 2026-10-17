import type { VercelRequest, VercelResponse } from '@vercel/node';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../auth/auth-service';
import { createSecurityLogger } from '../logger';
import { createPasswordHasher } from '../security/password';
import { LoginThrottle } from '../security/login-throttle';
import { SESSION_COOKIE } from '../security/cookies';
import { createMemoryStores } from '../store/memory';
import { HOST, mockRequest, mockResponse, type MockRequestInit } from '../testing/http';
import { createAuthHandlers } from './auth-handlers';

const PASSWORD = 'violet-parapluie-lent-1923';
const NEW_PASSWORD = 'bleu-horizon-calme-2048-x';
const SIGNUP = { email: 'jane@example.com', password: PASSWORD, firstName: 'Jane', lastName: 'Doe' };

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

function setup() {
  const stores = createMemoryStores();
  const logs: string[] = [];
  const service = new AuthService({
    stores,
    hasher: createPasswordHasher({ N: 1024, r: 8, p: 1 }),
    throttle: new LoginThrottle(stores.attempts),
    logger: createSecurityLogger((line) => logs.push(line)),
    now: () => new Date(),
  });
  const handlers = createAuthHandlers({ service, logger: createSecurityLogger((line) => logs.push(line)) });

  async function call(handler: Handler, init: MockRequestInit = {}) {
    const response = mockResponse();
    await handler(mockRequest(init), response.res);
    return response;
  }

  const cookieOf = (response: ReturnType<typeof mockResponse>): string => {
    const value = response.header('set-cookie');
    return (Array.isArray(value) ? value[0] : value) ?? '';
  };
  const sessionHeader = (response: ReturnType<typeof mockResponse>) => ({ cookie: cookieOf(response).split(';')[0] ?? '' });

  async function signedUp(overrides: Record<string, string> = {}) {
    const response = await call(handlers.register, { body: { ...SIGNUP, ...overrides } });
    return { response, cookie: sessionHeader(response) };
  }

  return { stores, service, handlers, logs, call, cookieOf, sessionHeader, signedUp };
}

describe('en-têtes communs', () => {
  it('interdit la mise en cache et le sniffing de type sur toutes les réponses', async () => {
    const { call, handlers } = setup();
    const response = await call(handlers.me, { method: 'GET' });

    expect(response.header('cache-control')).toBe('no-store');
    expect(response.header('x-content-type-options')).toBe('nosniff');
  });

  it('répond 405 avec l’en-tête Allow à une méthode non prévue', async () => {
    const { call, handlers } = setup();
    const response = await call(handlers.login, { method: 'GET' });

    expect(response.statusCode()).toBe(405);
    expect(response.header('allow')).toBe('POST');
  });

  it('ne divulgue ni détail ni pile en cas d’erreur interne', async () => {
    const { handlers, call, service, logs } = setup();
    service.login = async () => {
      throw new Error('connexion à postgres://secret@host impossible');
    };
    const response = await call(handlers.login, { body: { email: 'a@example.com', password: 'x' } });

    expect(response.statusCode()).toBe(500);
    expect(response.body()).toEqual({ error: 'server_error' });
    expect(JSON.stringify(response.body())).not.toContain('postgres');
    expect(logs.join('\n')).not.toContain('secret@host');
  });
});

describe('protection CSRF des requêtes qui modifient des données', () => {
  it('refuse une origine étrangère sans créer de compte', async () => {
    const { call, handlers, stores } = setup();
    const response = await call(handlers.register, { headers: { origin: 'https://evil.example' }, body: SIGNUP });

    expect(response.statusCode()).toBe(403);
    expect(await stores.users.findByEmail('jane@example.com')).toBeNull();
  });

  it('refuse l’absence d’en-tête Origin', async () => {
    const { call, handlers } = setup();
    const response = await call(handlers.login, { headers: { origin: '' }, body: { email: 'a@example.com', password: 'x' } });
    expect(response.statusCode()).toBe(403);
  });

  it('refuse un corps qui n’est pas du JSON (formulaire inter-sites)', async () => {
    const { call, handlers } = setup();
    const response = await call(handlers.register, { headers: { 'content-type': 'text/plain' }, body: SIGNUP });
    expect(response.statusCode()).toBe(415);
  });

  it('ne demande pas d’en-tête Origin pour une lecture (GET)', async () => {
    const { call, handlers } = setup();
    const response = await call(handlers.me, { method: 'GET', headers: { origin: '' } });
    expect(response.statusCode()).toBe(401);
  });

  it('applique la même protection à la déconnexion, au profil et au mot de passe', async () => {
    const { call, handlers, signedUp } = setup();
    const { cookie } = await signedUp();

    for (const [handler, method] of [[handlers.logout, 'POST'], [handlers.updateProfile, 'PUT'], [handlers.changePassword, 'POST']] as const) {
      const response = await call(handler, { method, headers: { ...cookie, origin: 'https://evil.example' }, body: {} });
      expect(response.statusCode()).toBe(403);
    }
  });
});

describe('inscription', () => {
  it('crée le compte, pose un cookie de session sécurisé et ne renvoie ni jeton ni empreinte', async () => {
    const { signedUp, cookieOf } = setup();
    const { response } = await signedUp();

    expect(response.statusCode()).toBe(201);
    expect(response.body()).toEqual({ user: { id: expect.any(String), email: 'jane@example.com', firstName: 'Jane', lastName: 'Doe' } });
    expect(JSON.stringify(response.body())).not.toMatch(/token|hash|scrypt|password/i);

    const cookie = cookieOf(response);
    expect(cookie.startsWith(`${SESSION_COOKIE}=`)).toBe(true);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it.each([
    ['un champ en trop (élévation de privilèges)', { role: 'admin' }],
    ['un identifiant imposé', { id: '00000000-0000-4000-8000-000000000000' }],
    ['une empreinte de mot de passe imposée', { passwordHash: 'x' }],
  ])('refuse %s', async (_label, extra) => {
    const { call, handlers, stores } = setup();
    const response = await call(handlers.register, { body: { ...SIGNUP, ...extra } });

    expect(response.statusCode()).toBe(400);
    expect(await stores.users.findByEmail('jane@example.com')).toBeNull();
  });

  it.each([
    ['email invalide', { email: 'pas-un-email' }],
    ['prénom vide', { firstName: '  ' }],
    ['nom trop long', { lastName: 'x'.repeat(101) }],
    ['mot de passe de type incorrect', { password: 12345678901234567 as unknown as string }],
  ])('refuse %s', async (_label, overrides) => {
    const { call, handlers } = setup();
    expect((await call(handlers.register, { body: { ...SIGNUP, ...overrides } })).statusCode()).toBe(400);
  });

  it('refuse un corps absent ou non objet', async () => {
    const { call, handlers } = setup();
    expect((await call(handlers.register, { body: undefined })).statusCode()).toBe(400);
    expect((await call(handlers.register, { body: 'texte' })).statusCode()).toBe(400);
  });

  it('refuse un mot de passe faible avec la raison', async () => {
    const { call, handlers } = setup();
    const response = await call(handlers.register, { body: { ...SIGNUP, password: 'court' } });

    expect(response.statusCode()).toBe(422);
    expect(response.body()).toEqual({ error: 'weak_password', reason: 'TOO_SHORT' });
  });

  it('refuse un email déjà utilisé', async () => {
    const { call, handlers, signedUp } = setup();
    await signedUp();
    const response = await call(handlers.register, { body: SIGNUP });

    expect(response.statusCode()).toBe(409);
    expect(response.body()).toEqual({ error: 'email_taken' });
  });

  it('limite les inscriptions par adresse IP avec Retry-After', async () => {
    const { call, handlers } = setup();
    for (let i = 0; i < 5; i++) await call(handlers.register, { body: { ...SIGNUP, email: `u${i}@example.com`, password: `phrase-de-passe-unique-${i}-abc` } });

    const response = await call(handlers.register, { body: { ...SIGNUP, email: 'u9@example.com', password: 'phrase-de-passe-unique-9-abc' } });
    expect(response.statusCode()).toBe(429);
    expect(response.body()).toEqual({ error: 'too_many_attempts' });
    expect(Number(response.header('retry-after'))).toBeGreaterThan(0);
  });
});

describe('connexion', () => {
  let t: ReturnType<typeof setup>;
  beforeEach(async () => {
    t = setup();
    await t.signedUp();
  });

  const login = (body: unknown, headers: Record<string, string> = {}) => t.call(t.handlers.login, { body, headers });

  it('ouvre une session et pose le cookie', async () => {
    const response = await login({ email: 'Jane@Example.com', password: PASSWORD });

    expect(response.statusCode()).toBe(200);
    expect(t.cookieOf(response)).toMatch(/HttpOnly/);
    expect(JSON.stringify(response.body())).not.toMatch(/token|hash|password/i);
  });

  it('répond identiquement pour un mot de passe faux et un compte inconnu', async () => {
    const wrong = await login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1' });
    const unknown = await login({ email: 'inconnu@example.com', password: 'mauvais-mot-de-passe-1' }, { 'x-forwarded-for': '198.51.100.9' });

    expect(wrong.statusCode()).toBe(401);
    expect(unknown.statusCode()).toBe(401);
    expect(unknown.body()).toEqual(wrong.body());
    expect(wrong.body()).toEqual({ error: 'invalid_credentials' });
    expect(t.cookieOf(wrong)).toBe('');
  });

  it('verrouille après 3 échecs avec Retry-After, même avec le bon mot de passe', async () => {
    for (let i = 0; i < 3; i++) await login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1' });

    const response = await login({ email: 'jane@example.com', password: PASSWORD });
    expect(response.statusCode()).toBe(429);
    expect(Number(response.header('retry-after'))).toBeGreaterThan(0);
  });

  it('ne verrouille pas la victime quand l’attaquant échoue depuis une autre adresse', async () => {
    for (let i = 0; i < 5; i++) await login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1' }, { 'x-forwarded-for': '203.0.113.66' });

    expect((await login({ email: 'jane@example.com', password: PASSWORD }, { 'x-forwarded-for': '198.51.100.7' })).statusCode()).toBe(200);
  });

  it('refuse un corps invalide ou avec champs en trop', async () => {
    expect((await login({ email: 'jane@example.com' })).statusCode()).toBe(400);
    expect((await login({ email: 'jane@example.com', password: PASSWORD, remember: true })).statusCode()).toBe(400);
    expect((await login({ email: { $ne: null }, password: PASSWORD })).statusCode()).toBe(400);
  });
});

describe('session (me)', () => {
  it('renvoie l’utilisateur de la session', async () => {
    const { call, handlers, signedUp } = setup();
    const { cookie } = await signedUp();
    const response = await call(handlers.me, { method: 'GET', headers: cookie });

    expect(response.statusCode()).toBe(200);
    expect(response.body()).toMatchObject({ user: { email: 'jane@example.com' } });
  });

  it.each([
    ['sans cookie', {}],
    ['cookie inconnu', { cookie: `${SESSION_COOKIE}=${'a'.repeat(43)}` }],
    ['cookie mal formé', { cookie: `${SESSION_COOKIE}=a b;<script>` }],
  ])('répond 401 %s', async (_label, headers) => {
    const { call, handlers } = setup();
    const response = await call(handlers.me, { method: 'GET', headers });

    expect(response.statusCode()).toBe(401);
    expect(response.body()).toEqual({ error: 'unauthenticated' });
  });
});

describe('déconnexion', () => {
  it('révoque la session côté serveur et efface le cookie', async () => {
    const { call, handlers, signedUp, cookieOf } = setup();
    const { cookie } = await signedUp();

    const response = await call(handlers.logout, { headers: cookie });

    expect(response.statusCode()).toBe(204);
    expect(cookieOf(response)).toContain('Max-Age=0');
    expect((await call(handlers.me, { method: 'GET', headers: cookie })).statusCode()).toBe(401);
  });

  it('est idempotente sans session', async () => {
    const { call, handlers } = setup();
    expect((await call(handlers.logout)).statusCode()).toBe(204);
  });
});

describe('profil (/users/me)', () => {
  it('exige une session', async () => {
    const { call, handlers } = setup();
    expect((await call(handlers.updateProfile, { method: 'PUT', body: { firstName: 'X' } })).statusCode()).toBe(401);
  });

  it('met à jour uniquement l’utilisateur de la session (pas de BOLA)', async () => {
    const { call, handlers, signedUp, stores } = setup();
    const alice = await signedUp({ email: 'alice@example.com' });
    await signedUp({ email: 'bob@example.com', password: 'phrase-de-passe-differente-77' });

    const response = await call(handlers.updateProfile, { method: 'PUT', headers: alice.cookie, body: { firstName: 'Alicia' } });

    expect(response.statusCode()).toBe(200);
    expect((await stores.users.findByEmail('alice@example.com'))?.firstName).toBe('Alicia');
    expect((await stores.users.findByEmail('bob@example.com'))?.firstName).toBe('Jane');
  });

  it.each([
    ['un identifiant', { id: '00000000-0000-4000-8000-000000000000' }],
    ['une empreinte', { passwordHash: 'x' }],
    ['un rôle', { role: 'admin' }],
  ])('refuse %s dans le corps (mass assignment)', async (_label, extra) => {
    const { call, handlers, signedUp } = setup();
    const { cookie } = await signedUp();

    expect((await call(handlers.updateProfile, { method: 'PUT', headers: cookie, body: { firstName: 'X', ...extra } })).statusCode()).toBe(400);
  });

  it('refuse un corps vide', async () => {
    const { call, handlers, signedUp } = setup();
    const { cookie } = await signedUp();
    expect((await call(handlers.updateProfile, { method: 'PUT', headers: cookie, body: {} })).statusCode()).toBe(400);
  });

  it('refuse l’email d’un autre compte', async () => {
    const { call, handlers, signedUp } = setup();
    await signedUp({ email: 'alice@example.com' });
    const bob = await signedUp({ email: 'bob@example.com', password: 'phrase-de-passe-differente-77' });

    const response = await call(handlers.updateProfile, { method: 'PUT', headers: bob.cookie, body: { email: 'ALICE@example.com' } });
    expect(response.statusCode()).toBe(409);
  });
});

describe('changement de mot de passe', () => {
  const body = { currentPassword: PASSWORD, newPassword: NEW_PASSWORD };

  it('exige une session', async () => {
    const { call, handlers } = setup();
    expect((await call(handlers.changePassword, { body })).statusCode()).toBe(401);
  });

  it('change le mot de passe et révoque les autres sessions', async () => {
    const { call, handlers, signedUp } = setup();
    const first = await signedUp();
    const second = await call(handlers.login, { body: { email: 'jane@example.com', password: PASSWORD } });

    const response = await call(handlers.changePassword, { headers: first.cookie, body });

    expect(response.statusCode()).toBe(204);
    expect((await call(handlers.me, { method: 'GET', headers: first.cookie })).statusCode()).toBe(200);
    expect((await call(handlers.me, { method: 'GET', headers: { cookie: (second.header('set-cookie') as string).split(';')[0] ?? '' } })).statusCode()).toBe(401);
  });

  it('refuse un mot de passe actuel faux puis verrouille après 3 essais', async () => {
    const { call, handlers, signedUp } = setup();
    const { cookie } = await signedUp();
    const wrong = { currentPassword: 'ce-nest-pas-le-bon-1', newPassword: NEW_PASSWORD };

    for (let i = 0; i < 3; i++) expect((await call(handlers.changePassword, { headers: cookie, body: wrong })).statusCode()).toBe(400);
    expect((await call(handlers.changePassword, { headers: cookie, body })).statusCode()).toBe(429);
  });

  it('refuse un nouveau mot de passe faible', async () => {
    const { call, handlers, signedUp } = setup();
    const { cookie } = await signedUp();
    const response = await call(handlers.changePassword, { headers: cookie, body: { currentPassword: PASSWORD, newPassword: 'court' } });

    expect(response.statusCode()).toBe(422);
    expect(response.body()).toEqual({ error: 'weak_password', reason: 'TOO_SHORT' });
  });
});

describe('hôte', () => {
  it('utilise l’hôte configuré pour la comparaison d’origine', async () => {
    const { call, handlers } = setup();
    const response = await call(handlers.register, { headers: { origin: `https://${HOST}` }, body: SIGNUP });
    expect(response.statusCode()).toBe(201);
  });
});
