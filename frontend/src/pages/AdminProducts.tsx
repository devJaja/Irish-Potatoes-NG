import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../services/api';
import { Product } from '../types';

const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => productsAPI.getProducts({}),
  });

  // Add Product Mutation
  const addProductMutation = useMutation({
    mutationFn: productsAPI.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      alert('Product added successfully!');
    },
    onError: (err) => {
      console.error('Error adding product:', err);
      alert('Failed to add product.');
    },
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: Product }) =>
      productsAPI.updateProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setSelectedProduct(null);
      alert('Product updated successfully!');
    },
    onError: (err) => {
      console.error('Error updating product:', err);
      alert('Failed to update product.');
    },
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: productsAPI.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      alert('Product deleted successfully!');
    },
    onError: (err) => {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as 'fresh' | 'processed' | 'seeds',
      weight: formData.get('weight') as string,
      stock: parseInt(formData.get('stock') as string),
      images: (formData.get('images') as string).split(',').map((s) => s.trim()),
      origin: formData.get('origin') as string,
      isActive: formData.get('isActive') === 'true',
    };

    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct._id, productData: productData as Product });
    } else {
      addProductMutation.mutate(productData as Product);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading products...</div>;
  if (error) return <div className="text-center py-8">Error loading products: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Product Management</h1>
      
      {/* Product List */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Existing Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Stock</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsData?.products.map((product: Product) => (
                <tr key={product._id}>
                  <td className="py-2 px-4 border-b">{product.name}</td>
                  <td className="py-2 px-4 border-b">{product.category}</td>
                  <td className="py-2 px-4 border-b">₦{product.price.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{product.stock}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={selectedProduct?.name || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={selectedProduct?.description || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price (₦)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              defaultValue={selectedProduct?.price || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={selectedProduct?.category || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Category</option>
              <option value="fresh">Fresh</option>
              <option value="processed">Processed</option>
              <option value="seeds">Seeds</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight">
              Weight (e.g., 50kg)
            </label>
            <input
              type="text"
              id="weight"
              name="weight"
              defaultValue={selectedProduct?.weight || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              defaultValue={selectedProduct?.stock || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
              Image URLs (comma-separated)
            </label>
            <input
              type="text"
              id="images"
              name="images"
              defaultValue={selectedProduct?.images.join(', ') || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="origin">
              Origin
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              defaultValue={selectedProduct?.origin || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={selectedProduct?.isActive !== false} // Default to true if not explicitly false
              className="mr-2 leading-tight"
            />
            <label className="text-gray-700 text-sm font-bold" htmlFor="isActive">
              Is Active
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline"
              disabled={addProductMutation.isLoading || updateProductMutation.isLoading}
            >
              {selectedProduct ? 'Update Product' : 'Add Product'}
            </button>
            {selectedProduct && (
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 focus:outline-none focus:shadow-outline"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;
