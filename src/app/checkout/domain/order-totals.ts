export const SHIPPING_FEE = 50;
export const VAT_RATE = 0.2;

export interface OrderTotals {
  readonly subtotal: number;
  readonly shipping: number;
  readonly vat: number; // TVA incluse dans le sous-total, affichée à titre informatif
  readonly total: number;
}

export function computeTotals(subtotal: number): OrderTotals {
  return {
    subtotal,
    shipping: SHIPPING_FEE,
    vat: Math.round(subtotal * VAT_RATE),
    total: subtotal + SHIPPING_FEE,
  };
}
