import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { HttpClient } from '@angular/common/http';

declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  standalone: true,
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg">
            <div class="card-body text-center p-5">
              @if (loading()) {
                <div class="spinner-border text-primary mb-3"></div>
                <h5>Processing...</h5>
              } @else {
                <h4 class="mb-4">Payment</h4>
                <p class="text-muted">Order ID: {{ orderId() }}</p>
                <h3 class="text-primary mb-4">₹{{ amount() }}</h3>
                <button class="btn btn-primary btn-lg w-100" (click)="pay()">Pay Now</button>
                <button class="btn btn-outline-secondary mt-3 w-100" (click)="cancel()">
                  Cancel
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Payment implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private http = inject(HttpClient);

  orderId = signal<number>(0);
  amount = signal<number>(0);
  loading = signal(false);

  ngOnInit() {
    this.orderId.set(Number(this.route.snapshot.queryParams['orderId']));
    this.amount.set(Number(this.route.snapshot.queryParams['amount']));
  }

  pay() {
    this.loading.set(true);

    const options = {
      key: 'rzp_live_SKIBqzqnSzSxL6',
      amount: this.amount() * 100,
      currency: 'INR',
      name: 'OrderProcessingSystem',
      description: `Payment for Order #${this.orderId()}`,
      handler: (response: any) => {
        this.loading.set(false);
        alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);
        this.router.navigate(['/user']);
      },
      modal: {
        ondismiss: () => {
          this.loading.set(false);
          this.deleteOrder();
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
    this.loading.set(false);
  }

  cancel() {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.loading.set(true);
      this.deleteOrder();
    }
  }

  deleteOrder() {
    console.log('Attempting to delete order:', this.orderId());
    
    this.orderService.delete(this.orderId()).subscribe({
      next: () => {
        console.log('Order deleted successfully');
        this.loading.set(false);
        alert('Order cancelled');
        console.log('About to navigate to /user');
        setTimeout(() => {
          this.router.navigate(['/user']).then(() => {
            console.log('Navigation completed');
          });
        }, 100);
      },
      error: (err) => {
        console.error('Error deleting order:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.loading.set(false);
        
        // If order doesn't exist (404), treat it as already cancelled
        if (err.status === 404) {
          alert('Order has already been cancelled or does not exist');
          console.log('About to navigate to /user after 404');
          setTimeout(() => {
            this.router.navigate(['/user']).then(() => {
              console.log('Navigation completed after 404');
            });
          }, 100);
        } else {
          alert('Failed to cancel order. Please try again.');
        }
      }
    });
  }
}
