import { Routes } from '@angular/router';
import { CATEGORIES_ROUTES } from '../categories/categories.routes';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

export const PRODUCT_ROUTES: Routes = [
  { path: ':category/:slug', component: ProductDetailComponent },
  ...CATEGORIES_ROUTES,
];
