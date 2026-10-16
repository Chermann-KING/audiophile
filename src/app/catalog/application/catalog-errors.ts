import type { CatalogError } from '../domain/catalog-error';

export type ProductLookupError = CatalogError | { readonly kind: 'NOT_FOUND'; readonly slug: string };
