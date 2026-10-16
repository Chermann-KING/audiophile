import { err, ok, type Result } from '../../shared/kernel/result';
import type { CheckoutError } from '../domain/checkout-error';
import type { Order } from '../domain/order';
import { orderDtoSchema, orderEnvelopeSchema } from './order.dto';

// Valide la réponse de l'API (type `unknown`) : commande seule ou enveloppée.
export function dtoToOrder(raw: unknown): Result<Order, CheckoutError> {
  const envelope = orderEnvelopeSchema.safeParse(raw);
  if (envelope.success) return ok(envelope.data.order);

  const parsed = orderDtoSchema.safeParse(raw);
  return parsed.success ? ok(parsed.data) : err({ kind: 'INVALID_DATA', detail: parsed.error.message });
}
