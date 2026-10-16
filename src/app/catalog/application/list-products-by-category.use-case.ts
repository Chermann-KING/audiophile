import { Injectable, inject } from '@angular/core';

import { err, ok, type Result } from '../../shared/kernel/result';
import type { CatalogError } from '../domain/catalog-error';
import { sortForDisplay, type Product } from '../domain/product';
import { ProductRepository } from '../domain/product-repository';

@Injectable()
export class ListProductsByCategory {
  private readonly repository = inject(ProductRepository);

  async execute(category: string): Promise<Result<readonly Product[], CatalogError>> {
    const products = await this.repository.listAll();
    if (!products.ok) return err(products.error);
    return ok(sortForDisplay(products.value.filter((product) => product.category === category)));
  }
}
