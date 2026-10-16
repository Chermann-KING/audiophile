import { z } from 'zod';

export const userDtoSchema = z.object({
  id: z.string().min(1),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  photoURL: z.string().optional(),
});

export type UserDto = z.infer<typeof userDtoSchema>;
