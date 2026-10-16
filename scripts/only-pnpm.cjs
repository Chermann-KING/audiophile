// Gabarit : garde « pnpm uniquement ». Emplacement : scripts/only-pnpm.cjs ; package.json : "preinstall": "node scripts/only-pnpm.cjs".
// Remplace `npx only-allow pnpm` (qui dépend de npx et ne détecte pas npm lancé sous pnpm). Validé lors de la validation du skill :
// exit 0 sous pnpm, exit 1 avec un user-agent npm (simulé). `packageManager: pnpm@<version>` est déjà écrit par `ng new`.
const agent = process.env.npm_config_user_agent || '';
if (!agent.startsWith('pnpm/')) {
  console.error('Ce projet utilise pnpm uniquement (npm, yarn et bun sont refusés).');
  process.exit(1);
}
