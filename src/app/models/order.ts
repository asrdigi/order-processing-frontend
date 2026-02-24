export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerId: number;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}
