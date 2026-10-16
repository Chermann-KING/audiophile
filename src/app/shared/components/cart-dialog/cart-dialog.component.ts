import { Component, OnInit, Output, EventEmitter, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { Product } from '../../../models/product';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../design-system/components/button/button.component';
import { NumberInputComponent } from '../../../design-system/components/number-input/number-input.component';

@Component({
    selector: 'app-cart-dialog',
    templateUrl: './cart-dialog.component.html',
    styleUrl: './cart-dialog.component.scss',
    imports: [
    ButtonComponent,
    NumberInputComponent
],
})
export class CartDialogComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  private _cartService = inject(CartService);
  private _router = inject(Router);

  cartItems: CartItem[] = [];
  total = 0;

  ngOnInit(): void {
    this._cartService.getCart().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((items) => {
      this.cartItems = items;
      this.total = this._cartService.getTotal();
    });
  }

  closeDialog(): void {
    this._cartService.toggleCartDialog(false);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity > 0) {
      this._cartService.updateQuantity(productId, quantity);
    } else if (quantity === 0) {
      this._cartService.removeFromCart(productId);
    }
  }

  removeItem(productId: string): void {
    this._cartService.removeFromCart(productId);
  }

  removeAll(): void {
    this._cartService.clearCart();
  }

  checkout(): void {
    this.closeDialog();
    this._router.navigate(['/checkout']);
  }

  // Obtenient l'URL de l'image du produit
  getProductImageUrl(product: Product): string {
    // Vérifie la structure du produit et construire le chemin approprié
    if (product.image && product.image.desktop) {
      return product.image.desktop;
    } else if (product.slug) {
      // S'adapte à la structure de fichiers du dossier images
      return `/public/assets/images/product-${product.slug}/desktop/image-product.jpg`;
    }
    return '';
  }
}
