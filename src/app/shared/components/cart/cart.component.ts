import { Component, OnInit, OnDestroy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart.service';
import { Subscription } from 'rxjs';

import { CartDialogComponent } from '../cart-dialog/cart-dialog.component';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [CartDialogComponent],
})
export class CartComponent implements OnInit, OnDestroy {
  private _destroyRef = inject(DestroyRef);
  private _cartService = inject(CartService);

  itemCount = 0;
  isCartOpen = false;
  private _subscription: Subscription = new Subscription();

  constructor() {
    this._cartService.cartDialogState.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isOpen) => {
      this.isCartOpen = isOpen;
    });
  }

  ngOnInit(): void {
    this._subscription.add(
      this._cartService.getCartItemsCount().subscribe((count) => {
        this.itemCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  toggleCart(): void {
    this._cartService.toggleCartDialog(true);
  }
}
