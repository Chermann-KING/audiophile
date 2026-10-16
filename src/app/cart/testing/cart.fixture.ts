import type { CartLine, CartProduct } from '../domain/cart';

export const aCartProduct = (overrides: Partial<CartProduct> = {}): CartProduct => ({
  productId: '1',
  name: 'XX99 Mark II Headphones',
  unitPrice: 100,
  imageUrl: '/assets/d.jpg',
  ...overrides,
});

export const aLine = (overrides: Partial<CartLine> = {}): CartLine => ({
  ...aCartProduct(),
  quantity: 1,
  ...overrides,
});
