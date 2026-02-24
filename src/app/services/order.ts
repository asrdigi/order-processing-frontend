import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderSummary } from '../models/order-summary';
import { OrderCreate } from '../models/order-create';
import { OrderItem } from '../models/order-detail';

@Injectable({ providedIn: 'root' })
export class OrderService {
  // Local development API
  // private API = 'http://localhost:3000/api/v1/orders';
  
  // Production API (Railway)
  private API = 'https://order-processing-backend-production.up.railway.app/api/v1/orders';

  orders = signal<OrderSummary[]>([]);

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<any[]>(this.API).subscribe((data) => {
      const mapped: OrderSummary[] = data.map((o) => ({
        order_id: o.order_id,
        totalAmount: o.total_amount,
        status: o.status,
        full_name: o.full_name,
      }));

      this.orders.set(mapped);
    });
  }

  create(payload: OrderCreate) {
    return this.http.post(this.API, payload);
  }

  updateStatus(orderId: number, status: string) {
    return this.http.put(`${this.API}/${orderId}/status`, { status });
  }

  getItems(orderId: number) {
    return this.http.get<OrderItem[]>(`${this.API}/${orderId}/items`);
  }
}
