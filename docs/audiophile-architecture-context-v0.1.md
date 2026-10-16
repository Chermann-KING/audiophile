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
| `cart` | panier persistant (localStorage) | fait |
| `account` | session simulée, profil | fait |
| `checkout` | commande, confirmation | à faire |

## Catalogue
- `FACT` Les catégories sont dérivées des produits ; l'API ne fournit que la liste complète des produits.
- `DECISION` Le filtrage, le tri (nouveaux d'abord puis ordre alphabétique) et la dérivation des catégories sont des règles du domaine.
- `FACT` Comportement historique conservé : les routes de catégories (`categories`, `:category`) sont montées sous `''`, `categories` et `products`.
- `DECISION` Les URL d'images des vignettes de catégorie sont une affaire de présentation, pas de domaine.

## Tests
- `DECISION` Domaine et use cases : test-first, sans TestBed (`Injector.create`) ; adaptateurs : `HttpTestingController` ; composants : rendu asynchrone sans zone.js.

## Panier
- `FACT` Le panier est un état global : badge de l'en-tête, fiche produit et commande le partagent ; il est donc fourni à la racine (`provideCart()` dans `app.config.ts`).
- `DECISION` Le panier ne dépend pas du catalogue : une ligne est un instantané du produit (`CartProduct` : id, nom, nom court, prix, image) pris à l'ajout.
- `DECISION` Règles du domaine : quantité entière strictement positive à l'ajout, entière ≥ 0 pour une mise à jour (0 retire la ligne), cumul des quantités d'un même produit.
- `DECISION` `CartStore` (signaux, présentation) est l'API publique de la tranche pour les autres tranches ; les use cases restent purs et synchrones (port `CartRepository` synchrone, état local).
- `FACT` Compatibilité : la clé `localStorage` `cart` est conservée ; l'ancien format `{ product, quantity }` est relu et converti. Un contenu illisible donne un panier vide.
- `ASSUMPTION` Les prix du panier ne sont pas revalidés côté serveur (le serveur recalcule les totaux à la commande, voir `api/orders.js`).

## Compte
- `FACT` L'authentification est une démonstration : `MockAuthenticator` ouvre une session pour tout couple email valide / mot de passe d'au moins 6 caractères, après 800 ms simulées. Aucun mot de passe n'est vérifié.
- `DECISION` La session est un état global (`provideAccount()` à la racine) ; `AccountStore` (signaux) est l'API publique de la tranche (en-tête, commande, guard).
- `DECISION` Règles du domaine : email valide, prénom et nom non vides ; mot de passe d'au moins 6 caractères à la connexion ; nouveau mot de passe d'au moins 8 caractères, confirmé, avec mot de passe actuel renseigné.
- `FACT` Les clés `localStorage` `currentUser` et `token` sont conservées : les sessions existantes survivent à la migration.
- `DECISION` `authGuard` est une aide de navigation uniquement ; toute autorisation réelle doit être faite côté serveur (aucun backend d'authentification aujourd'hui).
- `FACT` Correction au passage : le formulaire de profil envoyait les champs de mot de passe dans le corps du `PUT /users/:id`. Seuls prénom, nom et email sont désormais envoyés ; le changement de mot de passe n'est déclenché que si l'un des champs de mot de passe est rempli (conforme au texte de l'interface).
- `OPEN` Les endpoints `PUT /users/:id` et `POST /users/change-password` n'existent pas dans `api/` : la mise à jour du profil échoue en production.
- `OPEN` L'onglet « commandes » du profil utilise encore l'identifiant utilisateur codé en dur `1` (traité dans la tranche `checkout`).
