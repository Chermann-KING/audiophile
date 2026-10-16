import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';

import { API_BASE_URL } from './core/api-base-url';
import { provideAccount } from './account/infrastructure/account.providers';
import { provideCart } from './cart/infrastructure/cart.providers';
import { provideCheckout } from './checkout/infrastructure/checkout.providers';
import { routes } from './app.routes';
import { HomeComponent } from './catalog/presentation/home/home.component';
import { CategoryListComponent } from './catalog/presentation/category-list/category-list.component';
import { CategoryDetailComponent } from './catalog/presentation/category-detail/category-detail.component';
import { ProductDetailComponent } from './catalog/presentation/product-detail/product-detail.component';
import { LoginComponent } from './account/presentation/login/login.component';
import { CheckoutComponent } from './checkout/presentation/checkout/checkout.component';
import { ProfileComponent } from './account/presentation/profile/profile.component';
import { DesignShowcaseComponent } from './design-showcase/design-showcase.component';

// Tests de caractérisation : figent le comportement du routage avant la migration standalone.
describe('Routage (caractérisation)', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        ...provideCart(),
        ...provideAccount(),
        ...provideCheckout(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
      ],
    });
    return RouterTestingHarness.create();
  };

  const expectRoute = async (url: string, component: Type<unknown>, finalUrl = url) => {
    const harness = await setup();
    const instance = await harness.navigateByUrl(url);
    expect(instance).toBeInstanceOf(component);
    expect(TestBed.inject(Router).url).toBe(finalUrl);
    harness.fixture.destroy();
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('affiche la page d’accueil sur /', () => expectRoute('/', HomeComponent));

  it('affiche la liste des catégories', () =>
    expectRoute('/categories/categories', CategoryListComponent));

  it('affiche le détail d’une catégorie', () =>
    expectRoute('/categories/headphones', CategoryDetailComponent));

  it('affiche le détail d’un produit', () =>
    expectRoute('/products/headphones/xx99-mark-two', ProductDetailComponent));

  // Comportement existant : CategoriesModule est aussi importé par ProductModule.
  it('expose la liste des catégories sous /products', () =>
    expectRoute('/products/categories', CategoryListComponent));

  it('expose le détail d’une catégorie sous /products', () =>
    expectRoute('/products/headphones', CategoryDetailComponent));

  it('affiche la page de connexion', () => expectRoute('/auth/login', LoginComponent));

  it('affiche le design system', () => expectRoute('/design-system', DesignShowcaseComponent));

  it('redirige une URL à plusieurs segments inconnus vers l’accueil', () =>
    expectRoute('/a/b/c/d', HomeComponent, '/'));

  // Comportement existant : le segment unique est capté par la route ':category' de l'accueil.
  it('traite un segment unique inconnu comme une catégorie', () =>
    expectRoute('/inconnu', CategoryDetailComponent));

  describe('visiteur non connecté', () => {
    it('est redirigé de /checkout vers /auth/login', () =>
      expectRoute('/checkout', LoginComponent, '/auth/login'));

    it('est redirigé de /profile vers /auth/login', () =>
      expectRoute('/profile', LoginComponent, '/auth/login'));
  });

  describe('utilisateur connecté', () => {
    beforeEach(() =>
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ id: '1', email: 'a@b.c', firstName: 'A', lastName: 'B' })
      )
    );

    it('accède à /checkout', () => expectRoute('/checkout', CheckoutComponent));

    it('accède à /profile', () => expectRoute('/profile', ProfileComponent));
  });
});
