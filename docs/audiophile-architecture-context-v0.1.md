# Audiophile — contexte d'architecture (v0.1)

Source de vérité vivante. Étiquettes : `FACT`, `DECISION`, `ASSUMPTION`, `OPEN`, `DEFERRED`.

## Produit
- `FACT` Boutique en ligne de matériel audio (casques, enceintes, écouteurs) : catalogue, panier, commande, compte.
- `FACT` L'API est `json-server` en développement (`server/db.json`) et des fonctions Vercel en production (`api/products.js`, `api/orders.js`).
- `FACT` L'authentification est simulée côté client (aucun backend). Un guard de route n'est qu'un confort d'interface.
- `OPEN` Aucun endpoint `/users` n'existe dans `api/` alors que le client l'appelle (mise à jour du profil).

## Règle de dépendance (outillée par `eslint.boundaries.cjs`)
- `DECISION` `presentation → application → domain ← infrastructure` ; tout → `shared/kernel`.
- `DECISION` `domain` et `shared/kernel` : aucun import externe (ni Angular, ni RxJS, ni zod).
- `DECISION` `application` : `@angular/core` seulement (injection) ; `presentation` : ni zod ni `HttpClient`.
- `DECISION` Les ports sont des `abstract class` du domaine, renvoient `Promise<Result<T, E>>`.
- `DECISION` Les adaptateurs HTTP valident les réponses avec zod puis repassent par les invariants du domaine.
- `DECISION` Le câblage port → adaptateur se fait dans `infrastructure/<feature>.providers.ts`, branché dans les `providers` de route.
- `DECISION` Les use cases sont des `@Injectable()` fournis avec leur adaptateur (pas `@Service`, qui est racine et ne verrait pas les ports de route).

## Fonctionnalités (tranches verticales)
| Tranche | Contenu | État |
| --- | --- | --- |
| `catalog` | produits, catégories, accueil | fait (v0.1) |
| `cart` | panier persistant (localStorage) | à faire |
| `account` | session simulée, profil | à faire |
| `checkout` | commande, confirmation | à faire |

## Catalogue
- `FACT` Les catégories sont dérivées des produits ; l'API ne fournit que la liste complète des produits.
- `DECISION` Le filtrage, le tri (nouveaux d'abord puis ordre alphabétique) et la dérivation des catégories sont des règles du domaine.
- `FACT` Comportement historique conservé : les routes de catégories (`categories`, `:category`) sont montées sous `''`, `categories` et `products`.
- `DECISION` Les URL d'images des vignettes de catégorie sont une affaire de présentation, pas de domaine.

## Tests
- `DECISION` Domaine et use cases : test-first, sans TestBed (`Injector.create`) ; adaptateurs : `HttpTestingController` ; composants : rendu asynchrone sans zone.js.
