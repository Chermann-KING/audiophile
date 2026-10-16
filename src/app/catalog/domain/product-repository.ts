import type { Result } from '../../shared/kernel/result';
import type { CatalogError } from './catalog-error';
import type { Product } from './product';

// Port sortant : l'API ne propose que la liste complète, le filtrage est une règle du catalogue.
export abstract class ProductRepository {
  abstract listAll(): Promise<Result<readonly Product[], CatalogError>>;
}
