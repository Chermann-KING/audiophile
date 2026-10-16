import { err, ok, type Result } from '../../shared/kernel/result';
import type { CatalogError } from '../domain/catalog-error';
import type { Product } from '../domain/product';
import { ProductRepository } from '../domain/product-repository';

export class InMemoryProductRepository extends ProductRepository {
  constructor(
    private readonly products: readonly Product[] = [],
    private readonly failure?: CatalogError
  ) {
    super();
  }

  async listAll(): Promise<Result<readonly Product[], CatalogError>> {
    return this.failure ? err(this.failure) : ok(this.products);
  }
}
