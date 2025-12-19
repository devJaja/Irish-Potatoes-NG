import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, uploadAPI } from '../services/api';
import { Product } from '../types';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // When a product is selected for editing, populate the form and existing images
  useEffect(() => {
    if (selectedProduct) {
      setExistingImages(selectedProduct.images || []);
      setSelectedFiles([]); // Clear any selected files from previous state
    } else {
      // Reset all form-related state when deselecting
      setExistingImages([]);
      setSelectedFiles([]);
    }
  }, [selectedProduct]);

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
      toast.success('Product added successfully!');
      resetForm();
    },
    onError: (err: any) => {
      console.error('Error adding product:', err);
      toast.error(err.response?.data?.message || 'Failed to add product.');
    },
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: Partial<Product> }) =>
      productsAPI.updateProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product updated successfully!');
      resetForm();
    },
    onError: (err: any) => {
      console.error('Error updating product:', err);
      toast.error(err.response?.data?.message || 'Failed to update product.');
    },
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: productsAPI.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product deleted successfully!');
    },
    onError: (err: any) => {
      console.error('Error deleting product:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    },
  });

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedFiles([]);
    setExistingImages([]);
    // This will implicitly clear the form fields because of the `key` prop on the form
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let uploadedImageUrls: string[] = [];

    // 1. Handle file uploads first
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      try {
        const response = await uploadAPI.uploadProductImages(formData);
        uploadedImageUrls = response.data.imageUrls;
        toast.success('Images uploaded successfully!');
      } catch (uploadError: any) {
        console.error('Image upload failed:', uploadError);
        toast.error(uploadError.response?.data?.message || 'Image upload failed.');
        setIsUploading(false);
        return; // Stop form submission if upload fails
      } finally {
        setIsUploading(false);
      }
    }

    const form = e.currentTarget;
    const formElements = new FormData(form);

    // 2. Construct product data with uploaded image URLs
    const productData: Partial<Product> = {
      name: formElements.get('name') as string,
      description: formElements.get('description') as string,
      price: parseFloat(formElements.get('price') as string),
      category: formElements.get('category') as 'fresh' | 'processed' | 'seeds',
      weight: formElements.get('weight') as string,
      stock: parseInt(formElements.get('stock') as string) || 0,
      images: [...existingImages, ...uploadedImageUrls], // Combine existing and new images
      origin: formElements.get('origin') as string,
      isActive: (form.elements.namedItem('isActive') as HTMLInputElement)?.checked || false,
    };

    // 3. Submit product data to the backend
    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct._id, productData });
    } else {
      addProductMutation.mutate(productData as Product);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + existingImages.length > 5) {
        toast.error('You can upload a maximum of 5 images in total.');
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };
  
  if (isLoading) return <div className="text-center py-8">Loading products...</div>;
  if (error) return <div className="text-center py-8">Error loading products: {(error as Error).message}</div>;

  const isSubmitting = addProductMutation.isPending || updateProductMutation.isPending || isUploading;

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
        <form key={selectedProduct?._id || 'new'} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Product Name */}
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

          {/* Category */}
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

          {/* Description */}
          <div className="md:col-span-2">
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

          {/* Price */}
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
          
          {/* Stock */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              defaultValue={selectedProduct?.stock || 0}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Weight */}
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

          {/* Origin */}
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

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Product Images</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload files</span>
                    <input id="file-upload" name="images" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileSelect} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          
          {/* Image Previews */}
          {(existingImages.length > 0 || selectedFiles.length > 0) && (
            <div className="md:col-span-2">
              <p className="block text-gray-700 text-sm font-bold mb-2">Image Previews</p>
              <div className="flex flex-wrap gap-4">
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img src={url} alt="Existing product" className="h-24 w-24 object-cover rounded-md" />
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {/* New Selected Files */}
                {selectedFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img src={URL.createObjectURL(file)} alt="New product" className="h-24 w-24 object-cover rounded-md" />
                    <button type="button" onClick={() => removeSelectedFile(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Is Active */}
          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={selectedProduct ? selectedProduct.isActive : true}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="text-gray-700 text-sm font-bold" htmlFor="isActive">
              Product is Active
            </label>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            {selectedProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 focus:outline-none focus:shadow-outline"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:shadow-outline flex items-center disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading...' : (selectedProduct ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;
