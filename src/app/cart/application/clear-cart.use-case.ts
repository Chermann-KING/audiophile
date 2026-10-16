import { Injectable, inject } from '@angular/core';

import { clearCart, type Cart } from '../domain/cart';
import { CartRepository } from '../domain/cart-repository';

@Injectable()
export class ClearCart {
  private readonly repository = inject(CartRepository);

  execute(): Cart {
    const cart = clearCart();
    this.repository.save(cart);
    return cart;
  }
}
