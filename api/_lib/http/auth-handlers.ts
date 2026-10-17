import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ZodType } from 'zod';

import type { AuthService, UserView } from '../auth/auth-service';
import type { SecurityLogger } from '../logger';
import { clearedSessionCookie, readSessionToken, serializeSessionCookie } from '../security/cookies';
import { clientIp } from '../security/client-ip';
import { isSameOrigin } from '../security/origin';
import { loginSchema, passwordChangeSchema, profileSchema, registerSchema } from './schemas';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export interface AuthHandlers {
  readonly register: Handler;
  readonly login: Handler;
  readonly logout: Handler;
  readonly me: Handler;
  readonly updateProfile: Handler;
  readonly changePassword: Handler;
}

interface Context {
  readonly req: VercelRequest;
  readonly res: VercelResponse;
  readonly ip: string;
  readonly token: string | null;
}

interface RouteOptions {
  readonly methods: readonly string[];
  /** Requête qui modifie des données : l'en-tête Origin est exigé (défense CSRF). */
  readonly mutating: boolean;
  /** La requête porte un corps JSON : tout autre type de contenu est refusé (415). */
  readonly json: boolean;
}

const first = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value);

const send = (res: VercelResponse, status: number, body: unknown): void => {
  res.status(status).json(body);
};

const tooManyAttempts = (res: VercelResponse, retryAfterSeconds: number): void => {
  res.setHeader('Retry-After', String(Math.max(1, retryAfterSeconds)));
  send(res, 429, { error: 'too_many_attempts' });
};

export function createAuthHandlers(deps: { service: AuthService; logger: SecurityLogger }): AuthHandlers {
  const { service, logger } = deps;

  function route(options: RouteOptions, run: (context: Context) => Promise<void>): Handler {
    return async (req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      try {
        if (!options.methods.includes(req.method ?? '')) {
          res.setHeader('Allow', options.methods.join(', '));
          return send(res, 405, { error: 'method_not_allowed' });
        }
        if (options.mutating && !isSameOrigin({ origin: first(req.headers.origin), host: first(req.headers.host), 'x-forwarded-host': first(req.headers['x-forwarded-host']) })) {
          logger.event('csrf_rejected', { path: req.url ?? '' });
          return send(res, 403, { error: 'forbidden' });
        }
        if (options.json && !(first(req.headers['content-type']) ?? '').toLowerCase().startsWith('application/json')) {
          return send(res, 415, { error: 'unsupported_media_type' });
        }

        await run({ req, res, ip: clientIp(req.headers), token: readSessionToken(first(req.headers.cookie)) });
      } catch (error) {
        // Seul le type de l'erreur est journalisé : son message pourrait contenir un secret (chaîne de connexion...).
        logger.event('server_error', { kind: error instanceof Error ? error.constructor.name : 'unknown' });
        send(res, 500, { error: 'server_error' });
      }
    };
  }

  const parse = <T>(schema: ZodType<T>, { req, res }: Context): T | null => {
    const result = schema.safeParse(req.body);
    if (result.success) return result.data;
    send(res, 400, { error: 'invalid_request' });
    return null;
  };

  /** Exige une session valide ; répond 401 sinon. */
  async function requireUser(context: Context): Promise<UserView | null> {
    const session = await service.authenticate(context.token);
    if (session.ok) return session.value.user;

    if (context.token) context.res.setHeader('Set-Cookie', clearedSessionCookie());
    send(context.res, 401, { error: 'unauthenticated' });
    return null;
  }

  const openSession = (res: VercelResponse, status: number, session: { user: UserView; token: string; maxAgeSeconds: number }): void => {
    res.setHeader('Set-Cookie', serializeSessionCookie(session.token, session.maxAgeSeconds));
    send(res, status, { user: session.user });
  };

  return {
    register: route({ methods: ['POST'], mutating: true, json: true }, async (context) => {
      const body = parse(registerSchema, context);
      if (!body) return;

      const result = await service.register({ ...body, ip: context.ip });
      if (result.ok) return openSession(context.res, 201, result.value);

      const { error } = result;
      if (error.kind === 'LOCKED') return tooManyAttempts(context.res, error.retryAfterSeconds);
      if (error.kind === 'WEAK_PASSWORD') return send(context.res, 422, { error: 'weak_password', reason: error.reason });
      send(context.res, 409, { error: 'email_taken' });
    }),

    login: route({ methods: ['POST'], mutating: true, json: true }, async (context) => {
      const body = parse(loginSchema, context);
      if (!body) return;

      const result = await service.login({ ...body, ip: context.ip });
      if (result.ok) return openSession(context.res, 200, result.value);

      if (result.error.kind === 'LOCKED') return tooManyAttempts(context.res, result.error.retryAfterSeconds);
      send(context.res, 401, { error: 'invalid_credentials' });
    }),

    logout: route({ methods: ['POST'], mutating: true, json: false }, async ({ res, token }) => {
      if (token) await service.logout(token);
      res.setHeader('Set-Cookie', clearedSessionCookie());
      res.status(204).end();
    }),

    me: route({ methods: ['GET'], mutating: false, json: false }, async (context) => {
      const user = await requireUser(context);
      if (user) send(context.res, 200, { user });
    }),

    // L'identité vient de la session, jamais d'un paramètre : un utilisateur ne peut modifier que son propre profil.
    updateProfile: route({ methods: ['PUT'], mutating: true, json: true }, async (context) => {
      const user = await requireUser(context);
      if (!user) return;
      const body = parse(profileSchema, context);
      if (!body) return;

      const result = await service.updateProfile(user.id, body);
      if (result.ok) return send(context.res, 200, { user: result.value });
      send(context.res, result.error === 'EMAIL_TAKEN' ? 409 : 404, { error: result.error === 'EMAIL_TAKEN' ? 'email_taken' : 'not_found' });
    }),

    changePassword: route({ methods: ['POST'], mutating: true, json: true }, async (context) => {
      const user = await requireUser(context);
      if (!user || !context.token) return;
      const body = parse(passwordChangeSchema, context);
      if (!body) return;

      const result = await service.changePassword({ userId: user.id, sessionToken: context.token, ip: context.ip, ...body });
      if (result.ok) return void context.res.status(204).end();

      const { error } = result;
      if (error.kind === 'LOCKED') return tooManyAttempts(context.res, error.retryAfterSeconds);
      if (error.kind === 'WEAK_PASSWORD') return send(context.res, 422, { error: 'weak_password', reason: error.reason });
      send(context.res, 400, { error: 'invalid_current_password' });
    }),
  };
}
