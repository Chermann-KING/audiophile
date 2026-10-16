import { Injectable, inject } from '@angular/core';

import { err, ok, type Result } from '../../shared/kernel/result';
import type { CatalogError } from '../domain/catalog-error';
import type { Product } from '../domain/product';
import { ProductRepository } from '../domain/product-repository';

@Injectable()
export class ListNewProducts {
  private readonly repository = inject(ProductRepository);

  async execute(): Promise<Result<readonly Product[], CatalogError>> {
    const products = await this.repository.listAll();
    return products.ok ? ok(products.value.filter((product) => product.new)) : err(products.error);
  }
}
