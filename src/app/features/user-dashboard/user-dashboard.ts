import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { OrderService } from '../../services/order';
import { CustomerService } from '../../services/customer';
import { ProductService } from '../../services/product';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './user-dashboard.html',
})
export class UserDashboard implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private router = inject(Router);

  orders = this.orderService.orders;
  products = this.productService.products;

  selectedOrderId = signal<number | null>(null);
  selectedItems = signal<any[]>([]);
  isLoading = signal(false);

  orderForm = this.fb.group({
    items: this.fb.array([]),
  });

  get items() {
    return this.orderForm.get('items') as FormArray;
  }

  ngOnInit() {
    this.orderService.load(); // backend filters by JWT user
    this.productService.load();
    this.addItem();
    
    // Auto-refresh orders every 5 seconds
    setInterval(() => this.orderService.load(), 5000);
  }

  /* ================= ORDER CREATION ================= */

  addItem() {
    this.items.push(
      this.fb.group({
        productId: ['', Validators.required],
        quantity: [1, Validators.required],
      }),
    );
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  getTotal(): number {
    return this.items.controls.reduce((total, control) => {
      const productId = control.value.productId;
      const quantity = control.value.quantity;

      const product = this.products().find((p) => p.product_id == productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  }

  submit() {
    if (this.orderForm.invalid) return;

    const rawItems = this.orderForm.value.items ?? [];

    const payload = {
      items: rawItems.map((item: any) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    };

    this.orderService.create(payload).subscribe((res: any) => {
      const orderId = res.order_id;
      const amount = this.getTotal();
      this.router.navigate(['/payment'], { queryParams: { orderId, amount } });
    });
  }
  /* ================= VIEW ORDER DETAILS ================= */

  viewOrder(orderId: number) {
    this.selectedOrderId.set(orderId);
    this.isLoading.set(true);

    this.orderService.getItems(orderId).subscribe((data) => {
      this.selectedItems.set(data);
      this.isLoading.set(false);
    });
  }

  closeOverlay() {
    this.selectedOrderId.set(null);
    this.selectedItems.set([]);
  }
}
