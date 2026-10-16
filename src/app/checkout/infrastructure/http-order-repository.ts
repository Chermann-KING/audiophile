import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../core/api-base-url';
import { err, ok, type Result } from '../../shared/kernel/result';
import type { CheckoutError } from '../domain/checkout-error';
import type { Order, OrderHistoryStatus, OrderRequest } from '../domain/order';
import { OrderRepository } from '../domain/order-repository';
import { dtoToOrder } from './order.mapper';

@Injectable()
export class HttpOrderRepository extends OrderRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  async place(request: OrderRequest): Promise<Result<Order, CheckoutError>> {
    try {
      const raw = await firstValueFrom(this.http.post<unknown>(`${this.baseUrl}/orders`, request));
      return dtoToOrder(raw);
    } catch (error) {
      return err(toCheckoutError(error));
    }
  }

  async listByUser(userId: string, status: OrderHistoryStatus): Promise<Result<readonly Order[], CheckoutError>> {
    try {
      const raw = await firstValueFrom(
        this.http.get<unknown>(`${this.baseUrl}/orders?userId=${userId}&status=${status}`)
      );
      return this.mapAll(raw);
    } catch (error) {
      return err(toCheckoutError(error));
    }
  }

  private mapAll(raw: unknown): Result<readonly Order[], CheckoutError> {
    if (!Array.isArray(raw)) return err({ kind: 'INVALID_DATA', detail: 'liste de commandes attendue' });

    const orders: Order[] = [];
    for (const item of raw) {
      const mapped = dtoToOrder(item);
      if (!mapped.ok) return mapped;
      orders.push(mapped.value);
    }
    return ok(orders);
  }
}

function toCheckoutError(error: unknown): CheckoutError {
  if (error instanceof HttpErrorResponse && error.status !== 0) {
    return { kind: 'SERVER', status: error.status };
  }
  return { kind: 'NETWORK' };
}
