import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

import { AddToCart } from '../application/add-to-cart.use-case';
import { ClearCart } from '../application/clear-cart.use-case';
import { GetCart } from '../application/get-cart.use-case';
import { RemoveFromCart } from '../application/remove-from-cart.use-case';
import { SetCartQuantity } from '../application/set-cart-quantity.use-case';
import { itemCount, total, type Cart, type CartProduct } from '../domain/cart';

// API publique de la tranche « cart » pour les autres tranches (fiche produit, commande, en-tête).
@Injectable()
export class CartStore {
  private readonly addToCart = inject(AddToCart);
  private readonly setCartQuantity = inject(SetCartQuantity);
  private readonly removeFromCart = inject(RemoveFromCart);
  private readonly clearCart = inject(ClearCart);
  private readonly document = inject(DOCUMENT);

  private readonly state = signal<Cart>(inject(GetCart).execute());
  private readonly dialogState = signal(false);

  readonly lines = computed(() => this.state().lines);
  readonly itemCount = computed(() => itemCount(this.state()));
  readonly total = computed(() => total(this.state()));
  readonly dialogOpen = this.dialogState.asReadonly();

  add(product: CartProduct, quantity: number): boolean {
    return this.apply(this.addToCart.execute(product, quantity));
  }

  setQuantity(productId: string, quantity: number): boolean {
    return this.apply(this.setCartQuantity.execute(productId, quantity));
  }

  remove(productId: string): void {
    this.state.set(this.removeFromCart.execute(productId));
  }

  clear(): void {
    this.state.set(this.clearCart.execute());
  }

  openDialog(): void {
    this.toggleDialog(true);
  }

  closeDialog(): void {
    this.toggleDialog(false);
  }

  private apply(result: { ok: true; value: Cart } | { ok: false }): boolean {
    if (result.ok) this.state.set(result.value);
    return result.ok;
  }

  // Bloque le défilement de la page tant que la boîte de dialogue est ouverte.
  private toggleDialog(isOpen: boolean): void {
    this.dialogState.set(isOpen);
    this.document.body.classList.toggle('menu-open', isOpen);
  }
}
