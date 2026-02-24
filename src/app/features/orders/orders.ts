import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';

// import { StatusPipe } from '../../shared/pipes/status-pipe';
import { CustomerService } from '../../services/customer';
import { ProductService } from '../../services/product';
import { OrderService } from '../../services/order';
import { signal } from '@angular/core';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './orders.html',
})
export class Orders {
  isLoading = signal(false);
  selectedOrderId = signal<number | null>(null);
  selectedItems = signal<any[]>([]);

  fb = inject(FormBuilder);
  customerService = inject(CustomerService);
  productService = inject(ProductService);
  orderService = inject(OrderService);

  ngOnInit() {
    this.customerService.load();
    this.productService.load();
    this.orderService.load();
  }

  orderForm = this.fb.group({
    customerId: ['', Validators.required],
    items: this.fb.array([]),
  });

  get items() {
    return this.orderForm.get('items') as FormArray;
  }

  get orders() {
    return this.orderService.orders;
  }

  get products() {
    return this.productService.products;
  }

  get customers() {
    return this.customerService.customers;
  }

  addItem() {
    this.items.push(
      this.fb.group({
        productId: ['', Validators.required],
        quantity: [1, Validators.required],
      }),
    );
  }

  getTotal(): number {
    return this.items.controls.reduce((total: number, control: any) => {
      const productId = control.value.productId;
      const quantity = control.value.quantity;

      const product = this.products().find((p) => p.product_id == productId);

      return total + (product ? product.price * quantity : 0);
    }, 0);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
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

    this.orderService.create(payload).subscribe(() => {
      this.orderService.load();
      this.orderForm.reset();
    });
  }

  viewOrder(orderId: number) {
    this.selectedOrderId.set(orderId);
    this.selectedItems.set([]);
    this.isLoading.set(true);

    this.orderService.getItems(orderId).subscribe({
      next: (data) => {
        this.selectedItems.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  closeOverlay() {
    this.selectedOrderId.set(null);
    this.selectedItems.set([]);
  }
}
