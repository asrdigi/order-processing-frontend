import { Component } from '@angular/core';
import { CustomersAdmin } from '../admin/customers-admin/customers-admin';
import { ProductsAdmin } from '../admin/products-admin/products-admin';
import { OrdersAdmin } from '../admin/orders-admin/orders-admin';
import { AuthService } from '../../core/auth-service';

@Component({
  standalone: true,
  imports: [CustomersAdmin, ProductsAdmin, OrdersAdmin],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold">Admin Dashboard</h4>
        <button class="btn btn-outline-danger btn-sm" (click)="logout()">Logout</button>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'customers'"
            (click)="activeTab = 'customers'"
          >
            Customers
          </button>
        </li>

        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'products'"
            (click)="activeTab = 'products'"
          >
            Products
          </button>
        </li>

        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'orders'"
            (click)="activeTab = 'orders'"
          >
            Orders
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="card shadow-sm p-4">
        @if (activeTab === 'customers') {
          <app-customers-admin />
        }

        @if (activeTab === 'products') {
          <app-products-admin />
        }

        @if (activeTab === 'orders') {
          <app-orders-admin />
        }
      </div>
    </div>
  `,
})
export class AdminDashboard {
  activeTab: 'customers' | 'products' | 'orders' = 'customers';

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
    location.href = '/login';
  }
}
