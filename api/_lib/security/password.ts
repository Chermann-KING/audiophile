import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

// Mots de passe : scrypt (repli documenté par OWASP, sans dépendance native en serverless).
// Paramètres OWASP : N=2^17, r=8, p=1. Format : scrypt$N$r$p$sel$haché (base64url).

export interface ScryptParams {
  readonly N: number;
  readonly r: number;
  readonly p: number;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, stored: string): Promise<boolean>;
  needsRehash(stored: string): boolean;
  /** Calcul factice de même coût : évite de distinguer un compte inconnu par le temps de réponse. */
  verifyDummy(password: string): Promise<void>;
}

const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const MAX_MEMORY_BYTES = 256 * 1024 * 1024;
const DEFAULT_PARAMS: ScryptParams = { N: 2 ** 17, r: 8, p: 1 };

const derive = (password: string, salt: Buffer, params: ScryptParams): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const options: ScryptOptions = { N: params.N, r: params.r, p: params.p, maxmem: MAX_MEMORY_BYTES };
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, options, (error, key) => (error ? reject(error) : resolve(key)));
  });

interface ParsedHash {
  readonly params: ScryptParams;
  readonly salt: Buffer;
  readonly key: Buffer;
}

function parse(stored: string): ParsedHash | null {
  const [scheme, n, r, p, salt, key, ...rest] = stored.split('$');
  if (scheme !== 'scrypt' || rest.length > 0 || !salt || !key) return null;

  const params = { N: Number(n), r: Number(r), p: Number(p) };
  const valid = [params.N, params.r, params.p].every((value) => Number.isInteger(value) && value > 0);
  const powerOfTwo = (params.N & (params.N - 1)) === 0;
  if (!valid || !powerOfTwo) return null;

  return { params, salt: Buffer.from(salt, 'base64url'), key: Buffer.from(key, 'base64url') };
}

export function createPasswordHasher(params: ScryptParams = DEFAULT_PARAMS): PasswordHasher {
  const dummySalt = randomBytes(SALT_LENGTH);

  return {
    async hash(password) {
      const salt = randomBytes(SALT_LENGTH);
      const key = await derive(password, salt, params);
      return ['scrypt', params.N, params.r, params.p, salt.toString('base64url'), key.toString('base64url')].join('$');
    },

    async verify(password, stored) {
      const parsed = parse(stored);
      if (!parsed || parsed.key.length !== KEY_LENGTH) return false;
      const candidate = await derive(password, parsed.salt, parsed.params);
      return timingSafeEqual(candidate, parsed.key);
    },

    needsRehash(stored) {
      const parsed = parse(stored);
      if (!parsed) return true;
      return parsed.params.N < params.N || parsed.params.r < params.r || parsed.params.p < params.p;
    },

    async verifyDummy(password) {
      await derive(password, dummySalt, params);
    },
  };
}

export const defaultPasswordHasher = createPasswordHasher();

// ---- Politique de mots de passe (NIST SP 800-63B-4, ASVS V6.2) ----

export type PasswordPolicyError = 'TOO_SHORT' | 'TOO_LONG' | 'COMMON' | 'CONTAINS_CONTEXT';

export const MIN_PASSWORD_LENGTH = 15;
export const MAX_PASSWORD_LENGTH = 128;
const PRODUCT_NAME = 'audiophile';
const MIN_EMAIL_PART_LENGTH = 4;

// Liste volontairement courte : à remplacer par une liste de mots de passe compromis (HIBP) si le projet grandit.
const COMMON_PASSWORDS = new Set([
  'passwordpassword',
  'passwordpassword1',
  '123456789012345',
  '1234567890123456',
  '12345678901234567890',
  'azertyuiopqsdfgh',
  'azertyuiopqsdfghjklm',
  'qwertyuiopasdfgh',
  'qwertyuiopasdfghjkl',
  'iloveyouiloveyou',
  'abcdefghijklmnop1',
]);

export function validatePasswordPolicy(password: string, context: { email?: string } = {}): PasswordPolicyError | null {
  const length = [...password.normalize('NFKC')].length;
  if (length < MIN_PASSWORD_LENGTH) return 'TOO_SHORT';
  if (length > MAX_PASSWORD_LENGTH) return 'TOO_LONG';

  const lowered = password.normalize('NFKC').toLowerCase();
  if (COMMON_PASSWORDS.has(lowered)) return 'COMMON';
  if (lowered.includes(PRODUCT_NAME) || containsEmailPart(lowered, context.email)) return 'CONTAINS_CONTEXT';
  return null;
}

function containsEmailPart(lowered: string, email?: string): boolean {
  if (!email) return false;
  const local = email.toLowerCase().split('@')[0] ?? '';
  return local.length >= MIN_EMAIL_PART_LENGTH && lowered.includes(local);
}
