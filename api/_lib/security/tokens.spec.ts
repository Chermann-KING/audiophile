import { describe, expect, it } from 'vitest';

import { generateSessionToken, hashToken } from './tokens';

describe('generateSessionToken', () => {
  it('produit un jeton base64url de 256 bits', () => {
    const token = generateSessionToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('ne produit jamais deux fois le même jeton', () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => generateSessionToken()));
    expect(tokens.size).toBe(1000);
  });
});

describe('hashToken', () => {
  it('produit un SHA-256 hexadécimal déterministe', () => {
    expect(hashToken('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('ne laisse pas le jeton en clair dans son empreinte', () => {
    const token = generateSessionToken();
    expect(hashToken(token)).not.toContain(token);
  });
});
