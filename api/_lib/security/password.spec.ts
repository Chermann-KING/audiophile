import { describe, expect, it } from 'vitest';

import { createPasswordHasher, defaultPasswordHasher, validatePasswordPolicy } from './password';

// Paramètres réduits pour que les tests restent rapides ; le format et la logique sont identiques.
const fast = createPasswordHasher({ N: 1024, r: 8, p: 1 });

describe('PasswordHasher', () => {
  it('produit un haché au format scrypt avec les paramètres par défaut OWASP (N=2^17, r=8, p=1)', async () => {
    const hash = await defaultPasswordHasher.hash('correct horse battery staple');
    expect(hash).toMatch(/^scrypt\$131072\$8\$1\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
  });

  it('vérifie un mot de passe correct et refuse un mot de passe incorrect', async () => {
    const hash = await fast.hash('correct horse battery staple');
    expect(await fast.verify('correct horse battery staple', hash)).toBe(true);
    expect(await fast.verify('correct horse battery stapl', hash)).toBe(false);
  });

  it('utilise un sel différent à chaque haché', async () => {
    expect(await fast.hash('same password value')).not.toBe(await fast.hash('same password value'));
  });

  it('normalise Unicode (NFKC) avant le hachage', async () => {
    const hash = await fast.hash('café café café café');
    expect(await fast.verify('café café café café', hash)).toBe(true);
  });

  it('refuse un haché mal formé ou aux paramètres inconnus sans lever d’erreur', async () => {
    expect(await fast.verify('x', 'pas-un-hache')).toBe(false);
    expect(await fast.verify('x', 'scrypt$abc$8$1$AAAA$BBBB')).toBe(false);
    expect(await fast.verify('x', 'bcrypt$10$8$1$AAAA$BBBB')).toBe(false);
  });

  it('signale un haché aux paramètres plus faibles comme à renouveler', async () => {
    const weak = await fast.hash('some long enough password');
    const strong = createPasswordHasher({ N: 2048, r: 8, p: 1 });
    expect(strong.needsRehash(weak)).toBe(true);
    expect(strong.needsRehash(await strong.hash('some long enough password'))).toBe(false);
  });

  it('exécute un calcul factice du même coût pour un compte inconnu', async () => {
    await expect(fast.verifyDummy('whatever password')).resolves.toBeUndefined();
  });
});

describe('validatePasswordPolicy', () => {
  const ok = 'violet-parapluie-lent-1923';

  it('accepte une phrase de passe de 15 caractères ou plus sans règle de composition', () => {
    expect(validatePasswordPolicy('abcdefghijklmno')).toBeNull();
    expect(validatePasswordPolicy(ok)).toBeNull();
  });

  it('refuse moins de 15 caractères', () => {
    expect(validatePasswordPolicy('abcdefghijklmn')).toBe('TOO_SHORT');
  });

  it('accepte 64 caractères et refuse plus de 128', () => {
    expect(validatePasswordPolicy('a1'.repeat(32))).toBeNull();
    expect(validatePasswordPolicy('ab'.repeat(65))).toBe('TOO_LONG');
  });

  it('compte les caractères Unicode et pas les unités UTF-16', () => {
    expect(validatePasswordPolicy('😀'.repeat(15))).toBeNull();
  });

  it('refuse un mot de passe de la liste des mots de passe courants', () => {
    expect(validatePasswordPolicy('passwordpassword')).toBe('COMMON');
    expect(validatePasswordPolicy('123456789012345')).toBe('COMMON');
  });

  it('refuse un mot de passe qui contient le nom du produit', () => {
    expect(validatePasswordPolicy('mon-Audiophile-secret')).toBe('CONTAINS_CONTEXT');
  });

  it('refuse un mot de passe qui contient la partie locale de l’email', () => {
    expect(validatePasswordPolicy('jonathan-doe-2026-ok', { email: 'jonathan@example.com' })).toBe('CONTAINS_CONTEXT');
    expect(validatePasswordPolicy(ok, { email: 'jonathan@example.com' })).toBeNull();
  });
});
