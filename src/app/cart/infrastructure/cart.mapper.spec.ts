import { aLine } from '../testing/cart.fixture';
import { cartToJson, jsonToCart } from './cart.mapper';

describe('jsonToCart', () => {
  it('relit le format courant', () => {
    const lines = [aLine({ productId: 'a', quantity: 2 })];
    expect(jsonToCart(cartToJson({ lines }))).toEqual({ lines });
  });

  it('relit l’ancien format { product, quantity }', () => {
    const legacy = [
      {
        product: { id: '4', slug: 'xx99', name: 'XX99 Mark II', shortName: 'XX99', price: 2999, image: { mobile: 'm', tablet: 't', desktop: 'd.jpg' } },
        quantity: 2,
      },
    ];
    expect(jsonToCart(JSON.stringify(legacy))).toEqual({
      lines: [{ productId: '4', name: 'XX99 Mark II', shortName: 'XX99', unitPrice: 2999, imageUrl: 'd.jpg', quantity: 2 }],
    });
  });

  it.each([['absent', null], ['JSON invalide', '{pas du json'], ['mauvaise forme', '{"a":1}'], ['quantité négative', JSON.stringify([{ ...aLine(), quantity: -1 }])]])(
    'renvoie un panier vide pour %s',
    (_label, raw) => {
      expect(jsonToCart(raw)).toEqual({ lines: [] });
    }
  );
});
