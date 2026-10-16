import { Injectable, inject } from '@angular/core';

import { removeLine, type Cart } from '../domain/cart';
import { CartRepository } from '../domain/cart-repository';

@Injectable()
export class RemoveFromCart {
  private readonly repository = inject(CartRepository);

  execute(productId: string): Cart {
    const cart = removeLine(this.repository.load(), productId);
    this.repository.save(cart);
    return cart;
  }
}
