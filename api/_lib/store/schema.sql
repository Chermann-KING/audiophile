-- Schéma d'authentification (idempotent : peut être rejoué sans effet).
-- Appliqué par `pnpm db:migrate` ; testé contre un vrai Postgres (PGlite) par postgres-stores.spec.ts.

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL,
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Un email = un compte, sans tenir compte de la casse.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- Seule l'empreinte SHA-256 du jeton est stockée : la table seule ne permet pas d'usurper une session.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash   text PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  expires_at   timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- Compteurs d'échecs de connexion (clés hachées : aucun email ni IP en clair).
CREATE TABLE IF NOT EXISTS login_attempts (
  key               text PRIMARY KEY,
  failures          integer     NOT NULL,
  window_started_at timestamptz NOT NULL,
  locked_until      timestamptz
);
