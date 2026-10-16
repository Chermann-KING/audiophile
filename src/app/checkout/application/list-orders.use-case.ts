import { Injectable, inject } from '@angular/core';

import type { Result } from '../../shared/kernel/result';
import type { CheckoutError } from '../domain/checkout-error';
import type { Order, OrderHistoryStatus } from '../domain/order';
import { OrderRepository } from '../domain/order-repository';

@Injectable()
export class ListOrders {
  private readonly repository = inject(OrderRepository);

  execute(userId: string, status: OrderHistoryStatus): Promise<Result<readonly Order[], CheckoutError>> {
    return this.repository.listByUser(userId, status);
  }
}
