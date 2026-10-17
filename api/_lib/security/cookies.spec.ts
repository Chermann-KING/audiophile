import { describe, expect, it } from 'vitest';

import { SESSION_COOKIE, clearedSessionCookie, readSessionToken, serializeSessionCookie } from './cookies';

describe('serializeSessionCookie', () => {
  const cookie = serializeSessionCookie('jeton-opaque', 3600);

  it('utilise le préfixe __Host-', () => {
    expect(SESSION_COOKIE.startsWith('__Host-')).toBe(true);
    expect(cookie.startsWith(`${SESSION_COOKIE}=jeton-opaque`)).toBe(true);
  });

  it('pose HttpOnly, Secure, SameSite=Lax et Path=/', () => {
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Path=/');
  });

  it('borne la durée de vie', () => {
    expect(cookie).toContain('Max-Age=3600');
  });

  it('ne pose pas d’attribut Domain (cookie lié à l’hôte exact)', () => {
    expect(cookie).not.toMatch(/Domain=/i);
  });
});

describe('clearedSessionCookie', () => {
  it('expire immédiatement le cookie avec les mêmes attributs de sécurité', () => {
    const cookie = clearedSessionCookie();
    expect(cookie).toContain('Max-Age=0');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
  });
});

describe('readSessionToken', () => {
  it('lit le jeton parmi plusieurs cookies', () => {
    expect(readSessionToken(`a=1; ${SESSION_COOKIE}=abc123; b=2`)).toBe('abc123');
  });

  it.each([undefined, '', 'a=1; b=2', `${SESSION_COOKIE}=`, `x${SESSION_COOKIE}=abc`])(
    'renvoie null quand il n’y a pas de jeton (%j)',
    (header) => {
      expect(readSessionToken(header)).toBeNull();
    }
  );

  it('ignore un jeton de forme invalide', () => {
    expect(readSessionToken(`${SESSION_COOKIE}=a b`)).toBeNull();
    expect(readSessionToken(`${SESSION_COOKIE}=${'a'.repeat(300)}`)).toBeNull();
  });
});
