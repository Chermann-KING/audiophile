import { Injector } from '@angular/core';

import { CartRepository } from '../domain/cart-repository';
import type { Cart } from '../domain/cart';
import { InMemoryCartRepository } from '../testing/in-memory-cart-repository';
import { aCartProduct, aLine } from '../testing/cart.fixture';
import { AddToCart } from './add-to-cart.use-case';
import { ClearCart } from './clear-cart.use-case';
import { GetCart } from './get-cart.use-case';
import { RemoveFromCart } from './remove-from-cart.use-case';
import { SetCartQuantity } from './set-cart-quantity.use-case';

const setup = (stored?: Cart) => {
  const repository = new InMemoryCartRepository(stored);
  const injector = Injector.create({
    providers: [
      { provide: CartRepository, useValue: repository },
      GetCart,
      AddToCart,
      SetCartQuantity,
      RemoveFromCart,
      ClearCart,
    ],
  });
  return { repository, injector };
};

const TWO_LINES: Cart = { lines: [aLine({ productId: 'a', quantity: 2 }), aLine({ productId: 'b', quantity: 1 })] };

describe('GetCart', () => {
  it('renvoie le panier enregistré', () => {
    expect(setup(TWO_LINES).injector.get(GetCart).execute()).toEqual(TWO_LINES);
  });
});

describe('AddToCart', () => {
  it('ajoute le produit et enregistre le panier', () => {
    const { repository, injector } = setup();
    const result = injector.get(AddToCart).execute(aCartProduct({ productId: 'a' }), 2);

    expect(result.ok && result.value.lines).toEqual([aLine({ productId: 'a', quantity: 2 })]);
    expect(repository.stored.lines).toHaveLength(1);
  });

  it('n’enregistre rien quand la quantité est invalide', () => {
    const { repository, injector } = setup();
    const result = injector.get(AddToCart).execute(aCartProduct(), 0);

    expect(result).toEqual({ ok: false, error: 'INVALID_QUANTITY' });
    expect(repository.saveCount).toBe(0);
  });
});

describe('SetCartQuantity', () => {
  it('met à jour la quantité et enregistre', () => {
    const { repository, injector } = setup(TWO_LINES);
    const result = injector.get(SetCartQuantity).execute('a', 7);

    expect(result.ok && result.value.lines[0].quantity).toBe(7);
    expect(repository.stored.lines[0].quantity).toBe(7);
  });

  it('retire la ligne à la quantité 0', () => {
    const { repository, injector } = setup(TWO_LINES);
    injector.get(SetCartQuantity).execute('a', 0);
    expect(repository.stored.lines.map((line) => line.productId)).toEqual(['b']);
  });

  it('refuse une quantité négative sans enregistrer', () => {
    const { repository, injector } = setup(TWO_LINES);
    expect(injector.get(SetCartQuantity).execute('a', -1)).toEqual({ ok: false, error: 'INVALID_QUANTITY' });
    expect(repository.saveCount).toBe(0);
  });
});

describe('RemoveFromCart et ClearCart', () => {
  it('retire une ligne et enregistre', () => {
    const { repository, injector } = setup(TWO_LINES);
    const cart = injector.get(RemoveFromCart).execute('b');

    expect(cart.lines.map((line) => line.productId)).toEqual(['a']);
    expect(repository.stored).toEqual(cart);
  });

  it('vide le panier et enregistre', () => {
    const { repository, injector } = setup(TWO_LINES);
    expect(injector.get(ClearCart).execute().lines).toEqual([]);
    expect(repository.stored.lines).toEqual([]);
  });
});
