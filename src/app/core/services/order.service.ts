import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private _http: HttpClient) {}

  createOrder(orderData: any): Observable<Order> {
    return this._http.post<Order>(this.apiUrl, orderData);
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
