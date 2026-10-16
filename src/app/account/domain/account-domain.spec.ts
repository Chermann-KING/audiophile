import { aUser } from '../testing/account.fixture';
import { createCredentials } from './credentials';
import { createPasswordChange } from './password-change';
import { createUser } from './user';

describe('createUser', () => {
  it('accepte un utilisateur valide', () => {
    expect(createUser(aUser())).toEqual({ ok: true, value: aUser() });
  });

  it.each([
    ['email', { email: 'pas-un-email' }, 'INVALID_EMAIL'],
    ['prénom', { firstName: '  ' }, 'EMPTY_NAME'],
    ['nom', { lastName: '' }, 'EMPTY_NAME'],
  ] as const)('refuse un %s invalide', (_label, overrides, error) => {
    expect(createUser(aUser(overrides))).toEqual({ ok: false, error });
  });
});

describe('createCredentials', () => {
  it('accepte un email valide et un mot de passe de 6 caractères', () => {
    expect(createCredentials('a@b.co', 'secret')).toEqual({ ok: true, value: { email: 'a@b.co', password: 'secret' } });
  });

  it('retire les espaces autour de l’email', () => {
    const result = createCredentials('  a@b.co ', 'secret');
    expect(result.ok && result.value.email).toBe('a@b.co');
  });

  it('refuse un email invalide', () => {
    expect(createCredentials('nope', 'secret')).toEqual({ ok: false, error: 'INVALID_EMAIL' });
  });

  it('refuse un mot de passe trop court', () => {
    expect(createCredentials('a@b.co', '12345')).toEqual({ ok: false, error: 'PASSWORD_TOO_SHORT' });
  });
});

describe('createPasswordChange', () => {
  const valid = { current: 'old-password', next: 'new-password', confirmation: 'new-password' };

  it('accepte un changement valide', () => {
    expect(createPasswordChange(valid)).toEqual({ ok: true, value: { current: 'old-password', next: 'new-password' } });
  });

  it('exige le mot de passe actuel', () => {
    expect(createPasswordChange({ ...valid, current: '' })).toEqual({ ok: false, error: 'CURRENT_REQUIRED' });
  });

  it('refuse un nouveau mot de passe de moins de 8 caractères', () => {
    expect(createPasswordChange({ ...valid, next: 'short', confirmation: 'short' })).toEqual({
      ok: false,
      error: 'NEW_TOO_SHORT',
    });
  });

  it('refuse une confirmation différente', () => {
    expect(createPasswordChange({ ...valid, confirmation: 'autre-chose' })).toEqual({ ok: false, error: 'MISMATCH' });
  });
});
