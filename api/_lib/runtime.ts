import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { AuthService } from './auth/auth-service';
import { createAuthHandlers, type AuthHandlers, type Handler } from './http/auth-handlers';
import { createSecurityLogger } from './logger';
import { defaultPasswordHasher } from './security/password';
import { LoginThrottle } from './security/login-throttle';
import { createPostgresStores } from './store/postgres';

// Composition racine côté serveur : seul fichier qui lit l'environnement et branche Neon.
let cached: AuthHandlers | undefined;

function build(): AuthHandlers {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL manquante');

  const sql = neon(url);
  const stores = createPostgresStores({ query: async (text, params) => ({ rows: await sql.query(text, params) }) });
  const logger = createSecurityLogger();
  const service = new AuthService({
    stores,
    hasher: defaultPasswordHasher,
    throttle: new LoginThrottle(stores.attempts),
    logger,
    now: () => new Date(),
  });
  return createAuthHandlers({ service, logger });
}

/** Gestionnaire Vercel pour l'action demandée ; une mauvaise configuration donne une 500 générique, jamais un détail. */
export function authHandler(action: keyof AuthHandlers): Handler {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      cached ??= build();
    } catch {
      createSecurityLogger().event('server_misconfigured', { action });
      res.setHeader('Cache-Control', 'no-store');
      res.status(500).json({ error: 'server_error' });
      return;
    }
    await cached[action](req, res);
  };
}
