import { Injectable, inject } from '@angular/core';

import { err, ok, type Result } from '../../shared/kernel/result';
import type { Product } from '../domain/product';
import { ProductRepository } from '../domain/product-repository';
import type { ProductLookupError } from './catalog-errors';

@Injectable()
export class GetProductBySlug {
  private readonly repository = inject(ProductRepository);

  async execute(slug: string): Promise<Result<Product, ProductLookupError>> {
    const products = await this.repository.listAll();
    if (!products.ok) return err(products.error);
    const product = products.value.find((candidate) => candidate.slug === slug);
    return product ? ok(product) : err({ kind: 'NOT_FOUND', slug });
  }
}
