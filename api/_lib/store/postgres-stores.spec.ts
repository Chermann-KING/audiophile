import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

import { createPostgresStores } from './postgres';
import { describeStores } from './stores.contract';

const SCHEMA = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

// Vrai Postgres (WASM, en mémoire) : le SQL, les contraintes et l'atomicité sont réellement exécutés.
describeStores('Postgres', async () => {
  const db = new PGlite();
  await db.exec(SCHEMA);
  return createPostgresStores({ query: (text, params) => db.query(text, params) });
});
