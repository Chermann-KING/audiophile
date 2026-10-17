import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32; // 256 bits, bien au-delà du minimum ASVS de 128 bits

export const generateSessionToken = (): string => randomBytes(TOKEN_BYTES).toString('base64url');

// Seule l'empreinte est stockée : une fuite de la table des sessions ne donne aucun jeton utilisable.
// SHA-256 suffit ici car le jeton est aléatoire à haute entropie (pas un mot de passe).
export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');
