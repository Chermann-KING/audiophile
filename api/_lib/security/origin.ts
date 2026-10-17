export interface OriginHeaders {
  readonly origin?: string;
  readonly host?: string;
  readonly 'x-forwarded-host'?: string;
}

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

// Défense CSRF des requêtes qui modifient des données : l'en-tête Origin est obligatoire
// et doit désigner l'hôte même de l'API (SameSite=Lax du cookie n'est qu'une défense en profondeur).
export function isSameOrigin(headers: OriginHeaders): boolean {
  const expectedHost = headers['x-forwarded-host'] ?? headers.host;
  if (!headers.origin || !expectedHost) return false;

  let origin: URL;
  try {
    origin = new URL(headers.origin);
  } catch {
    return false;
  }
  if (origin.origin === 'null' || origin.host !== expectedHost) return false;

  const local = LOCAL_HOSTNAMES.has(origin.hostname);
  return origin.protocol === 'https:' || (local && origin.protocol === 'http:');
}
