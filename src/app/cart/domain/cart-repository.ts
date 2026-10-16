import type { Cart } from './cart';

// Port sortant synchrone : le panier est un état local lu au démarrage de l'interface.
export abstract class CartRepository {
  abstract load(): Cart;
  abstract save(cart: Cart): void;
}
