import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';

import { AppModule } from './app.module';
import { HomeComponent } from './features/home/pages/home/home.component';
import { CategoryListComponent } from './features/categories/components/category-list/category-list.component';
import { CategoryDetailComponent } from './features/categories/components/category-detail/category-detail.component';
import { ProductDetailComponent } from './features/product/pages/product-detail/product-detail.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { CheckoutComponent } from './features/checkout/pages/checkout/checkout.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component';
import { DesignShowcaseComponent } from './design-showcase/design-showcase.component';

// Tests de caractérisation : figent le comportement du routage avant la migration standalone.
describe('Routage (caractérisation)', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
