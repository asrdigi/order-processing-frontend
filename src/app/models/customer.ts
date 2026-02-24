export interface Customer {
  customer_id: number;
  full_name: string;
  email: string;
  phone?: string;
}

export interface CustomerCreate {
  full_name: string;
  email: string;
  phone?: string;
}
