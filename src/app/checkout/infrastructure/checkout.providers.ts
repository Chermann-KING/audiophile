import type { Provider } from '@angular/core';

import { ListOrders } from '../application/list-orders.use-case';
import { PlaceOrder } from '../application/place-order.use-case';
import { OrderRepository } from '../domain/order-repository';
import { HttpOrderRepository } from './http-order-repository';

// Les commandes sont consultées depuis le profil et créées depuis la page de commande : fourni à la racine.
export const provideCheckout = (): Provider[] => [
  { provide: OrderRepository, useClass: HttpOrderRepository },
  PlaceOrder,
  ListOrders,
];
