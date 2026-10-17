import { describe, expect, it } from 'vitest';

import { createMemoryStores } from '../store/memory';
import { LoginThrottle } from './login-throttle';

const T0 = new Date('2026-10-17T10:00:00.000Z');
const at = (ms: number) => new Date(T0.getTime() + ms);
const minutes = (count: number) => count * 60_000;

const setup = () => {
  const stores = createMemoryStores();
  return { stores, throttle: new LoginThrottle(stores.attempts) };
};

async function failTimes(throttle: LoginThrottle, email: string, ip: string, times: number, start = 0) {
  for (let i = 0; i < times; i++) await throttle.recordFailure(email, ip, at(start + i * 1000));
}

describe('LoginThrottle', () => {
  it('autorise une première tentative', async () => {
    const { throttle } = setup();
    expect(await throttle.check('a@example.com', '203.0.113.1', T0)).toEqual({ locked: false });
  });

  it('verrouille après 3 échecs pour le même couple email + IP', async () => {
    const { throttle } = setup();
    await failTimes(throttle, 'a@example.com', '203.0.113.1', 3);

    const result = await throttle.check('a@example.com', '203.0.113.1', at(5000));
    expect(result.locked).toBe(true);
  });

  it('ne verrouille pas encore après 2 échecs', async () => {
    const { throttle } = setup();
    await failTimes(throttle, 'a@example.com', '203.0.113.1', 2);
    expect(await throttle.check('a@example.com', '203.0.113.1', at(5000))).toEqual({ locked: false });
  });

  it('indique le délai restant en secondes', async () => {
    const { throttle } = setup();
    await failTimes(throttle, 'a@example.com', '203.0.113.1', 3);

    const result = await throttle.check('a@example.com', '203.0.113.1', at(2000 + minutes(5)));
    expect(result).toEqual({ locked: true, retryAfterSeconds: 600 });
  });

  it('lève le verrou au bout de 15 minutes', async () => {
    const { throttle } = setup();
    await failTimes(throttle, 'a@example.com', '203.0.113.1', 3);

    expect(await throttle.check('a@example.com', '203.0.113.1', at(2000 + minutes(15) + 1))).toEqual({ locked: false });
  });

  it('ne permet pas de verrouiller le compte d’un tiers depuis une autre IP', async () => {
    const { throttle } = setup();
    await failTimes(throttle, 'victime@example.com', '203.0.113.66', 10);

    expect(await throttle.check('victime@example.com', '198.51.100.7', at(20_000))).toEqual({ locked: false });
  });

  it('ne tient pas compte de la casse de l’email', async () => {
    const { throttle } = setup();
    await failTimes(throttle, 'A@Example.com', '203.0.113.1', 3);
    expect((await throttle.check('a@example.com', '203.0.113.1', at(5000))).locked).toBe(true);
  });

  it('plafonne les échecs par IP pour contrer le credential stuffing sur plusieurs comptes', async () => {
    const { throttle } = setup();
    for (let i = 0; i < 20; i++) await throttle.recordFailure(`user${i}@example.com`, '203.0.113.9', at(i * 1000));

    const result = await throttle.check('encore-un-autre@example.com', '203.0.113.9', at(30_000));
    expect(result.locked).toBe(true);
  });

  it('remet à zéro le compteur du couple après une connexion réussie', async () => {
    const { throttle } = setup();
    await failTimes(throttle, 'a@example.com', '203.0.113.1', 2);
    await throttle.recordSuccess('a@example.com', '203.0.113.1');
    await failTimes(throttle, 'a@example.com', '203.0.113.1', 2, 10_000);

    expect(await throttle.check('a@example.com', '203.0.113.1', at(20_000))).toEqual({ locked: false });
  });

  it('ne stocke ni email ni adresse IP en clair', async () => {
    const stores = createMemoryStores();
    const keys: string[] = [];
    const spy = {
      ...stores.attempts,
      registerFailure: async (key: string, ...rest: Parameters<typeof stores.attempts.registerFailure> extends [string, ...infer R] ? R : never) => {
        keys.push(key);
        return stores.attempts.registerFailure(key, ...rest);
      },
    };
    await new LoginThrottle(spy).recordFailure('secret@example.com', '203.0.113.1', T0);

    expect(keys.join(' ')).not.toContain('secret@example.com');
    expect(keys.join(' ')).not.toContain('203.0.113.1');
  });
});
