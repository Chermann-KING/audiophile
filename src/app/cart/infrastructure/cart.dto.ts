import { z } from 'zod';

const lineSchema = z.object({
  productId: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  unitPrice: z.number().nonnegative(),
  imageUrl: z.string(),
  quantity: z.number().int().positive(),
});

// Ancien format persisté par le CartService : { product, quantity }.
const legacyLineSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string().optional(),
    price: z.number().nonnegative(),
    image: z.object({ desktop: z.string() }),
  }),
  quantity: z.number().int().positive(),
});

export const cartDtoSchema = z.union([z.array(lineSchema), z.array(legacyLineSchema)]);

export type LineDto = z.infer<typeof lineSchema>;
export type LegacyLineDto = z.infer<typeof legacyLineSchema>;
