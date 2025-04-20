import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order } from '../../../core/models/order.model';

@Injectable()
export class OrderConfirmationModalService {
  private isVisibleSubject = new BehaviorSubject<boolean>(false);
  private orderDataSubject = new BehaviorSubject<Order | null>(null);

  isVisible$ = this.isVisibleSubject.asObservable();
  orderData$ = this.orderDataSubject.asObservable();

  showModal(order: Order): void {
    console.log('showModal appelé avec:', order);
    this.orderDataSubject.next(order);
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
