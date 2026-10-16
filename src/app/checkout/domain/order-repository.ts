import type { Result } from '../../shared/kernel/result';
import type { CheckoutError } from './checkout-error';
import type { Order, OrderHistoryStatus, OrderRequest } from './order';

// Port sortant : enregistrement et consultation des commandes.
export abstract class OrderRepository {
  abstract place(request: OrderRequest): Promise<Result<Order, CheckoutError>>;
  abstract listByUser(userId: string, status: OrderHistoryStatus): Promise<Result<readonly Order[], CheckoutError>>;
}
