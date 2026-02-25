import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../services/order';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './orders-admin.html',
})
export class OrdersAdmin implements OnInit {
  private service = inject(OrderService);

  orders = this.service.orders;
  selectedOrderId = signal<number | null>(null);
  selectedItems = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.service.load();
  }

  refreshOrders() {
    this.service.load();
  }

  updateStatus(orderId: number, newStatus: string) {
    console.log('Updating order status - Current role:', localStorage.getItem('role'));
    console.log('Token:', localStorage.getItem('token'));
    this.service.updateStatus(orderId, newStatus).subscribe(() => {
      this.service.load();
    });
  }

  viewOrder(orderId: number) {
    this.selectedOrderId.set(orderId);
    this.isLoading.set(true);

    this.service.getItems(orderId).subscribe((data) => {
      this.selectedItems.set(data);
      this.isLoading.set(false);
    });
  }

  closeOverlay() {
    this.selectedOrderId.set(null);
    this.selectedItems.set([]);
  }
}
