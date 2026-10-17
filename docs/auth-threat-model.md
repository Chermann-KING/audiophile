# Authentification — modèle de menaces léger

Périmètre : fonctions `api/auth/*` et `api/users/me*`, base Neon Postgres, cookie de session.
Contexte : projet de formation, aucun vrai utilisateur ; les contrôles sont appliqués comme pour un produit réel.
Références : `cyber-security` — CTL-R2-01 à 10 (ASVS 5.0 V6, V7, V8), CTL-R10-09/10 (journalisation).

## Actifs
- Comptes : email, nom, empreinte du mot de passe.
- Sessions : jeton opaque (équivaut à l'identité de l'utilisateur tant qu'il est valide).
- Disponibilité de la connexion (un verrouillage ne doit pas permettre de bloquer un tiers).

## Acteurs et frontières de confiance
- Visiteur anonyme (non fiable) → fonctions Vercel (frontière : tout le corps, les en-têtes et l'IP sont des entrées non fiables).
- Fonctions → Neon (frontière : requêtes paramétrées uniquement).
- Navigateur de l'utilisateur légitime (le cookie `HttpOnly` n'est pas lisible par le JavaScript de la page).

## Abus plausibles et contrôles

| # | Abus | Contrôle | Preuve (test) |
| --- | --- | --- | --- |
| 1 | Force brute / credential stuffing sur un compte | 3 échecs par couple email + IP → verrouillage 15 min ; plafond de 20 échecs par IP ; remise à zéro après succès | `rate-limit.spec.ts`, `auth-service.spec.ts` |
| 2 | Verrouiller le compte d'un tiers | compteur par couple email + IP (pas par email seul) | `rate-limit.spec.ts` |
| 3 | Énumération des emails à la connexion | même message, même code, hachage factice si compte inconnu | `auth-service.spec.ts` |
| 4 | Fuite de la base : mots de passe cassés hors ligne | scrypt N=2^17 r=8 p=1, sel par mot de passe, comparaison à temps constant | `password.spec.ts` |
| 5 | Vol du jeton de session par XSS | cookie `HttpOnly`, jamais dans `localStorage` ; jeton absent des réponses JSON | `cookies.spec.ts`, `auth-handlers.spec.ts` |
| 6 | Fuite de la table des sessions | seul le SHA-256 du jeton (256 bits) est stocké | `session.spec.ts` |
| 7 | Fixation de session | nouveau jeton à chaque connexion ; anciens jetons non réutilisables | `auth-service.spec.ts` |
| 8 | CSRF sur les routes qui modifient des données | cookie `SameSite=Lax` + en-tête `Origin` exigé et comparé à l'hôte ; corps `application/json` uniquement | `origin.spec.ts` |
| 9 | Accès au profil d'un autre utilisateur (BOLA) | routes `/users/me` : l'identité vient de la session, jamais d'un paramètre | `auth-handlers.spec.ts` |
| 10 | Élévation par champs en trop (mass assignment) | schémas zod stricts : seuls prénom, nom, email sont acceptés | `auth-handlers.spec.ts` |
| 11 | Session volée après changement de mot de passe | changement : mot de passe actuel exigé, autres sessions révoquées | `auth-service.spec.ts` |
| 12 | Session éternelle | expiration absolue 7 jours + inactivité 24 h ; révocation à la déconnexion | `session.spec.ts` |
| 13 | Mots de passe faibles | 15 à 128 caractères, aucune règle de composition, liste de mots interdits (dont le contexte : produit, email) | `password.spec.ts` |
| 14 | Secrets et données personnelles dans les journaux | journaux structurés sans mot de passe ni jeton ; email haché | `logger.spec.ts` |
| 15 | Injection SQL | requêtes paramétrées uniquement | `postgres-stores.spec.ts` (base Postgres réelle en mémoire) |

## Risques acceptés et points ouverts
- `ASSUMPTION` Pas de vérification de l'email à l'inscription (aucun service d'envoi) : un email déjà utilisé est détectable à l'inscription. Atténué par une limite d'inscriptions par IP ; à lever en ajoutant un envoi d'email de confirmation.
- `ASSUMPTION` L'IP client est lue dans `x-forwarded-for` posé par Vercel (valeur non falsifiable par le client sur Vercel) ; hors Vercel, ce contrôle ne serait pas fiable.
- `OPEN` Pas de MFA, pas de récupération de mot de passe (aucun canal d'envoi) : un mot de passe oublié n'est pas récupérable.
- `OPEN` Pas de liste de mots de passe compromis (HIBP) : seulement une liste locale courte.
- `DEFERRED` Alerte sur verrouillages répétés ; page « mes sessions ».
