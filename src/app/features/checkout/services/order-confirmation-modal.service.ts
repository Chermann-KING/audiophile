import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order, OrderResponse } from '../../../core/models/order.model';

@Injectable()
export class OrderConfirmationModalService {
  private isVisibleSubject = new BehaviorSubject<boolean>(false);
  private orderDataSubject = new BehaviorSubject<Order | OrderResponse | null>(
    null
  );

  isVisible$ = this.isVisibleSubject.asObservable();
  orderData$ = this.orderDataSubject.asObservable();

  showModal(orderData: Order | OrderResponse): void {
    console.log('showModal appelé avec:', orderData);
    this.orderDataSubject.next(orderData);
    this.isVisibleSubject.next(true);
    console.log(
      'État isVisible après mise à jour:',
      this.isVisibleSubject.value
    );
  }

  hideModal(): void {
    this.isVisibleSubject.next(false);
    this.orderDataSubject.next(null);
  }
}
