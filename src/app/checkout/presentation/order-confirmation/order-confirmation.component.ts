import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { OrderConfirmationStore } from '../order-confirmation.store';

const PREVIEWED_ITEMS = 1;

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
  imports: [DecimalPipe],
})
export class OrderConfirmationComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(OrderConfirmationStore);

  readonly showAllItems = signal(false);

  readonly visibleItems = computed(() => {
    const items = this.store.order()?.items ?? [];
    return this.showAllItems() ? items : items.slice(0, PREVIEWED_ITEMS);
  });

  readonly remainingItems = computed(() => Math.max(0, (this.store.order()?.items.length ?? 0) - PREVIEWED_ITEMS));

  toggleItemsVisibility(): void {
    this.showAllItems.update((showAll) => !showAll);
  }

  backToHome(): void {
    this.store.hide();
    this.router.navigate(['/']);
  }
}
