import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../models/customer';
import { CustomerCreate } from '../models/customer';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private API = 'http://localhost:3000/api/v1/customers';

  customers = signal<Customer[]>([]);

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<Customer[]>(this.API).subscribe((data) => this.customers.set(data));
  }

  getAll() {
    return this.http.get<any[]>(this.API);
  }

  add(customer: CustomerCreate) {
    return this.http.post<Customer>(this.API, customer);
  }

  remove(id: number) {
    this.http.delete(`${this.API}/${id}`).subscribe(() => {
      const currentCustomers = this.customers();
      this.customers.set(currentCustomers.filter((c) => c.customer_id !== id));
    });
  }

  update(customer: Customer) {
    this.http
      .put<Customer>(`${this.API}/${customer.customer_id}`, customer)
      .subscribe((updatedCustomer) => {
        const currentCustomers = this.customers();
        this.customers.set(
          currentCustomers.map((c) =>
            c.customer_id === customer.customer_id ? updatedCustomer : c,
          ),
        );
      });
  }
}
