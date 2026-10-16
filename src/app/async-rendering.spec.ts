import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { CategoryListComponent } from './catalog/presentation/category-list/category-list.component';
import { CategoryDetailComponent } from './catalog/presentation/category-detail/category-detail.component';
import { ProductDetailComponent } from './catalog/presentation/product-detail/product-detail.component';
import { provideCart } from './cart/infrastructure/cart.providers';
import { CartStore } from './cart/presentation/cart.store';
import { CartComponent } from './cart/presentation/cart/cart.component';
import { aCartProduct } from './cart/testing/cart.fixture';
import { API_BASE_URL } from './core/api-base-url';
import { provideCatalog } from './catalog/infrastructure/catalog.providers';
import { aProduct } from './catalog/testing/product.fixture';

// Sans zone.js, une vue ne se met à jour que si l'état est un signal (ou marqué à rafraîchir) :
// ces tests vérifient que le DOM reflète bien les réponses HTTP et les flux asynchrones.
const PRODUCTS = [
  aProduct({ id: '1', slug: 'a', name: 'Produit a', category: 'headphones', new: true }),
  aProduct({ id: '2', slug: 'b', name: 'Produit b', category: 'headphones' }),
  aProduct({ id: '3', slug: 'c', name: 'Produit c', category: 'speakers' }),
];

describe('Rendu asynchrone sans zone.js', () => {
  const setup = (params: Record<string, string> = {}) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        provideCatalog(),
        ...provideCart(),
        { provide: ActivatedRoute, useValue: { params: new BehaviorSubject(params) } },
      ],
    });
    return TestBed.inject(HttpTestingController);
  };

  // Plusieurs composants peuvent demander /products en même temps (ex. la liste de catégories imbriquée).
  const flushProducts = (http: HttpTestingController) =>
    http.match((request) => request.url.endsWith('/products')).forEach((request) => request.flush(PRODUCTS));

  // Les use cases renvoient des promesses : on vide les microtâches avant d'attendre la stabilité.
  const settle = async (fixture: ComponentFixture<unknown>) => {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };

  beforeEach(() => localStorage.clear());

  it('affiche les catégories après la réponse HTTP', async () => {
    const http = setup();
    const fixture = TestBed.createComponent(CategoryListComponent);
    await fixture.whenStable();

    flushProducts(http);
    await settle(fixture);

    expect(fixture.nativeElement.querySelectorAll('.category-card').length).toBe(2);
  });

  it('affiche les produits de la catégorie puis masque le chargement', async () => {
    const http = setup({ category: 'headphones' });
    const fixture = TestBed.createComponent(CategoryDetailComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.loading-container')).not.toBeNull();

    flushProducts(http);
    await settle(fixture);

    expect(fixture.nativeElement.querySelector('.loading-container')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(2);
  });

  it('affiche le produit une fois chargé', async () => {
    const http = setup({ category: 'headphones', slug: 'a' });
    const fixture = TestBed.createComponent(ProductDetailComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.product-title')).toBeNull();

    flushProducts(http);
    await settle(fixture);

    expect(fixture.nativeElement.querySelector('.product-title')?.textContent).toContain('Produit a');
  });

  it('met à jour le badge du panier quand un produit est ajouté', async () => {
    setup();
    const fixture = TestBed.createComponent(CartComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.cart-count')).toBeNull();

    TestBed.inject(CartStore).add(aCartProduct(), 2);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.cart-count')?.textContent).toContain('2');
  });

  it('ouvre la boîte de dialogue du panier depuis le service', async () => {
    setup();
    const fixture = TestBed.createComponent(CartComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-cart-dialog')).toBeNull();

    TestBed.inject(CartStore).openDialog();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-cart-dialog')).not.toBeNull();
  });
});
