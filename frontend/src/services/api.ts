import axios from 'axios';
import { Product } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const mockProducts: Product[] = [
  {
    _id: '1',
    name: "Premium Irish Potatoes",
    description: "Fresh, high-quality Irish potatoes from Jos Plateau. Perfect for cooking and frying.",
    price: 15000,
    category: "fresh",
    weight: "50kg",
    stock: 100,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: [
      { minQuantity: 5, discount: 5 },
      { minQuantity: 10, discount: 10 }
    ]
  },
  {
    _id: '2',
    name: "Small Irish Potatoes",
    description: "Perfect size for home cooking. Fresh from Jos farms.",
    price: 8000,
    category: "fresh",
    weight: "25kg",
    stock: 150,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: [
      { minQuantity: 10, discount: 8 }
    ]
  },
  {
    _id: '3',
    name: "Irish Potato Seeds",
    description: "High-quality potato seeds for farming. Certified variety.",
    price: 25000,
    category: "seeds",
    weight: "10kg",
    stock: 50,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: [
      { minQuantity: 3, discount: 15 }
    ]
  },
  {
    _id: '4',
    name: "Washed Irish Potatoes",
    description: "Cleaned and ready-to-cook Irish potatoes.",
    price: 16000,
    category: "fresh",
    weight: "50kg",
    stock: 80,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: []
  },
  {
    _id: '5',
    name: "Processed Potato Flour",
    description: "Finely ground potato flour for various culinary uses.",
    price: 5000,
    category: "processed",
    weight: "5kg",
    stock: 200,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: []
  },
  {
    _id: '6',
    name: "Connect Irish Potatoes",
    description: "A popular variety of Irish potatoes, known for their versatility and good yield. Great for mashing and boiling.",
    price: 18000,
    category: "fresh",
    weight: "50kg",
    stock: 75,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: [
      { minQuantity: 5, discount: 7 },
      { minQuantity: 10, discount: 12 }
    ]
  },
  {
    _id: '7',
    name: "Marabel Irish Potatoes",
    description: "Marabel potatoes are famous for their smooth skin and excellent taste. Ideal for salads and roasting.",
    price: 20000,
    category: "fresh",
    weight: "50kg",
    stock: 60,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: [
      { minQuantity: 5, discount: 8 },
      { minQuantity: 10, discount: 15 }
    ]
  },
  {
    _id: '8',
    name: "Nicolas (Yellow) Irish Potatoes",
    description: "Also known as Yellow potatoes, Nicolas variety is creamy and buttery, perfect for baking and gratins.",
    price: 19000,
    category: "fresh",
    weight: "50kg",
    stock: 90,
    images: [],
    origin: 'Jos Plateau',
    bulkPricing: [
      { minQuantity: 5, discount: 6 },
      { minQuantity: 10, discount: 10 }
    ]
  }
];

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const productsAPI = {
  getProducts: async (params?: any) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    let filteredProducts = [...mockProducts];

    if (params.search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(params.search.toLowerCase())
      );
    }

    if (params.category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === params.category
      );
    }

    const page = params.page || 1;
    const limit = 12; // Assuming a fixed limit for now
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
        currentPage: page,
      }
    };
  },
  getProduct: (id: string) => api.get(`/products/${id}`),
};

export const ordersAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrder: (id: string) => api.get(`/orders/${id}`),
};

export default api;
