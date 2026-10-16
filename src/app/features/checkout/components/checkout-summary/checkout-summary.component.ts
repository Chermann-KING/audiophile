import { Component, output, input, ChangeDetectionStrategy } from '@angular/core';
import { CartItem } from '../../../../core/services/cart.service';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-checkout-summary',
    templateUrl: './checkout-summary.component.html',
    styleUrls: ['./checkout-summary.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
    DecimalPipe
],
})
export class CheckoutSummaryComponent {
  readonly cartItems = input<CartItem[]>([]);
  readonly total = input<number>(0);
  readonly shipping = input<number>(0);
  readonly vat = input<number>(0);
  readonly grandTotal = input<number>(0);
  readonly formValid = input<boolean>(false);

  readonly submitted = output<void>();

  submitOrder(): void {
    console.log('1. Bouton CONTINUE cliqué');
    console.log('formValid:', this.formValid());
    console.log('cartItems:', this.cartItems());
    this.submitted.emit();
    console.log('2. Événement submitted émis');
  }

  // Obtenient l'URL de l'image du produit
  getProductImageUrl(item: CartItem): string {
    if (item.product.image && item.product.image.desktop) {
      return item.product.image.desktop;
    } else if (item.product.slug) {
      return `/assets/images/product-${item.product.slug}/desktop/image-product.jpg`;
    }
    return '';
  }

  // Obtenient le nom court du produit
  getShortProductName(item: CartItem): string {
    return (
      item.product.shortName ||
      item.product.name.split(' ').slice(0, 2).join(' ')
    );
  }
}
