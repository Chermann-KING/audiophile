import { Injectable, inject } from '@angular/core';

import type { Result } from '../../shared/kernel/result';
import { addProduct, type Cart, type CartError, type CartProduct } from '../domain/cart';
import { CartRepository } from '../domain/cart-repository';

@Injectable()
export class AddToCart {
  private readonly repository = inject(CartRepository);

  execute(product: CartProduct, quantity: number): Result<Cart, CartError> {
    const result = addProduct(this.repository.load(), product, quantity);
    if (result.ok) this.repository.save(result.value);
    return result;
  }
}
