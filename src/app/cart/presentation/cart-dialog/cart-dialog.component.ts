import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../design-system/components/button/button.component';
import { NumberInputComponent } from '../../../design-system/components/number-input/number-input.component';
import { CartStore } from '../cart.store';

@Component({
  selector: 'app-cart-dialog',
  templateUrl: './cart-dialog.component.html',
  styleUrl: './cart-dialog.component.scss',
  imports: [ButtonComponent, NumberInputComponent],
})
export class CartDialogComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(CartStore);

  closeDialog(): void {
    this.store.closeDialog();
  }

  updateQuantity(productId: string, quantity: number): void {
    this.store.setQuantity(productId, quantity);
  }

  removeAll(): void {
    this.store.clear();
  }

  checkout(): void {
    this.closeDialog();
    this.router.navigate(['/checkout']);
  }
}
