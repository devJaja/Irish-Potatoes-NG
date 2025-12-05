export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'fresh' | 'processed' | 'seeds';
  weight: string;
  stock: number;
  images: string[];
  origin: string;
  isActive: boolean;
  bulkPricing: { minQuantity: number; discount: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  items: { product: Product; quantity: number; price: number }[];
  totalAmount: number;
  discount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}
