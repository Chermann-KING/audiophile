import type { CheckoutInput } from '../domain/order-request';
import type { OrderLine } from '../domain/order';

export const aLine = (overrides: Partial<OrderLine> = {}): OrderLine => ({
  productId: '1',
  name: 'XX99 Mark II Headphones',
  price: 100,
  quantity: 2,
  image: '/assets/d.jpg',
  ...overrides,
});

export const aCheckoutInput = (overrides: Partial<CheckoutInput> = {}): CheckoutInput => ({
  shipping: {
    name: 'Alexei Ward',
    email: 'alexei@example.com',
    phone: '+1 (202) 55-01136',
    address: '1137 Williams Avenue',
    zipCode: '10001',
    city: 'New York',
    country: 'United States',
  },
  payment: { method: 'cash' },
  lines: [aLine()],
  ...overrides,
});
