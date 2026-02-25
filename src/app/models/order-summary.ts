export interface OrderSummary {
  order_id: number;
  totalAmount: number;
  status: string;
  full_name?: string;
  order_date?: string;
}
