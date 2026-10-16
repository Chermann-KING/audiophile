import { Routes } from '@angular/router';

import { CategoryDetailComponent } from './presentation/category-detail/category-detail.component';
import { CategoryListComponent } from './presentation/category-list/category-list.component';
import { HomeComponent } from './presentation/home/home.component';
import { ProductDetailComponent } from './presentation/product-detail/product-detail.component';

// Les routes de catégories sont aussi montées sous '' et sous 'products' (comportement historique).
export const CATEGORIES_ROUTES: Routes = [
  { path: 'categories', component: CategoryListComponent },
  { path: ':category', component: CategoryDetailComponent },
];

export const HOME_ROUTES: Routes = [{ path: '', component: HomeComponent }, ...CATEGORIES_ROUTES];

export const PRODUCT_ROUTES: Routes = [
  { path: ':category/:slug', component: ProductDetailComponent },
  ...CATEGORIES_ROUTES,
];
