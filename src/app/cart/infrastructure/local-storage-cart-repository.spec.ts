import { aLine } from '../testing/cart.fixture';
import { LocalStorageCartRepository } from './local-storage-cart-repository';

describe('LocalStorageCartRepository', () => {
  beforeEach(() => localStorage.clear());

  it('renvoie un panier vide au premier démarrage', () => {
    expect(new LocalStorageCartRepository().load()).toEqual({ lines: [] });
  });

  it('enregistre puis relit le panier', () => {
    const cart = { lines: [aLine({ productId: 'a', quantity: 3 })] };
    new LocalStorageCartRepository().save(cart);

    expect(new LocalStorageCartRepository().load()).toEqual(cart);
  });

  it('écrit sous la clé historique « cart »', () => {
    new LocalStorageCartRepository().save({ lines: [aLine()] });
    expect(localStorage.getItem('cart')).not.toBeNull();
  });
});
