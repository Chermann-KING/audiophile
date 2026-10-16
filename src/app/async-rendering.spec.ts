import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { CategoryListComponent } from './features/categories/components/category-list/category-list.component';
import { CategoryDetailComponent } from './features/categories/components/category-detail/category-detail.component';
import { ProductDetailComponent } from './features/product/pages/product-detail/product-detail.component';
import { CartComponent } from './shared/components/cart/cart.component';
import { CartService } from './core/services/cart.service';
import { Product } from './models/product';

// Sans zone.js, une vue ne se met à jour que si l'état est un signal (ou marqué à rafraîchir) :
// ces tests vérifient que le DOM reflète bien les réponses HTTP et les flux asynchrones.
const image = { mobile: 'm.jpg', tablet: 't.jpg', desktop: 'd.jpg' };
const product = (slug: string, category: string, isNew = false) =>
  ({
    id: slug,
    slug,
    name: `Produit ${slug}`,
    image,
    category,
    new: isNew,
    price: 100,
    description: 'desc',
    features: 'features',
    includes: [],
    gallery: { first: image, second: image, third: image },
    others: [],
  }) as unknown as Product;

const PRODUCTS = [product('a', 'headphones', true), product('b', 'headphones'), product('c', 'speakers')];

describe('Rendu asynchrone sans zone.js', () => {
  const setup = (params: Record<string, string> = {}) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: new BehaviorSubject(params) } },
      ],
    });
    return TestBed.inject(HttpTestingController);
  };

  // Plusieurs composants peuvent demander /products en même temps (ex. la liste de catégories imbriquée).
  const flushProducts = (http: HttpTestingController) =>
    http.match((request) => request.url.endsWith('/products')).forEach((request) => request.flush(PRODUCTS));

  beforeEach(() => localStorage.clear());

  it('affiche les catégories après la réponse HTTP', async () => {
    const http = setup();
    const fixture = TestBed.createComponent(CategoryListComponent);
    await fixture.whenStable();

    flushProducts(http);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.category-card').length).toBe(2);
  });

  it('affiche les produits de la catégorie puis masque le chargement', async () => {
    const http = setup({ category: 'headphones' });
    const fixture = TestBed.createComponent(CategoryDetailComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.loading-container')).not.toBeNull();

    flushProducts(http);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.loading-container')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(2);
  });

  it('affiche le produit une fois chargé', async () => {
    const http = setup({ category: 'headphones', slug: 'a' });
    const fixture = TestBed.createComponent(ProductDetailComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.product-title')).toBeNull();

    flushProducts(http);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.product-title')?.textContent).toContain('Produit a');
  });

  it('met à jour le badge du panier quand un produit est ajouté', async () => {
    setup();
    const fixture = TestBed.createComponent(CartComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.cart-count')).toBeNull();

    TestBed.inject(CartService).addToCart(PRODUCTS[0], 2);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.cart-count')?.textContent).toContain('2');
  });

  it('ouvre la boîte de dialogue du panier depuis le service', async () => {
    setup();
    const fixture = TestBed.createComponent(CartComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-cart-dialog')).toBeNull();

    TestBed.inject(CartService).toggleCartDialog(true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-cart-dialog')).not.toBeNull();
  });
});
