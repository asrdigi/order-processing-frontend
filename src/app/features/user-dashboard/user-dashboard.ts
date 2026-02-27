import { Component, inject, OnInit, signal, effect, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { OrderService } from '../../services/order';
import { CustomerService } from '../../services/customer';
import { ProductService } from '../../services/product';
import { DatePipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './user-dashboard.html',
})
export class UserDashboard implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private routerSubscription?: Subscription;

  orders = this.orderService.orders;
  products = this.productService.products;

  selectedOrderId = signal<number | null>(null);
  selectedItems = signal<any[]>([]);
  isLoading = signal(false);
  showAddressConfirm = signal(false);
  userAddress = signal<string>('');
  selectedImage = signal<string | null>(null);
  activeTab = signal<'create' | 'orders'>('create');
  username = signal<string>('');

  orderForm = this.fb.group({
    items: this.fb.array([]),
  });

  get items() {
    return this.orderForm.get('items') as FormArray;
  }

  ngOnInit() {
    this.orderService.load();
    this.productService.load();
    this.loadUserAddress();
    this.loadUsername();
    this.addItem();

    // Reload orders whenever we navigate to this route
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.orderService.load();
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  loadUserAddress() {
    this.customerService.getAll().subscribe({
      next: (customers: any[]) => {
        // Get customer_id from JWT token
        const token = localStorage.getItem('token');
        if (!token) {
          this.userAddress.set('Please login to see address');
          return;
        }
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.customer_id;
          
          const customer = customers.find(c => c.customer_id === userId);
          
          if (customer) {
            this.userAddress.set(customer.address || 'No address on file');
          } else {
            this.userAddress.set('Customer not found');
          }
        } catch (err) {
          this.userAddress.set('Error loading address');
        }
      },
      error: (err) => {
        this.userAddress.set('Unable to load address');
      }
    });
  }

  loadUsername() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username.set(payload.username || 'User');
      } catch (err) {
        this.username.set('User');
      }
    }
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
    this.showAddressConfirm.set(true);
  }

  confirmAndProceed() {
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

  cancelAddressConfirm() {
    this.showAddressConfirm.set(false);
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

  getProductImage(productId: number): string {
    const product = this.products().find(p => p.product_id === productId);
    return product?.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3EProduct%3C/text%3E%3C/svg%3E';
  }

  getPlaceholderImage(size: number = 50): string {
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"%3E%3Crect width="${size}" height="${size}" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3EProduct%3C/text%3E%3C/svg%3E`;
  }

  openImageModal(imageUrl: string) {
    this.selectedImage.set(imageUrl);
  }

  closeImageModal() {
    this.selectedImage.set(null);
  }
}
