import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  private _cartService = inject(CartService);

  itemCount = 0;
  isCartOpen = false;
  private _subscription: Subscription = new Subscription();

  constructor() {
    this._cartService.cartDialogState.subscribe((isOpen) => {
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
