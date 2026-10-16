import { err, ok, type Result } from '../../shared/kernel/result';
import type { CheckoutError } from '../domain/checkout-error';
import type { Order, OrderHistoryStatus, OrderRequest } from '../domain/order';
import { OrderRepository } from '../domain/order-repository';

export class InMemoryOrderRepository extends OrderRepository {
  placed: OrderRequest[] = [];
  listed: { userId: string; status: OrderHistoryStatus }[] = [];

  constructor(
    private readonly existing: readonly Order[] = [],
    private readonly failure?: CheckoutError
  ) {
    super();
  }

  async place(request: OrderRequest): Promise<Result<Order, CheckoutError>> {
    if (this.failure) return err(this.failure);
    this.placed.push(request);
    return ok({ ...request, id: `order-${this.placed.length}` });
  }

  async listByUser(userId: string, status: OrderHistoryStatus): Promise<Result<readonly Order[], CheckoutError>> {
    this.listed.push({ userId, status });
    return this.failure ? err(this.failure) : ok(this.existing);
  }
}
