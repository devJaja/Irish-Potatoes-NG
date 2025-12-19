import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminOrders from './AdminOrders';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

describe('AdminOrders Page', () => {
  it('renders the main heading', () => {
    render(
      <Router>
        <AdminOrders />
      </Router>
    );
    expect(screen.getByText(/Manage Orders/i)).toBeInTheDocument();
  });
});
