import { Injectable, inject } from '@angular/core';

import type { Cart } from '../domain/cart';
import { CartRepository } from '../domain/cart-repository';

@Injectable()
export class GetCart {
  private readonly repository = inject(CartRepository);

  execute(): Cart {
    return this.repository.load();
  }
}
