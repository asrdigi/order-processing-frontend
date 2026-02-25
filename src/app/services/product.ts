import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Local development API
  // private API = 'http://localhost:3000/api/v1/products';

  // Production API (Railway)
  private API = 'https://order-processing-backend-production.up.railway.app/api/v1/products';

  products = signal<Product[]>([]);

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<Product[]>(this.API).subscribe((data) => this.products.set(data));
  }

  add(product: Product) {
    this.http.post<Product>(this.API, product).subscribe((newProduct) => {
      const currentProducts = this.products();
      this.products.set([...currentProducts, newProduct]);
    });
  }

  remove(id: number) {
    this.http.delete(`${this.API}/${id}`).subscribe(() => {
      const currentProducts = this.products();
      this.products.set(currentProducts.filter((product) => product.product_id !== id));
    });
  }

  update(id: number, updates: Partial<Product>) {
    this.http.patch<Product>(`${this.API}/${id}`, updates).subscribe((updatedProduct) => {
      const currentProducts = this.products();
      this.products.set(currentProducts.map((p) => (p.product_id === id ? updatedProduct : p)));
    });
  }
}
