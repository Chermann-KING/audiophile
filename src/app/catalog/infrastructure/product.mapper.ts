import { err, type Result } from '../../shared/kernel/result';
import type { CatalogError } from '../domain/catalog-error';
import { createProduct, type Product } from '../domain/product';
import { productDtoSchema } from './product.dto';

// Valide la réponse de l'API (type `unknown`) puis repasse par les invariants du domaine.
export function dtoToProduct(raw: unknown): Result<Product, CatalogError> {
  const parsed = productDtoSchema.safeParse(raw);
  if (!parsed.success) return err({ kind: 'INVALID_DATA', detail: parsed.error.message });

  const created = createProduct(parsed.data);
  return created.ok ? created : err({ kind: 'INVALID_DATA', detail: created.error });
}
