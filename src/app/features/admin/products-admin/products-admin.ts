import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './products-admin.html',
  styleUrl: './products-admin.css',
})
export class ProductsAdmin implements OnInit {
  private service = inject(ProductService);

  // Directly bind to signal
  products = this.service.products;

  form: Product = {
    product_id: 0,
    name: '',
    price: 0,
    stock: 0,
  };

  ngOnInit() {
    this.service.load();
  }

  save() {
    if (this.form.product_id) {
      this.service.update(this.form.product_id, {
        name: this.form.name,
        price: this.form.price,
        stock: this.form.stock,
      });
    } else {
      const { product_id, ...newProduct } = this.form;
      this.service.add(newProduct as Product);
    }

    this.reset();
  }

  edit(product: Product) {
    this.form = { ...product };
  }

  delete(id: number) {
    this.service.remove(id);
  }

  reset() {
    this.form = {
      product_id: 0,
      name: '',
      price: 0,
      stock: 0,
    };
  }
}
