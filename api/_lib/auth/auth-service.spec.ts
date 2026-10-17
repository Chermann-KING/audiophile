import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SESSION } from '../config';
import { createSecurityLogger } from '../logger';
import { createPasswordHasher, type PasswordHasher } from '../security/password';
import { LoginThrottle } from '../security/login-throttle';
import { hashToken } from '../security/tokens';
import { createMemoryStores } from '../store/memory';
import type { Stores } from '../store/ports';
import { AuthService } from './auth-service';

const T0 = new Date('2026-10-17T10:00:00.000Z');
const IP = '203.0.113.1';
const PASSWORD = 'violet-parapluie-lent-1923';
const NEW_PASSWORD = 'bleu-horizon-calme-2048-x';

// Hacheur à coût réduit (même logique) pour garder des tests rapides.
const fastHasher = createPasswordHasher({ N: 1024, r: 8, p: 1 });

interface Harness {
  service: AuthService;
  stores: Stores;
  hasher: PasswordHasher;
  logs: string[];
  dummyCalls: () => number;
  advance(ms: number): void;
}

function setup(hasher: PasswordHasher = fastHasher): Harness {
  const stores = createMemoryStores();
  const logs: string[] = [];
  let current = T0;
  let dummy = 0;
  const counting: PasswordHasher = {
    ...hasher,
    verifyDummy: async (password) => {
      dummy++;
      await hasher.verifyDummy(password);
    },
  };
  const service = new AuthService({
    stores,
    hasher: counting,
    throttle: new LoginThrottle(stores.attempts),
    logger: createSecurityLogger((line) => logs.push(line)),
    now: () => current,
  });
  return { service, stores, hasher: counting, logs, dummyCalls: () => dummy, advance: (ms) => (current = new Date(current.getTime() + ms)) };
}

const registration = (overrides: Record<string, string> = {}) => ({
  email: 'Jane@Example.com',
  password: PASSWORD,
  firstName: 'Jane',
  lastName: 'Doe',
  ip: IP,
  ...overrides,
});

async function registered(h: Harness) {
  const result = await h.service.register(registration());
  if (!result.ok) throw new Error('inscription attendue');
  return result.value;
}

describe('register', () => {
  let h: Harness;
  beforeEach(() => {
    h = setup();
  });

  it('crée le compte et ouvre une session', async () => {
    const { user, token } = await registered(h);

    expect(user).toEqual({ id: expect.any(String), email: 'jane@example.com', firstName: 'Jane', lastName: 'Doe' });
    expect((await h.service.authenticate(token)).ok).toBe(true);
  });

  it('ne renvoie jamais l’empreinte du mot de passe', async () => {
    const { user } = await registered(h);
    expect(JSON.stringify(user)).not.toMatch(/hash|scrypt|password/i);
  });

  it('stocke une empreinte scrypt et jamais le mot de passe', async () => {
    await registered(h);
    const stored = await h.stores.users.findByEmail('jane@example.com');

    expect(stored?.passwordHash.startsWith('scrypt$')).toBe(true);
    expect(stored?.passwordHash).not.toContain(PASSWORD);
  });

  it('normalise l’email (casse et espaces)', async () => {
    await h.service.register(registration({ email: '  Jane@Example.com ' }));
    expect(await h.stores.users.findByEmail('jane@example.com')).not.toBeNull();
  });

  it('refuse un mot de passe qui ne respecte pas la politique, sans créer de compte', async () => {
    const result = await h.service.register(registration({ password: 'trop-court' }));

    expect(result).toEqual({ ok: false, error: { kind: 'WEAK_PASSWORD', reason: 'TOO_SHORT' } });
    expect(await h.stores.users.findByEmail('jane@example.com')).toBeNull();
  });

  it('refuse un mot de passe qui contient la partie locale de l’email', async () => {
    const result = await h.service.register(registration({ password: 'jane-et-son-chat-2026' }));
    expect(result).toEqual({ ok: false, error: { kind: 'WEAK_PASSWORD', reason: 'CONTAINS_CONTEXT' } });
  });

  it('refuse un email déjà utilisé', async () => {
    await registered(h);
    expect(await h.service.register(registration({ email: 'JANE@example.com' }))).toEqual({ ok: false, error: { kind: 'EMAIL_TAKEN' } });
  });

  it('limite le nombre d’inscriptions par adresse IP', async () => {
    for (let i = 0; i < 5; i++) await h.service.register(registration({ email: `user${i}@example.com`, password: `phrase-de-passe-unique-${i}-abc` }));

    const result = await h.service.register(registration({ email: 'user6@example.com', password: 'phrase-de-passe-unique-6-abc' }));
    expect(result).toMatchObject({ ok: false, error: { kind: 'LOCKED' } });
  });

  it('journalise l’inscription sans mot de passe ni email en clair', async () => {
    await registered(h);
    expect(h.logs.join('\n')).toContain('register');
    expect(h.logs.join('\n')).not.toContain(PASSWORD);
    expect(h.logs.join('\n')).not.toContain('jane@example.com');
  });
});

describe('login', () => {
  let h: Harness;
  beforeEach(async () => {
    h = setup();
    await registered(h);
  });

  it('ouvre une session avec les bons identifiants', async () => {
    const result = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });

    expect(result.ok && result.value.user.email).toBe('jane@example.com');
    expect(result.ok && result.value.maxAgeSeconds).toBe(SESSION.absoluteMs / 1000);
  });

  it('renvoie exactement la même erreur pour un mot de passe faux et pour un compte inconnu', async () => {
    const wrongPassword = await h.service.login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1', ip: IP });
    const unknownUser = await h.service.login({ email: 'inconnu@example.com', password: 'mauvais-mot-de-passe-1', ip: '198.51.100.9' });

    expect(wrongPassword).toEqual({ ok: false, error: { kind: 'INVALID_CREDENTIALS' } });
    expect(unknownUser).toEqual(wrongPassword);
  });

  it('calcule un hachage factice pour un compte inconnu (même coût que pour un compte connu)', async () => {
    const before = h.dummyCalls();
    await h.service.login({ email: 'inconnu@example.com', password: 'nimporte-quoi-du-tout', ip: IP });
    expect(h.dummyCalls()).toBe(before + 1);
  });

  it('verrouille après 3 échecs, même avec le bon mot de passe ensuite', async () => {
    for (let i = 0; i < 3; i++) await h.service.login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1', ip: IP });

    const result = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });
    expect(result).toMatchObject({ ok: false, error: { kind: 'LOCKED', retryAfterSeconds: expect.any(Number) } });
  });

  it('applique le même verrouillage à un compte inconnu (pas d’énumération par le verrouillage)', async () => {
    for (let i = 0; i < 3; i++) await h.service.login({ email: 'fantome@example.com', password: 'mauvais-mot-de-passe-1', ip: IP });

    expect(await h.service.login({ email: 'fantome@example.com', password: 'mauvais-mot-de-passe-1', ip: IP })).toMatchObject({
      ok: false,
      error: { kind: 'LOCKED' },
    });
  });

  it('lève le verrou après 15 minutes', async () => {
    for (let i = 0; i < 3; i++) await h.service.login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1', ip: IP });
    h.advance(15 * 60_000 + 1000);

    const result = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });
    expect(result.ok).toBe(true);
  });

  it('ne verrouille pas le compte depuis une autre adresse IP', async () => {
    for (let i = 0; i < 6; i++) await h.service.login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1', ip: '203.0.113.66' });

    const result = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: '198.51.100.7' });
    expect(result.ok).toBe(true);
  });

  it('remet le compteur à zéro après une connexion réussie', async () => {
    for (let i = 0; i < 2; i++) await h.service.login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1', ip: IP });
    await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });
    for (let i = 0; i < 2; i++) await h.service.login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1', ip: IP });

    expect((await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP })).ok).toBe(true);
  });

  it('émet un nouveau jeton à chaque connexion (pas de fixation de session)', async () => {
    const first = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });
    const second = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });

    expect(first.ok && second.ok && first.value.token !== second.value.token).toBe(true);
  });

  it('ne stocke que l’empreinte du jeton', async () => {
    const result = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });
    if (!result.ok) throw new Error('connexion attendue');

    expect(await h.stores.sessions.findByTokenHash(result.value.token)).toBeNull();
    expect(await h.stores.sessions.findByTokenHash(hashToken(result.value.token))).not.toBeNull();
  });

  it('met à niveau une empreinte aux paramètres plus faibles après une connexion réussie', async () => {
    const strong = setup(createPasswordHasher({ N: 2048, r: 8, p: 1 }));
    await strong.stores.users.create({ email: 'old@example.com', firstName: 'Old', lastName: 'User', passwordHash: await fastHasher.hash(PASSWORD) });
    const before = (await strong.stores.users.findByEmail('old@example.com'))?.passwordHash;

    await strong.service.login({ email: 'old@example.com', password: PASSWORD, ip: IP });
    const after = (await strong.stores.users.findByEmail('old@example.com'))?.passwordHash;

    expect(after).not.toBe(before);
    expect(after).toContain('$2048$');
  });

  it('journalise les échecs sans mot de passe', async () => {
    await h.service.login({ email: 'jane@example.com', password: 'mauvais-mot-de-passe-1', ip: IP });

    expect(h.logs.join('\n')).toContain('login_failure');
    expect(h.logs.join('\n')).not.toContain('mauvais-mot-de-passe-1');
  });
});

describe('authenticate', () => {
  let h: Harness;
  beforeEach(() => {
    h = setup();
  });

  it.each([null, '', 'jeton-inconnu'])('refuse un jeton absent ou inconnu (%j)', async (token) => {
    expect(await h.service.authenticate(token)).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('expire une session au bout de la durée absolue et la supprime', async () => {
    const { token } = await registered(h);
    h.advance(SESSION.absoluteMs + 1000);

    expect(await h.service.authenticate(token)).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
    expect(await h.stores.sessions.findByTokenHash(hashToken(token))).toBeNull();
  });

  it('expire une session inactive', async () => {
    const { token } = await registered(h);
    h.advance(SESSION.idleMs + 1000);

    expect((await h.service.authenticate(token)).ok).toBe(false);
  });

  it('prolonge l’inactivité tant que la session est utilisée', async () => {
    const { token } = await registered(h);
    for (let i = 0; i < 4; i++) {
      h.advance(SESSION.idleMs - 60_000);
      expect((await h.service.authenticate(token)).ok).toBe(true);
    }
  });

  it('n’écrit la dernière activité qu’à intervalle espacé', async () => {
    const { token } = await registered(h);
    const touch = vi.spyOn(h.stores.sessions, 'touch');

    h.advance(60_000);
    await h.service.authenticate(token);
    expect(touch).not.toHaveBeenCalled();

    h.advance(SESSION.touchIntervalMs);
    await h.service.authenticate(token);
    expect(touch).toHaveBeenCalledTimes(1);
  });

  it('refuse une session dont le compte a disparu', async () => {
    const { token, user } = await registered(h);
    await h.stores.users.setPasswordHash(user.id, 'x');
    const sessionHash = hashToken(token);
    const session = await h.stores.sessions.findByTokenHash(sessionHash);
    await h.stores.sessions.create({ ...session!, tokenHash: 'orphan', userId: '00000000-0000-4000-8000-000000000000' });

    expect((await h.service.authenticate('orphan')).ok).toBe(false);
  });
});

describe('logout', () => {
  it('révoque la session côté serveur', async () => {
    const h = setup();
    const { token } = await registered(h);

    await h.service.logout(token);

    expect((await h.service.authenticate(token)).ok).toBe(false);
  });
});

describe('updateProfile', () => {
  let h: Harness;
  beforeEach(() => {
    h = setup();
  });

  it('met à jour le profil de l’utilisateur', async () => {
    const { user } = await registered(h);
    const result = await h.service.updateProfile(user.id, { firstName: 'Janet' });

    expect(result).toEqual({ ok: true, value: { ...user, firstName: 'Janet' } });
  });

  it('refuse l’email d’un autre compte', async () => {
    const { user } = await registered(h);
    await h.service.register(registration({ email: 'other@example.com', password: 'phrase-de-passe-differente-77' }));

    expect(await h.service.updateProfile(user.id, { email: 'OTHER@example.com' })).toEqual({ ok: false, error: 'EMAIL_TAKEN' });
  });

  it('normalise le nouvel email', async () => {
    const { user } = await registered(h);
    const result = await h.service.updateProfile(user.id, { email: '  New@Example.COM ' });
    expect(result.ok && result.value.email).toBe('new@example.com');
  });
});

describe('changePassword', () => {
  let h: Harness;
  let token: string;
  let userId: string;
  beforeEach(async () => {
    h = setup();
    const created = await registered(h);
    token = created.token;
    userId = created.user.id;
  });

  const change = (overrides: Record<string, string> = {}) =>
    h.service.changePassword({ userId, sessionToken: token, currentPassword: PASSWORD, newPassword: NEW_PASSWORD, ip: IP, ...overrides });

  it('change le mot de passe : le nouveau fonctionne, l’ancien non', async () => {
    expect((await change()).ok).toBe(true);

    expect((await h.service.login({ email: 'jane@example.com', password: NEW_PASSWORD, ip: IP })).ok).toBe(true);
    expect((await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: '198.51.100.8' })).ok).toBe(false);
  });

  it('révoque les autres sessions mais conserve la session courante', async () => {
    const other = await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP });
    if (!other.ok) throw new Error('connexion attendue');

    await change();

    expect((await h.service.authenticate(token)).ok).toBe(true);
    expect((await h.service.authenticate(other.value.token)).ok).toBe(false);
  });

  it('exige le mot de passe actuel', async () => {
    expect(await change({ currentPassword: 'ce-nest-pas-le-bon-1' })).toEqual({ ok: false, error: { kind: 'INVALID_CURRENT_PASSWORD' } });
    expect((await h.service.login({ email: 'jane@example.com', password: PASSWORD, ip: IP })).ok).toBe(true);
  });

  it('applique la politique au nouveau mot de passe', async () => {
    expect(await change({ newPassword: 'court' })).toEqual({ ok: false, error: { kind: 'WEAK_PASSWORD', reason: 'TOO_SHORT' } });
  });

  it('limite les essais du mot de passe actuel (3 échecs)', async () => {
    for (let i = 0; i < 3; i++) await change({ currentPassword: 'ce-nest-pas-le-bon-1' });

    expect(await change()).toMatchObject({ ok: false, error: { kind: 'LOCKED' } });
  });

  it('journalise le changement sans mot de passe', async () => {
    await change();
    expect(h.logs.join('\n')).toContain('password_changed');
    expect(h.logs.join('\n')).not.toContain(NEW_PASSWORD);
  });
});
