import { defineConfig } from 'vitest/config';

// Tests des fonctions serverless (api/), indépendants du build Angular.
export default defineConfig({
  test: {
    include: ['api/**/*.spec.ts'],
    environment: 'node',
    testTimeout: 20000,
  },
});
