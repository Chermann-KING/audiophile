import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import type { CartLine } from '../../../cart/domain/cart';

@Component({
  selector: 'app-checkout-summary',
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss'],
  imports: [DecimalPipe],
})
export class CheckoutSummaryComponent {
  readonly cartItems = input<readonly CartLine[]>([]);
  readonly total = input<number>(0);
  readonly shipping = input<number>(0);
  readonly vat = input<number>(0);
  readonly grandTotal = input<number>(0);
  readonly formValid = input<boolean>(false);

  readonly submitted = output<void>();

  submitOrder(): void {
    this.submitted.emit();
  }

  // Nom court affiché : le nom court du produit, sinon les deux premiers mots du nom.
  getShortProductName(item: CartLine): string {
    return item.shortName || item.name.split(' ').slice(0, 2).join(' ');
  }
}
