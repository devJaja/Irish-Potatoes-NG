import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminProducts from './AdminProducts';
import * as api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the API service
jest.mock('../services/api', () => ({
  productsAPI: {
    getProducts: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const mockProducts = {
  products: [
    {
      _id: '1',
      name: 'Test Potato 1',
      description: 'Desc 1',
      price: 100,
      category: 'fresh',
      weight: '1kg',
      stock: 10,
      images: [],
      origin: 'Farm A',
      isActive: true,
      bulkPricing: [],
    },
    {
      _id: '2',
      name: 'Test Potato 2',
      description: 'Desc 2',
      price: 200,
      category: 'processed',
      weight: '2kg',
      stock: 20,
      images: [],
      origin: 'Farm B',
      isActive: true,
      bulkPricing: [],
    },
  ],
  total: 2,
  totalPages: 1,
  currentPage: 1,
};

const renderWithProviders = (ui: React.ReactElement, authContextValue: any) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authContextValue}>
        <Router>{ui}</Router>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('AdminProducts', () => {
  const authContextValue = {
    user: { id: 'admin123', name: 'Admin', email: 'admin@example.com', role: 'admin' },
    token: 'fake-admin-token',
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    (api.productsAPI.getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (api.productsAPI.createProduct as jest.Mock).mockResolvedValue({});
    (api.productsAPI.updateProduct as jest.Mock).mockResolvedValue({});
    (api.productsAPI.deleteProduct as jest.Mock).mockResolvedValue({});
    queryClient.clear(); // Clear cache before each test
  });

  it('renders product list correctly', async () => {
    renderWithProviders(<AdminProducts />, authContextValue);

    expect(screen.getByText('Admin Product Management')).toBeInTheDocument();
    expect(screen.getByText('Existing Products')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Potato 1')).toBeInTheDocument();
      expect(screen.getByText('Test Potato 2')).toBeInTheDocument();
    });
  });

  it('allows adding a new product', async () => {
    renderWithProviders(<AdminProducts />, authContextValue);

    await waitFor(() => {
      expect(screen.getByText('Test Potato 1')).toBeInTheDocument();
    });

    userEvent.type(screen.getByLabelText(/Product Name/i), 'New Potato');
    userEvent.type(screen.getByLabelText(/Description/i), 'New description');
    userEvent.type(screen.getByLabelText(/Price/i), '300');
    userEvent.selectOptions(screen.getByLabelText(/Category/i), 'seeds');
    userEvent.type(screen.getByLabelText(/Weight/i), '3kg');
    userEvent.type(screen.getByLabelText(/Stock/i), '30');
    userEvent.type(screen.getByLabelText(/Image URLs/i), 'http://new.image.com');
    userEvent.type(screen.getByLabelText(/Origin/i), 'New Farm');
    userEvent.click(screen.getByLabelText(/Is Active/i)); // Toggle checkbox

    userEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    await waitFor(() => {
      expect(api.productsAPI.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Potato',
          description: 'New description',
          price: 300,
          category: 'seeds',
          weight: '3kg',
          stock: 30,
          images: ['http://new.image.com'],
          origin: 'New Farm',
          isActive: false, // Because we toggled it
        })
      );
    });
  });

  it('allows editing an existing product', async () => {
    renderWithProviders(<AdminProducts />, authContextValue);

    await waitFor(() => {
      expect(screen.getByText('Test Potato 1')).toBeInTheDocument();
    });

    userEvent.click(screen.getAllByText('Edit')[0]); // Click edit on the first product

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update Product/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Test Potato 1');
    });

    userEvent.clear(screen.getByLabelText(/Price/i));
    userEvent.type(screen.getByLabelText(/Price/i), '120');

    userEvent.click(screen.getByRole('button', { name: /Update Product/i }));

    await waitFor(() => {
      expect(api.productsAPI.updateProduct).toHaveBeenCalledWith(
        {
          id: '1',
          productData: expect.objectContaining({
            name: 'Test Potato 1',
            price: 120,
          }),
        }
      );
    });
  });

  it('allows deleting a product', async () => {
    renderWithProviders(<AdminProducts />, authContextValue);

    await waitFor(() => {
      expect(screen.getByText('Test Potato 1')).toBeInTheDocument();
    });

    window.confirm = jest.fn(() => true); // Mock window.confirm to return true

    userEvent.click(screen.getAllByText('Delete')[0]); // Click delete on the first product

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product?');
      expect(api.productsAPI.deleteProduct).toHaveBeenCalledWith('1');
    });
  });

  it('displays error message if products fail to load', async () => {
    (api.productsAPI.getProducts as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    renderWithProviders(<AdminProducts />, authContextValue);

    await waitFor(() => {
      expect(screen.getByText(/Error loading products: Failed to fetch/i)).toBeInTheDocument();
    });
  });
});
