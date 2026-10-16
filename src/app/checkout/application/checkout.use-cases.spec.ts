import { Injector } from '@angular/core';

import type { CheckoutError } from '../domain/checkout-error';
import type { Order } from '../domain/order';
import { OrderRepository } from '../domain/order-repository';
import { aCheckoutInput } from '../testing/checkout.fixture';
import { InMemoryOrderRepository } from '../testing/in-memory-order-repository';
import { ListOrders } from './list-orders.use-case';
import { PlaceOrder } from './place-order.use-case';

const NETWORK: CheckoutError = { kind: 'NETWORK' };

const setup = (existing: readonly Order[] = [], failure?: CheckoutError) => {
  const repository = new InMemoryOrderRepository(existing, failure);
  const injector = Injector.create({
    providers: [{ provide: OrderRepository, useValue: repository }, PlaceOrder, ListOrders],
  });
  return { repository, injector };
};

describe('PlaceOrder', () => {
  it('enregistre la commande avec ses totaux et la renvoie', async () => {
    const { repository, injector } = setup();
    const result = await injector.get(PlaceOrder).execute(aCheckoutInput());

    expect(result.ok && result.value.id).toBe('order-1');
    expect(repository.placed[0]).toMatchObject({ subtotal: 200, shipping: 50, vat: 40, total: 250 });
  });

  it('refuse une commande invalide sans appeler le dépôt', async () => {
    const { repository, injector } = setup();
    const result = await injector.get(PlaceOrder).execute(aCheckoutInput({ lines: [] }));

    expect(result).toEqual({ ok: false, error: 'EMPTY_CART' });
    expect(repository.placed).toHaveLength(0);
  });

  it('propage l’erreur du dépôt', async () => {
    const { injector } = setup([], NETWORK);
    expect(await injector.get(PlaceOrder).execute(aCheckoutInput())).toEqual({ ok: false, error: NETWORK });
  });
});

describe('ListOrders', () => {
  it('liste les commandes de l’utilisateur selon le statut', async () => {
    const orders = [{ id: 'a' } as Order];
    const { repository, injector } = setup(orders);
    const result = await injector.get(ListOrders).execute('1', 'pending');

    expect(result).toEqual({ ok: true, value: orders });
    expect(repository.listed).toEqual([{ userId: '1', status: 'pending' }]);
  });

  it('propage l’erreur du dépôt', async () => {
    const { injector } = setup([], NETWORK);
    expect(await injector.get(ListOrders).execute('1', 'completed')).toEqual({ ok: false, error: NETWORK });
  });
});
