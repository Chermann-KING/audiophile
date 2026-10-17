import { z } from 'zod';

// Schémas stricts : tout champ inconnu est refusé (pas d'affectation de masse : id, rôle, empreinte...).
const email = z.string().trim().min(3).max(254).email();
const name = z.string().trim().min(1).max(100);
// Borne haute large : la politique de mot de passe (15-128) répond avec une raison précise, mais on refuse les corps gigantesques.
const secret = z.string().min(1).max(1000);

export const registerSchema = z.object({ email, password: secret, firstName: name, lastName: name }).strict();

export const loginSchema = z.object({ email, password: secret }).strict();

export const profileSchema = z
  .object({ email: email.optional(), firstName: name.optional(), lastName: name.optional() })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), { message: 'au moins un champ' });

export const passwordChangeSchema = z.object({ currentPassword: secret, newPassword: secret }).strict();
