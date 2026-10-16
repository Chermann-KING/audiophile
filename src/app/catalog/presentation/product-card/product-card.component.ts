import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import type { Product } from '../../domain/product';


@Component({
    selector: 'app-product-card',
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss'],
    imports: [],
})
export class ProductCardComponent {
  private _router = inject(Router);

  readonly product = input.required<Product>();

  getMobileImagePath(): string {
    // !Pour les earphones, utilise le chemin d'origine de la base de données
    const product = this.product();
    if (product.category === 'earphones') {
      return product.categoryImage.mobile;
    }
    // !Pour les autres catégories (headphones et speakers), utilise le format qui fonctionne
    return `/assets/images/shared/mobile/image-${product.slug}.jpg`;
  }

  getTabletImagePath(): string {
    const product = this.product();
    if (product.category === 'earphones') {
      return product.categoryImage.tablet;
    }
    return `/assets/images/shared/tablet/image-${product.slug}.jpg`;
  }

  getDesktopImagePath(): string {
    const product = this.product();
    if (product.category === 'earphones') {
      return product.categoryImage.desktop;
    }
    return `/assets/images/shared/desktop/image-${product.slug}.jpg`;
  }

  navigateToProductDetail(): void {
    this._router.navigate([
      '/products',
      this.product().category,
      this.product().slug,
    ]);
  }
}
