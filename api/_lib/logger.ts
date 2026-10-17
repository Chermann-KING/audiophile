import { createHash } from 'node:crypto';

// Journalisation des événements de sécurité (CTL-R10-09/10) : jamais de secret, email haché, une ligne JSON par événement.

export interface SecurityLogger {
  event(name: string, fields?: Record<string, unknown>): void;
}

const FORBIDDEN_FIELDS = new Set(['password', 'passwordhash', 'token', 'cookie', 'authorization', 'newpassword', 'currentpassword']);

const emailHash = (email: string): string => createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 12);

// Un retour à la ligne dans une valeur permettrait d'injecter une fausse entrée de journal (CWE-117).
const sanitize = (value: unknown): unknown => (typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ') : value);

export function createSecurityLogger(write: (line: string) => void = (line) => console.log(line)): SecurityLogger {
  return {
    event(name, fields = {}) {
      const entry: Record<string, unknown> = { event: name, at: new Date().toISOString() };

      for (const [key, value] of Object.entries(fields)) {
        if (FORBIDDEN_FIELDS.has(key.toLowerCase())) continue;
        if (key === 'email' && typeof value === 'string') entry['emailHash'] = emailHash(value);
        else entry[key] = sanitize(value);
      }
      write(JSON.stringify(entry));
    },
  };
}
