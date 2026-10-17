import { beforeEach, describe, expect, it } from 'vitest';

import type { AttemptPolicy, AttemptStore, SessionStore, UserStore } from './ports';

export interface Stores {
  readonly users: UserStore;
  readonly sessions: SessionStore;
  readonly attempts: AttemptStore;
}

const T0 = new Date('2026-10-17T10:00:00.000Z');
const minutes = (count: number) => count * 60_000;
const at = (offsetMs: number) => new Date(T0.getTime() + offsetMs);

const NEW_USER = { email: 'Jane@Example.com', firstName: 'Jane', lastName: 'Doe', passwordHash: 'hash-1' };
const POLICY: AttemptPolicy = { windowMs: minutes(15), maxFailures: 3, lockMs: minutes(15) };

// Suite de contrat : exécutée contre chaque implémentation (mémoire et Postgres réel) pour garantir le même comportement.
export function describeStores(label: string, createStores: () => Promise<Stores>): void {
  describe(`${label} — UserStore`, () => {
    let users: UserStore;
    beforeEach(async () => {
      users = (await createStores()).users;
    });

    it('crée un utilisateur et lui attribue un identifiant', async () => {
      const created = await users.create(NEW_USER);
      expect(created).not.toBe('EMAIL_TAKEN');
      expect(created).toMatchObject({ firstName: 'Jane', lastName: 'Doe', passwordHash: 'hash-1' });
      expect(typeof (created as { id: string }).id).toBe('string');
    });

    it('retrouve un utilisateur par email sans tenir compte de la casse', async () => {
      await users.create(NEW_USER);
      expect((await users.findByEmail('jane@example.com'))?.firstName).toBe('Jane');
      expect((await users.findByEmail('JANE@EXAMPLE.COM'))?.firstName).toBe('Jane');
    });

    it('retrouve un utilisateur par identifiant', async () => {
      const created = await users.create(NEW_USER);
      if (created === 'EMAIL_TAKEN') throw new Error('inattendu');
      expect((await users.findById(created.id))?.email).toBe('Jane@Example.com');
    });

    it('renvoie null pour un utilisateur inconnu', async () => {
      expect(await users.findByEmail('nobody@example.com')).toBeNull();
      expect(await users.findById('00000000-0000-4000-8000-000000000000')).toBeNull();
    });

    it('refuse un second compte avec le même email (casse ignorée)', async () => {
      await users.create(NEW_USER);
      expect(await users.create({ ...NEW_USER, email: 'jane@example.com' })).toBe('EMAIL_TAKEN');
    });

    it('met à jour le profil', async () => {
      const created = await users.create(NEW_USER);
      if (created === 'EMAIL_TAKEN') throw new Error('inattendu');
      const updated = await users.update(created.id, { firstName: 'Janet', email: 'janet@example.com' });
      expect(updated).toMatchObject({ firstName: 'Janet', lastName: 'Doe', email: 'janet@example.com' });
    });

    it('refuse de prendre l’email d’un autre compte', async () => {
      await users.create(NEW_USER);
      const other = await users.create({ ...NEW_USER, email: 'other@example.com' });
      if (other === 'EMAIL_TAKEN') throw new Error('inattendu');
      expect(await users.update(other.id, { email: 'JANE@example.com' })).toBe('EMAIL_TAKEN');
    });

    it('renvoie null en mettant à jour un utilisateur inconnu', async () => {
      expect(await users.update('00000000-0000-4000-8000-000000000000', { firstName: 'X' })).toBeNull();
    });

    it('remplace l’empreinte du mot de passe', async () => {
      const created = await users.create(NEW_USER);
      if (created === 'EMAIL_TAKEN') throw new Error('inattendu');
      await users.setPasswordHash(created.id, 'hash-2');
      expect((await users.findById(created.id))?.passwordHash).toBe('hash-2');
    });

    it('traite une tentative d’injection SQL comme une simple valeur', async () => {
      await users.create(NEW_USER);
      expect(await users.findByEmail("' OR '1'='1")).toBeNull();
      expect(await users.findByEmail('jane@example.com\'; DROP TABLE users; --')).toBeNull();
      expect((await users.findByEmail('jane@example.com'))?.firstName).toBe('Jane');
    });
  });

  describe(`${label} — SessionStore`, () => {
    let stores: Stores;
    let userId: string;
    beforeEach(async () => {
      stores = await createStores();
      const created = await stores.users.create(NEW_USER);
      if (created === 'EMAIL_TAKEN') throw new Error('inattendu');
      userId = created.id;
    });

    const record = (tokenHash: string, expiresInMs = minutes(60)) => ({
      tokenHash,
      userId,
      createdAt: T0,
      lastSeenAt: T0,
      expiresAt: at(expiresInMs),
    });

    it('crée puis retrouve une session par l’empreinte du jeton', async () => {
      await stores.sessions.create(record('h1'));
      expect(await stores.sessions.findByTokenHash('h1')).toEqual(record('h1'));
      expect(await stores.sessions.findByTokenHash('inconnu')).toBeNull();
    });

    it('met à jour la dernière activité', async () => {
      await stores.sessions.create(record('h1'));
      await stores.sessions.touch('h1', at(minutes(10)));
      expect((await stores.sessions.findByTokenHash('h1'))?.lastSeenAt).toEqual(at(minutes(10)));
    });

    it('supprime une session', async () => {
      await stores.sessions.create(record('h1'));
      await stores.sessions.delete('h1');
      expect(await stores.sessions.findByTokenHash('h1')).toBeNull();
    });

    it('supprime toutes les sessions d’un utilisateur sauf une', async () => {
      await stores.sessions.create(record('h1'));
      await stores.sessions.create(record('h2'));
      await stores.sessions.create(record('h3'));
      await stores.sessions.deleteAllForUser(userId, 'h2');

      expect(await stores.sessions.findByTokenHash('h1')).toBeNull();
      expect(await stores.sessions.findByTokenHash('h2')).not.toBeNull();
      expect(await stores.sessions.findByTokenHash('h3')).toBeNull();
    });

    it('supprime toutes les sessions quand aucune exception n’est donnée', async () => {
      await stores.sessions.create(record('h1'));
      await stores.sessions.deleteAllForUser(userId);
      expect(await stores.sessions.findByTokenHash('h1')).toBeNull();
    });

    it('purge les sessions expirées', async () => {
      await stores.sessions.create(record('vieux', minutes(5)));
      await stores.sessions.create(record('recent', minutes(120)));
      await stores.sessions.deleteExpired(at(minutes(30)));

      expect(await stores.sessions.findByTokenHash('vieux')).toBeNull();
      expect(await stores.sessions.findByTokenHash('recent')).not.toBeNull();
    });
  });

  describe(`${label} — AttemptStore`, () => {
    let attempts: AttemptStore;
    beforeEach(async () => {
      attempts = (await createStores()).attempts;
    });

    it('n’a aucun verrou au départ', async () => {
      expect(await attempts.lockedUntil('k', T0)).toBeNull();
    });

    it('compte les échecs sans verrouiller sous le seuil', async () => {
      expect(await attempts.registerFailure('k', T0, POLICY)).toEqual({ failures: 1, lockedUntil: null });
      expect(await attempts.registerFailure('k', at(1000), POLICY)).toEqual({ failures: 2, lockedUntil: null });
    });

    it('verrouille 15 minutes au troisième échec', async () => {
      await attempts.registerFailure('k', T0, POLICY);
      await attempts.registerFailure('k', at(1000), POLICY);
      const third = await attempts.registerFailure('k', at(2000), POLICY);

      expect(third).toEqual({ failures: 3, lockedUntil: at(2000 + minutes(15)) });
      expect(await attempts.lockedUntil('k', at(minutes(5)))).toEqual(at(2000 + minutes(15)));
    });

    it('lève le verrou à l’échéance et repart de zéro', async () => {
      for (const offset of [0, 1000, 2000]) await attempts.registerFailure('k', at(offset), POLICY);

      expect(await attempts.lockedUntil('k', at(2000 + minutes(15) + 1))).toBeNull();
      expect(await attempts.registerFailure('k', at(2000 + minutes(15) + 1), POLICY)).toEqual({ failures: 1, lockedUntil: null });
    });

    it('oublie les échecs anciens hors de la fenêtre', async () => {
      await attempts.registerFailure('k', T0, POLICY);
      await attempts.registerFailure('k', at(1000), POLICY);

      expect(await attempts.registerFailure('k', at(minutes(16)), POLICY)).toEqual({ failures: 1, lockedUntil: null });
    });

    it('remet le compteur à zéro après un succès', async () => {
      await attempts.registerFailure('k', T0, POLICY);
      await attempts.reset('k');
      expect(await attempts.registerFailure('k', at(1000), POLICY)).toEqual({ failures: 1, lockedUntil: null });
    });

    it('garde des compteurs indépendants par clé', async () => {
      for (const offset of [0, 1000, 2000]) await attempts.registerFailure('a', at(offset), POLICY);

      expect(await attempts.lockedUntil('a', at(3000))).not.toBeNull();
      expect(await attempts.lockedUntil('b', at(3000))).toBeNull();
    });

    it('compte correctement des échecs simultanés', async () => {
      await Promise.all(Array.from({ length: 5 }, () => attempts.registerFailure('k', T0, POLICY)));
      const next = await attempts.registerFailure('k', at(1000), POLICY);

      expect(next.failures).toBe(6);
      expect(next.lockedUntil).not.toBeNull();
    });
  });
}
