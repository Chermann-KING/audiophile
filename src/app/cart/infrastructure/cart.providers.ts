import type { Provider } from '@angular/core';

import { AddToCart } from '../application/add-to-cart.use-case';
import { ClearCart } from '../application/clear-cart.use-case';
import { GetCart } from '../application/get-cart.use-case';
import { RemoveFromCart } from '../application/remove-from-cart.use-case';
import { SetCartQuantity } from '../application/set-cart-quantity.use-case';
import { CartRepository } from '../domain/cart-repository';
import { CartStore } from '../presentation/cart.store';
import { LocalStorageCartRepository } from './local-storage-cart-repository';

// Le panier est un état global (badge, fiche produit, commande) : fourni à la racine de l'application.
export const provideCart = (): Provider[] => [
  { provide: CartRepository, useClass: LocalStorageCartRepository },
  GetCart,
  AddToCart,
  SetCartQuantity,
  RemoveFromCart,
  ClearCart,
  CartStore,
];
