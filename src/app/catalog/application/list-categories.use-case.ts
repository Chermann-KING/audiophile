import { Injectable, inject } from '@angular/core';

import { err, ok, type Result } from '../../shared/kernel/result';
import { deriveCategories, type Category } from '../domain/category';
import type { CatalogError } from '../domain/catalog-error';
import { ProductRepository } from '../domain/product-repository';

@Injectable()
export class ListCategories {
  private readonly repository = inject(ProductRepository);

  async execute(): Promise<Result<readonly Category[], CatalogError>> {
    const products = await this.repository.listAll();
    return products.ok ? ok(deriveCategories(products.value)) : err(products.error);
  }
}
