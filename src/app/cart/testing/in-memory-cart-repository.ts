import { EMPTY_CART, type Cart } from '../domain/cart';
import { CartRepository } from '../domain/cart-repository';

export class InMemoryCartRepository extends CartRepository {
  saveCount = 0;

  constructor(public stored: Cart = EMPTY_CART) {
    super();
  }

  load(): Cart {
    return this.stored;
  }

  save(cart: Cart): void {
    this.stored = cart;
    this.saveCount++;
  }
}
