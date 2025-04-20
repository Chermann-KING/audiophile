import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../models/product';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading: boolean = true;
  quantity: number = 1;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _productService: ProductService,
    private _cartService: CartService
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      const slug = params['slug'];
      const category = params['category'];
      this.loadProduct(slug, category);
    });
  }

  loadProduct(slug: string, category: string): void {
    this.loading = true;
    this._productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        // Ne pas rediriger si la catégorie ne correspond pas
        // car cela peut arriver avec les produits suggérés
        this.product = product;
        this.loading = false;

        // Charger les produits suggérés
        if (product.others && product.others.length > 0) {
          const relatedSlugs = product.others.map((item) => item.slug);
          this.loadRelatedProducts(relatedSlugs);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du produit:', error);
        this.loading = false;
        // Rediriger vers la page d'accueil en cas d'erreur
        this._router.navigate(['/']);
      },
    });
  }

  navigateToProduct(slug: string): void {
    if (this.product) {
      this._router.navigate(['/products', this.product.category, slug]);
    }
  }

  loadRelatedProducts(slugs: string[]): void {
    this._productService.getProductsBySlugs(slugs).subscribe({
      next: (products) => {
        this.relatedProducts = products;
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
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  addToCart(): void {
    if (this.product) {
      this._cartService.addToCart(this.product, this.quantity);
      // TODO: Feedback visuel (un toast/notification)
      console.log(`Ajout de ${this.quantity} ${this.product.name} au panier`);
      // Réinitialiser la quantité
      this.quantity = 1;
    }
  }

  goBack(): void {
    // Retourner à la page précédente
    window.history.back();
  }
}
