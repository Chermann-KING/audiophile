import { Injectable, inject } from '@angular/core';

import type { Result } from '../../shared/kernel/result';
import { setQuantity, type Cart, type CartError } from '../domain/cart';
import { CartRepository } from '../domain/cart-repository';

@Injectable()
export class SetCartQuantity {
  private readonly repository = inject(CartRepository);

  execute(productId: string, quantity: number): Result<Cart, CartError> {
    const result = setQuantity(this.repository.load(), productId, quantity);
    if (result.ok) this.repository.save(result.value);
    return result;
  }
}
