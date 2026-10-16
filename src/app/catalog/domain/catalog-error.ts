export type CatalogError =
  | { readonly kind: 'NETWORK' }
  | { readonly kind: 'SERVER'; readonly status: number }
  | { readonly kind: 'INVALID_DATA'; readonly detail: string };
