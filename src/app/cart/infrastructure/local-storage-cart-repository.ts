import { Injectable } from '@angular/core';

import type { Cart } from '../domain/cart';
import { CartRepository } from '../domain/cart-repository';
import { cartToJson, jsonToCart } from './cart.mapper';

const STORAGE_KEY = 'cart';

@Injectable()
export class LocalStorageCartRepository extends CartRepository {
  load(): Cart {
    return jsonToCart(localStorage.getItem(STORAGE_KEY));
  }

  save(cart: Cart): void {
    localStorage.setItem(STORAGE_KEY, cartToJson(cart));
  }
}
