import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
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
      import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
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
