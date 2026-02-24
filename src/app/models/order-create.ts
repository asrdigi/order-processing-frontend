export interface OrderCreate {
  items: {
    productId: number;
    quantity: number;
  }[];
}
