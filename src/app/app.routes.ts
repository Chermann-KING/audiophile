import { Routes } from '@angular/router';
import { authGuard } from './account/presentation/auth.guard';
import { provideCatalog } from './catalog/infrastructure/catalog.providers';

export const routes: Routes = [
  {
    path: 'design-system',
    loadChildren: () =>
      import('./design-showcase/design-showcase.routes').then((m) => m.DESIGN_SHOWCASE_ROUTES),
  },
  {
    path: 'categories',
    providers: provideCatalog(),
    loadChildren: () => import('./catalog/catalog.routes').then((m) => m.CATEGORIES_ROUTES),
  },
  {
    path: 'products',
    providers: provideCatalog(),
    loadChildren: () => import('./catalog/catalog.routes').then((m) => m.PRODUCT_ROUTES),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./account/account.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./account/account.routes').then((m) => m.PROFILE_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: '',
    providers: provideCatalog(),
    loadChildren: () => import('./catalog/catalog.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
