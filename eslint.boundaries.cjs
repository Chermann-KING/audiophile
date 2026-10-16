// @ts-check
// Règle de dépendance : presentation → application → domain ← infrastructure ; tout → shared/kernel.
const boundaries = require('eslint-plugin-boundaries');

const external = (...source) => ({ module: { origin: 'external', source } });
const layer = (type) => ({
  type,
  pattern: `src/app/*/${type}/**`,
  partialMatch: false,
  capture: ['feature'],
});

module.exports = [
  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      // Sans résolveur TypeScript, les imports relatifs ne sont pas résolus : aucune erreur remontée.
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      'boundaries/elements': [
        { type: 'kernel', pattern: 'src/app/shared/kernel/**', partialMatch: false },
        // UI générique, sans connaissance du métier : design system, composants et directives partagés.
        { type: 'ui', pattern: ['src/app/design-system/**', 'src/app/design-showcase/**', 'src/app/shared/components/**', 'src/app/shared/directives/**'], partialMatch: false },
        // Coque applicative : assemble les fonctionnalités (en-tête avec compte et panier).
        { type: 'shell', pattern: 'src/app/layout/**', partialMatch: false },
        layer('domain'),
        layer('application'),
        layer('infrastructure'),
        layer('presentation'),
        { type: 'core', pattern: 'src/app/core/**', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          checkAllOrigins: true,
          policies: [
            { allow: { to: { module: { origin: ['external', 'core'] } } } },
            { from: { element: { type: 'core' } }, allow: { to: { element: { types: { anyOf: ['core', 'kernel'] } } } } },
            { from: { element: { type: 'kernel' } }, allow: { to: { element: { type: 'kernel' } } } },
            { from: { element: { type: 'domain' } }, allow: { to: { element: { types: { anyOf: ['domain', 'kernel'] } } } } },
            { from: { element: { type: 'application' } }, allow: { to: { element: { types: { anyOf: ['application', 'domain', 'kernel'] } } } } },
            { from: { element: { type: 'infrastructure' } }, allow: { to: { element: { types: { anyOf: ['infrastructure', 'domain', 'kernel', 'core'] } } } } },
            { from: { element: { type: 'presentation' } }, allow: { to: { element: { types: { anyOf: ['presentation', 'application', 'domain', 'kernel', 'core', 'ui'] } } } } },
            { from: { element: { type: 'ui' } }, allow: { to: { element: { types: { anyOf: ['ui', 'kernel'] } } } } },
            { from: { element: { type: 'shell' } }, allow: { to: { element: { types: { anyOf: ['shell', 'presentation', 'application', 'domain', 'kernel', 'core', 'ui'] } } } } },
            // Domaine et noyau purs : aucun paquet externe.
            { from: { element: { types: { anyOf: ['domain', 'kernel'] } } }, disallow: { to: external('**') } },
            // Application : @angular/core seulement (injection), ni RxJS ni zod ni HTTP.
            { from: { element: { type: 'application' } }, disallow: { to: external('rxjs', 'rxjs/**', 'zod', '@angular/common*', '@angular/router*', '@angular/forms*', '@angular/platform-browser*') } },
            // Présentation : ni zod ni HttpClient.
            { from: { element: { type: 'presentation' } }, disallow: { to: external('zod') } },
            { from: { element: { type: 'presentation' } }, disallow: { to: { module: { origin: 'external', source: '@angular/common', internalPath: 'http*' } } } },
          ],
        },
      ],
    },
  },
  // Racines de composition (routes, providers de feature, app.*) et tests : ont le droit de tout câbler.
  {
    files: ['**/*.spec.ts', '**/*.routes.ts', '**/infrastructure/*.providers.ts', 'src/app/app.*.ts', 'src/main.ts'],
    rules: { 'boundaries/dependencies': 'off' },
  },
];
