export type AccountError =
  | { readonly kind: 'NETWORK' }
  | { readonly kind: 'SERVER'; readonly status: number }
  | { readonly kind: 'INVALID_DATA'; readonly detail: string };
