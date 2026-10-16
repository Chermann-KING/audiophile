import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../models/product';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { CategoryListComponent } from '../../../categories/components/category-list/category-list.component';
import { AboutComponent } from '../../../../shared/components/about/about.component';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss'],
    imports: [
    CategoryListComponent,
    AboutComponent,
    CurrencyPipe
],
})
export class ProductDetailComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _productService = inject(ProductService);
  private _cartService = inject(CartService);

  readonly product = signal<Product | null>(null);
  readonly relatedProducts = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly quantity = signal(1);

  ngOnInit(): void {
    this._route.params.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((params) => {
      const slug = params['slug'];
      this.loadProduct(slug);
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this._productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        // Ne pas rediriger si la catégorie ne correspond pas
        // car cela peut arriver avec les produits suggérés
        this.product.set(product);
        this.loading.set(false);

        // Charger les produits suggérés
        if (product.others && product.others.length > 0) {
          const relatedSlugs = product.others.map((item) => item.slug);
          this.loadRelatedProducts(relatedSlugs);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du produit:', error);
        this.loading.set(false);
        // Rediriger vers la page d'accueil en cas d'erreur
        this._router.navigate(['/']);
      },
    });
  }

  navigateToProduct(slug: string): void {
    const product = this.product();
    if (product) {
      this._router.navigate(['/products', product.category, slug]);
    }
  }

  loadRelatedProducts(slugs: string[]): void {
    this._productService.getProductsBySlugs(slugs).subscribe({
      next: (products) => {
        this.relatedProducts.set(products);
      },
      error: (error) => {
        console.error(
          'Erreur lors de la récupération des produits suggérés:',
          error
        );
      },
    });
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
      this._cartService.addToCart(product, this.quantity());
      // TODO: Feedback visuel (un toast/notification)
      console.log(`Ajout de ${this.quantity()} ${product.name} au panier`);
      // Réinitialiser la quantité
      this.quantity.set(1);
    }
  }

  goBack(): void {
    // Retourner à la page précédente
    window.history.back();
  }
}
