import { Routes } from '@angular/router';
import { CATEGORIES_ROUTES } from '../categories/categories.routes';
import { HomeComponent } from './pages/home/home.component';

export const HOME_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  ...CATEGORIES_ROUTES,
];
