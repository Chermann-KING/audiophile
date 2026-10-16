import { aCheckoutInput, aLine } from '../testing/checkout.fixture';
import { computeTotals, SHIPPING_FEE } from './order-totals';
import { createOrderRequest } from './order-request';

describe('computeTotals', () => {
  it('ajoute les frais de port et calcule la TVA incluse à 20 %', () => {
    expect(computeTotals(8098)).toEqual({ subtotal: 8098, shipping: SHIPPING_FEE, vat: 1620, total: 8148 });
  });

  it('arrondit la TVA à l’entier', () => {
    expect(computeTotals(103).vat).toBe(21);
  });

  it('applique les frais de port même à un sous-total nul', () => {
    expect(computeTotals(0)).toEqual({ subtotal: 0, shipping: 50, vat: 0, total: 50 });
  });
});

describe('createOrderRequest', () => {
  it('construit la commande avec ses totaux', () => {
    const result = createOrderRequest(
      aCheckoutInput({ lines: [aLine({ price: 100, quantity: 2 }), aLine({ productId: '2', price: 50, quantity: 1 })] })
    );

    expect(result.ok && result.value).toMatchObject({
      name: 'Alexei Ward',
      email: 'alexei@example.com',
      paymentMethod: 'cash',
      subtotal: 250,
      shipping: 50,
      vat: 50,
      total: 300,
    });
    expect(result.ok && result.value.items).toHaveLength(2);
  });

  it('ne transmet pas de coordonnées e-Money pour un paiement à la livraison', () => {
    const result = createOrderRequest(aCheckoutInput({ payment: { method: 'cash', emoneyNumber: '123456789', emoneyPin: '1234' } }));
    expect(result.ok && result.value.emoneyNumber).toBeUndefined();
    expect(result.ok && result.value.emoneyPin).toBeUndefined();
  });

  it('transmet les coordonnées e-Money valides', () => {
    const result = createOrderRequest(aCheckoutInput({ payment: { method: 'emoney', emoneyNumber: '123456789', emoneyPin: '1234' } }));
    expect(result.ok && result.value).toMatchObject({ paymentMethod: 'emoney', emoneyNumber: '123456789', emoneyPin: '1234' });
  });

  it('refuse une commande sans article', () => {
    expect(createOrderRequest(aCheckoutInput({ lines: [] }))).toEqual({ ok: false, error: 'EMPTY_CART' });
  });

  it.each([
    ['name', { name: 'Al' }, 'INVALID_NAME'],
    ['email', { email: 'nope' }, 'INVALID_EMAIL'],
    ['phone', { phone: 'abc' }, 'INVALID_PHONE'],
    ['address', { address: ' ' }, 'EMPTY_ADDRESS'],
    ['zipCode', { zipCode: '123' }, 'INVALID_ZIP_CODE'],
    ['city', { city: '' }, 'EMPTY_CITY'],
    ['country', { country: '' }, 'EMPTY_COUNTRY'],
  ] as const)('refuse un champ %s invalide', (_field, overrides, error) => {
    const base = aCheckoutInput();
    expect(createOrderRequest({ ...base, shipping: { ...base.shipping, ...overrides } })).toEqual({ ok: false, error });
  });

  it('refuse un numéro e-Money invalide', () => {
    expect(createOrderRequest(aCheckoutInput({ payment: { method: 'emoney', emoneyNumber: '12', emoneyPin: '1234' } }))).toEqual({
      ok: false,
      error: 'INVALID_EMONEY_NUMBER',
    });
  });

  it('refuse un code PIN e-Money invalide', () => {
    expect(createOrderRequest(aCheckoutInput({ payment: { method: 'emoney', emoneyNumber: '123456789', emoneyPin: '12' } }))).toEqual({
      ok: false,
      error: 'INVALID_EMONEY_PIN',
    });
  });
});
