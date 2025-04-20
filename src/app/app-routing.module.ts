import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'design-system',
    loadChildren: () =>
      import('./design-showcase/design-showcase.module').then(
        (m) => m.DesignShowcaseModule
      ),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./features/categories/categories.module').then(
        (m) => m.CategoriesModule
      ),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/product/product.module').then((m) => m.ProductModule),
  },
  {
    path: 'checkout',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/checkout/checkout.module').then(
        (m) => m.CheckoutModule
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
