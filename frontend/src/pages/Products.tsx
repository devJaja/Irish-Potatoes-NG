import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const Products: React.FC = () => {
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsAPI.getProducts(filters)
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (error) return <div className="text-center py-8">Error loading products</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="border rounded px-4 py-2 flex-1 min-w-64"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          className="border rounded px-4 py-2"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="fresh">Fresh</option>
          <option value="processed">Processed</option>
          <option value="seeds">Seeds</option>
        </select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                  className={`px-4 py-2 rounded ${
                    filters.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
