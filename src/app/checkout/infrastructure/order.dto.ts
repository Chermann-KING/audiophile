import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string(),
});

export const orderDtoSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  zipCode: z.string(),
  city: z.string(),
  country: z.string(),
  paymentMethod: z.enum(['cash', 'emoney']),
  emoneyNumber: z.string().optional(),
  emoneyPin: z.string().optional(),
  items: z.array(itemSchema),
  subtotal: z.number(),
  shipping: z.number(),
  vat: z.number(),
  total: z.number(),
  status: z.string().optional(),
  date: z.string().optional(),
});

// L'API Vercel enveloppe la commande créée ; json-server la renvoie seule.
export const orderEnvelopeSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  order: orderDtoSchema,
});

export type OrderDto = z.infer<typeof orderDtoSchema>;
