import { Injectable, inject } from '@angular/core';

import { err, type Result } from '../../shared/kernel/result';
import type { CheckoutError } from '../domain/checkout-error';
import type { Order } from '../domain/order';
import { createOrderRequest, type CheckoutInput, type OrderRequestError } from '../domain/order-request';
import { OrderRepository } from '../domain/order-repository';

export type PlaceOrderError = OrderRequestError | CheckoutError;

@Injectable()
export class PlaceOrder {
  private readonly repository = inject(OrderRepository);

  async execute(input: CheckoutInput): Promise<Result<Order, PlaceOrderError>> {
    const request = createOrderRequest(input);
    if (!request.ok) return err(request.error);
    return this.repository.place(request.value);
  }
}
