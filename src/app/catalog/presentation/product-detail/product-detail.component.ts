import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

import { CartStore } from '../../../cart/presentation/cart.store';
import { AboutComponent } from '../../../shared/components/about/about.component';
import { GetProductBySlug } from '../../application/get-product-by-slug.use-case';
import type { Product } from '../../domain/product';
import { CategoryListComponent } from '../category-list/category-list.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  imports: [CategoryListComponent, AboutComponent, CurrencyPipe],
})
export class ProductDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly getProductBySlug = inject(GetProductBySlug);
  private readonly cart = inject(CartStore);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly quantity = signal(1);

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      void this.loadProduct(params['slug']);
    });
  }

  navigateToProduct(slug: string): void {
    const product = this.product();
    if (product) {
      this.router.navigate(['/products', product.category, slug]);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((quantity) => quantity - 1);
    }
  }

  increaseQuantity(): void {
    this.quantity.update((quantity) => quantity + 1);
  }

  addToCart(): void {
    const product = this.product();
    if (product) {
      this.cart.add(
        {
          productId: product.id,
          name: product.name,
          shortName: product.shortName,
          unitPrice: product.price,
          imageUrl: product.image.desktop,
        },
        this.quantity()
      );
      this.quantity.set(1);
    }
  }

  goBack(): void {
    window.history.back();
  }

  private async loadProduct(slug: string): Promise<void> {
    this.loading.set(true);
    const result = await this.getProductBySlug.execute(slug);

    if (result.ok) {
      this.product.set(result.value);
      this.loading.set(false);
      return;
    }
    console.error('Erreur lors de la récupération du produit:', result.error);
    this.loading.set(false);
    this.router.navigate(['/']);
  }
}
