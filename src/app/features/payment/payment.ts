import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
    this.loading.set(false);
  }

  cancel() {
    this.router.navigate(['/user']);
  }
}
