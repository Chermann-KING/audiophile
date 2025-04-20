import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  itemCount = 0;
  isCartOpen = false;
  private _subscription: Subscription = new Subscription();

  constructor(private _cartService: CartService) {
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
