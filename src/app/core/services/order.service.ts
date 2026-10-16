import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NewOrder, Order, OrderResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private _http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/orders`;

  // json-server (développement) renvoie la commande ; l'API Vercel renvoie un OrderResponse.
  createOrder(orderData: NewOrder): Observable<Order | OrderResponse> {
    return this._http.post<Order | OrderResponse>(this.apiUrl, orderData);
  }

  getCurrentOrders(userId: number): Observable<Order[]> {
    return this._http.get<Order[]>(
      `${this.apiUrl}?userId=${userId}&status=pending`
    );
  }

  getOrderHistory(userId: number): Observable<Order[]> {
    return this._http.get<Order[]>(
      `${this.apiUrl}?userId=${userId}&status=completed`
    );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this._http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this._http.patch<Order>(`${this.apiUrl}/${orderId}`, { status });
  }
}
