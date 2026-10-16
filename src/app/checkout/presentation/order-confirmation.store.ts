import { Injectable, computed, signal } from '@angular/core';

import type { Order } from '../domain/order';

// État de la fenêtre de confirmation : visible tant qu'une commande est à afficher.
@Injectable()
export class OrderConfirmationStore {
  private readonly state = signal<Order | null>(null);

  readonly order = this.state.asReadonly();
  readonly visible = computed(() => this.state() !== null);

  show(order: Order): void {
    this.state.set(order);
  }

  hide(): void {
    this.state.set(null);
  }
}
