// Préfixe __Host- : le navigateur n'accepte le cookie que Secure, Path=/ et sans attribut Domain.
export const SESSION_COOKIE = '__Host-session';

const ATTRIBUTES = 'Path=/; HttpOnly; Secure; SameSite=Lax';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,256}$/;

export const serializeSessionCookie = (token: string, maxAgeSeconds: number): string =>
  `${SESSION_COOKIE}=${token}; Max-Age=${maxAgeSeconds}; ${ATTRIBUTES}`;

export const clearedSessionCookie = (): string => `${SESSION_COOKIE}=; Max-Age=0; ${ATTRIBUTES}`;

export function readSessionToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name === SESSION_COOKIE) return TOKEN_PATTERN.test(value) ? value : null;
  }
  return null;
}
