import type { Provider } from '@angular/core';

import { GetProductBySlug } from '../application/get-product-by-slug.use-case';
import { ListCategories } from '../application/list-categories.use-case';
import { ListNewProducts } from '../application/list-new-products.use-case';
import { ListProductsByCategory } from '../application/list-products-by-category.use-case';
import { ProductRepository } from '../domain/product-repository';
import { HttpProductRepository } from './http-product-repository';

// Seul fichier qui lie le port à son adaptateur ; branché dans les providers de route.
export const provideCatalog = (): Provider[] => [
  { provide: ProductRepository, useClass: HttpProductRepository },
  ListCategories,
  ListProductsByCategory,
  GetProductBySlug,
  ListNewProducts,
];
