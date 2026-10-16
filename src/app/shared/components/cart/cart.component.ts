import { Component, OnInit, OnDestroy, inject, DestroyRef, signal } from '@angular/core';
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

  readonly itemCount = signal(0);
  readonly isCartOpen = signal(false);
  private _subscription: Subscription = new Subscription();

  constructor() {
    this._cartService.cartDialogState.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isOpen) => {
      this.isCartOpen.set(isOpen);
    });
  }

  ngOnInit(): void {
    this._subscription.add(
      this._cartService.getCartItemsCount().subscribe((count) => {
        this.itemCount.set(count);
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
