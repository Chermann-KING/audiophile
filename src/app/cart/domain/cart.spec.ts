import { aCartProduct, aLine } from '../testing/cart.fixture';
import { addProduct, clearCart, EMPTY_CART, itemCount, removeLine, setQuantity, total } from './cart';

const cartOf = (...lines: ReturnType<typeof aLine>[]) => ({ lines });

describe('addProduct', () => {
  it('ajoute une nouvelle ligne', () => {
    const result = addProduct(EMPTY_CART, aCartProduct({ productId: 'a' }), 2);
    expect(result).toEqual({ ok: true, value: cartOf(aLine({ productId: 'a', quantity: 2 })) });
  });

  it('cumule la quantité d’un produit déjà présent', () => {
    const cart = cartOf(aLine({ productId: 'a', quantity: 1 }));
    const result = addProduct(cart, aCartProduct({ productId: 'a' }), 3);
    expect(result.ok && result.value.lines).toEqual([aLine({ productId: 'a', quantity: 4 })]);
  });

  it.each([0, -1, 1.5, Number.NaN])('refuse la quantité %s', (quantity) => {
    expect(addProduct(EMPTY_CART, aCartProduct(), quantity)).toEqual({ ok: false, error: 'INVALID_QUANTITY' });
  });

  it('ne modifie pas le panier d’origine', () => {
    const cart = cartOf(aLine({ productId: 'a', quantity: 1 }));
    addProduct(cart, aCartProduct({ productId: 'a' }), 3);
    expect(cart.lines[0].quantity).toBe(1);
  });
});

describe('setQuantity', () => {
  const cart = cartOf(aLine({ productId: 'a', quantity: 2 }), aLine({ productId: 'b', quantity: 1 }));

  it('remplace la quantité d’une ligne', () => {
    const result = setQuantity(cart, 'a', 5);
    expect(result.ok && result.value.lines.map((line) => line.quantity)).toEqual([5, 1]);
  });

  it('supprime la ligne quand la quantité est 0', () => {
    const result = setQuantity(cart, 'a', 0);
    expect(result.ok && result.value.lines.map((line) => line.productId)).toEqual(['b']);
  });

  it('laisse le panier inchangé pour un produit inconnu', () => {
    expect(setQuantity(cart, 'zzz', 3)).toEqual({ ok: true, value: cart });
  });

  it.each([-1, 2.5, Number.NaN])('refuse la quantité %s', (quantity) => {
    expect(setQuantity(cart, 'a', quantity)).toEqual({ ok: false, error: 'INVALID_QUANTITY' });
  });
});

describe('removeLine et clearCart', () => {
  it('retire une ligne', () => {
    const cart = cartOf(aLine({ productId: 'a' }), aLine({ productId: 'b' }));
    expect(removeLine(cart, 'a').lines.map((line) => line.productId)).toEqual(['b']);
  });

  it('vide le panier', () => {
    expect(clearCart()).toEqual(EMPTY_CART);
  });
});

describe('totaux', () => {
  const cart = cartOf(aLine({ unitPrice: 100, quantity: 2 }), aLine({ productId: 'b', unitPrice: 50, quantity: 3 }));

  it('calcule le nombre d’articles', () => {
    expect(itemCount(cart)).toBe(5);
  });

  it('calcule le total', () => {
    expect(total(cart)).toBe(350);
  });

  it('vaut 0 pour un panier vide', () => {
    expect(itemCount(EMPTY_CART)).toBe(0);
    expect(total(EMPTY_CART)).toBe(0);
  });
});
