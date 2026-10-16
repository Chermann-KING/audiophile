import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AddToCart } from '../application/add-to-cart.use-case';
import { ClearCart } from '../application/clear-cart.use-case';
import { GetCart } from '../application/get-cart.use-case';
import { RemoveFromCart } from '../application/remove-from-cart.use-case';
import { SetCartQuantity } from '../application/set-cart-quantity.use-case';
import { CartRepository } from '../domain/cart-repository';
import { aCartProduct, aLine } from '../testing/cart.fixture';
import { InMemoryCartRepository } from '../testing/in-memory-cart-repository';
import { CartStore } from './cart.store';

const setup = (lines = [aLine({ productId: 'a', unitPrice: 10, quantity: 2 })]) => {
  const repository = new InMemoryCartRepository({ lines });
  TestBed.configureTestingModule({
    providers: [
      { provide: CartRepository, useValue: repository },
      GetCart,
      AddToCart,
      SetCartQuantity,
      RemoveFromCart,
      ClearCart,
      CartStore,
    ],
  });
  return { repository, store: TestBed.inject(CartStore), document: TestBed.inject(DOCUMENT) };
};

describe('CartStore', () => {
  it('démarre avec le panier enregistré', () => {
    const { store } = setup();
    expect(store.itemCount()).toBe(2);
    expect(store.total()).toBe(20);
  });

  it('met à jour les totaux à l’ajout d’un produit', () => {
    const { store } = setup();
    store.add(aCartProduct({ productId: 'b', unitPrice: 5 }), 3);

    expect(store.itemCount()).toBe(5);
    expect(store.total()).toBe(35);
  });

  it('ignore un ajout invalide sans modifier l’état', () => {
    const { store, repository } = setup();
    expect(store.add(aCartProduct(), 0)).toBe(false);

    expect(store.itemCount()).toBe(2);
    expect(repository.saveCount).toBe(0);
  });

  it('modifie la quantité, retire une ligne puis vide le panier', () => {
    const { store } = setup();
    store.setQuantity('a', 5);
    expect(store.itemCount()).toBe(5);

    store.remove('a');
    expect(store.lines()).toEqual([]);

    store.add(aCartProduct(), 1);
    store.clear();
    expect(store.itemCount()).toBe(0);
  });

  it('ouvre et ferme la boîte de dialogue en bloquant le défilement', () => {
    const { store, document } = setup();

    store.openDialog();
    expect(store.dialogOpen()).toBe(true);
    expect(document.body.classList.contains('menu-open')).toBe(true);

    store.closeDialog();
    expect(store.dialogOpen()).toBe(false);
    expect(document.body.classList.contains('menu-open')).toBe(false);
  });
});
