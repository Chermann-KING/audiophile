import { Routes } from '@angular/router';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';

// Réutilisées par les routes de home et de product, comme l'ancien CategoriesModule.
export const CATEGORIES_ROUTES: Routes = [
  { path: 'categories', component: CategoryListComponent },
  { path: ':category', component: CategoryDetailComponent },
];
