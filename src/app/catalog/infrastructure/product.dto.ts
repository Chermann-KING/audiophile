import { z } from 'zod';

const imageSchema = z.object({ mobile: z.string(), tablet: z.string(), desktop: z.string() });

export const productDtoSchema = z.object({
  id: z.string().min(1),
  slug: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  image: imageSchema,
  category: z.string(),
  categoryImage: imageSchema,
  new: z.boolean(),
  price: z.number(),
  description: z.string(),
  features: z.string(),
  includes: z.array(z.object({ quantity: z.number(), item: z.string() })),
  gallery: z.object({ first: imageSchema, second: imageSchema, third: imageSchema }),
  others: z.array(z.object({ slug: z.string(), name: z.string(), image: imageSchema })),
});

export type ProductDto = z.infer<typeof productDtoSchema>;
