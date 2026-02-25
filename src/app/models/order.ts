export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface Order {
  order_id: number;
  customerId?: number;
  totalAmount: number;
  status: string;
  order_date?: string;
  items?: OrderItem[];
}
