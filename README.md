# Audiophile

Boutique en ligne de matériel audio (casques, enceintes, écouteurs) : catalogue, panier, commande et compte.
Application Angular 22, standalone, sans zone.js (zoneless), composants OnPush, état en signaux.

## Démarrer

Prérequis : Node 22 et [pnpm](https://pnpm.io) 12 (npm et yarn sont refusés par le script `preinstall`).

```bash
pnpm install
pnpm json-server   # API de développement sur http://localhost:3000 (server/db.json)
pnpm start         # http://localhost:4200
```

| Commande | Rôle |
| --- | --- |
| `pnpm start` | serveur de développement |
| `pnpm test` | tests unitaires (Vitest, jsdom) |
| `pnpm lint` | ESLint, y compris la règle de dépendance entre couches |
| `pnpm build` | build de production dans `dist/` |

En production, l'API est servie par les fonctions Vercel du dossier `api/` (`/api/products`, `/api/orders`).

## Architecture

Clean Architecture par fonctionnalité : chaque tranche verticale a quatre couches.

```
src/app/
├── catalog/    produits, catégories, accueil
├── cart/       panier persistant (localStorage)
├── account/    session simulée, connexion, profil
├── checkout/   commande, confirmation, historique
│   └── <tranche>/
│       ├── domain/          entités, règles, erreurs, ports (abstract class) — TypeScript pur
│       ├── application/     use cases (@angular/core seulement)
│       ├── infrastructure/  adaptateurs HTTP / localStorage, DTO zod, mappers, <tranche>.providers.ts
│       ├── presentation/    composants, pages, stores à signaux, guards
│       └── testing/         doublures et fixtures de test
├── layout/     coque applicative (en-tête)
├── shared/     kernel/ (Result) et composants UI génériques
├── design-system/  composants du design system
└── core/       configuration technique (URL de l'API)
```

Règle de dépendance, vérifiée par `pnpm lint` (`eslint.boundaries.cjs`) :
`presentation → application → domain ← infrastructure`, tout vers `shared/kernel`.
Le domaine n'importe ni Angular, ni RxJS, ni zod ; la présentation n'importe pas l'infrastructure ;
le design system ne connaît aucune fonctionnalité.

Les décisions et les points ouverts sont consignés dans
[docs/audiophile-architecture-context-v0.1.md](docs/audiophile-architecture-context-v0.1.md).

## Tests

- Domaine et use cases : sans TestBed, avec des doublures en mémoire.
- Adaptateurs : `HttpTestingController` et `localStorage` de jsdom.
- Composants : rendu sans zone.js (réponses HTTP, signaux).
- Routage : tests de caractérisation de toutes les routes, gardes comprises.

## Intégration continue

`.github/workflows/ci.yml` exécute lint, tests et build à chaque pull request.
