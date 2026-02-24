import { Component, inject, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../models/customer';

@Component({
  selector: 'app-customers-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customers-admin.html',
  styleUrl: './customers-admin.css',
})
export class CustomersAdmin implements OnInit {
  private service = inject(CustomerService);

  // Bind directly to signal
  customers = this.service.customers;

  form: Customer = {
    customer_id: 0,
    full_name: '',
    email: '',
  };

  ngOnInit() {
    this.service.load();
  }

  save() {
    if (this.form.customer_id) {
      this.service.update(this.form);
    } else {
      const newCustomer = {
        full_name: this.form.full_name,
        email: this.form.email,
        phone: this.form.phone,
      };

      this.service.add(newCustomer).subscribe(() => this.service.load());
    }

    this.reset();
  }

  edit(customer: Customer) {
    this.form = { ...customer };
  }

  delete(id: number) {
    this.service.remove(id);
  }

  reset() {
    this.form = {
      customer_id: 0,
      full_name: '',
      email: '',
    };
  }
}
