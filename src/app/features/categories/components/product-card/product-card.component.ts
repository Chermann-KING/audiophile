import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../../models/product';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private _router: Router) {}

  getMobileImagePath(): string {
    // !Pour les earphones, utilise le chemin d'origine de la base de données
    if (this.product.category === 'earphones') {
      return this.product.categoryImage.mobile;
    }
    // !Pour les autres catégories (headphones et speakers), utilise le format qui fonctionne
    return `/assets/images/shared/mobile/image-${this.product.slug}.jpg`;
  }

  getTabletImagePath(): string {
    if (this.product.category === 'earphones') {
      return this.product.categoryImage.tablet;
    }
    return `/assets/images/shared/tablet/image-${this.product.slug}.jpg`;
  }

  getDesktopImagePath(): string {
    if (this.product.category === 'earphones') {
      return this.product.categoryImage.desktop;
    }
    return `/assets/images/shared/desktop/image-${this.product.slug}.jpg`;
  }

  navigateToProductDetail(): void {
    this._router.navigate([
      '/products',
      this.product.category,
      this.product.slug,
    ]);
  }
}
