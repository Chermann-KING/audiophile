import { err, ok, type Result } from '../../shared/kernel/result';

// Instantané d'un produit au moment de l'ajout : le panier ne dépend pas du catalogue.
export interface CartProduct {
  readonly productId: string;
  readonly name: string;
  readonly shortName?: string;
  readonly unitPrice: number;
  readonly imageUrl: string;
}

export interface CartLine extends CartProduct {
  readonly quantity: number;
}

export interface Cart {
  readonly lines: readonly CartLine[];
}

export type CartError = 'INVALID_QUANTITY';

export const EMPTY_CART: Cart = { lines: [] };

const isPositiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;
const isNonNegativeInteger = (value: number): boolean => Number.isInteger(value) && value >= 0;

export function addProduct(cart: Cart, product: CartProduct, quantity: number): Result<Cart, CartError> {
  if (!isPositiveInteger(quantity)) return err('INVALID_QUANTITY');

  const existing = cart.lines.find((line) => line.productId === product.productId);
  if (!existing) return ok({ lines: [...cart.lines, { ...product, quantity }] });

  return ok({
    lines: cart.lines.map((line) =>
      line.productId === product.productId ? { ...line, quantity: line.quantity + quantity } : line
    ),
  });
}

// Une quantité de 0 retire la ligne ; un produit absent laisse le panier inchangé.
export function setQuantity(cart: Cart, productId: string, quantity: number): Result<Cart, CartError> {
  if (!isNonNegativeInteger(quantity)) return err('INVALID_QUANTITY');
  if (quantity === 0) return ok(removeLine(cart, productId));

  return ok({
    lines: cart.lines.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
  });
}

export function removeLine(cart: Cart, productId: string): Cart {
  return { lines: cart.lines.filter((line) => line.productId !== productId) };
}

export const clearCart = (): Cart => EMPTY_CART;

export const itemCount = (cart: Cart): number => cart.lines.reduce((count, line) => count + line.quantity, 0);

export const total = (cart: Cart): number =>
  cart.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
