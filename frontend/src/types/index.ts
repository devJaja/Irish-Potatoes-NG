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
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: {
    street: string;
    city?: string; // Made optional based on backend schema
    state: string;
    zipCode?: string; // Made optional based on backend schema
  };
  avatar?: string; // Add optional avatar field
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
