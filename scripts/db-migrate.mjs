// Applique api/_lib/store/schema.sql sur la base pointée par DATABASE_URL.
// Usage : pnpm db:migrate   (lit .env.local ; le schéma est idempotent, il peut être rejoué sans effet)
import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL manquante (voir .env.example).');
  process.exit(1);
}

const schema = await readFile(new URL('../api/_lib/store/schema.sql', import.meta.url), 'utf8');
// Le pilote HTTP de Neon n'exécute qu'une instruction par requête : on découpe le fichier, commentaires retirés.
const statements = schema
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

const sql = neon(url);
for (const statement of statements) {
  await sql.query(statement);
  console.log('OK :', statement.split('\n')[0]);
}
console.log(`${statements.length} instructions appliquées.`);
