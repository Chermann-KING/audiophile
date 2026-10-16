import { Component, inject } from '@angular/core';

import { CartStore } from '../cart.store';
import { CartDialogComponent } from '../cart-dialog/cart-dialog.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  imports: [CartDialogComponent],
})
export class CartComponent {
  protected readonly store = inject(CartStore);
}
