import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000); // Hide message after 2 seconds
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">🥔</span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-primary-600 font-bold">₦{product.price.toLocaleString()}</span>
          <span className="text-sm text-gray-500">{product.weight}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      {showSuccessMessage && (
        <div className="absolute bottom-0 left-0 w-full bg-green-500 text-white text-center py-2 text-sm animate-fade-in-up">
          Added to cart!
        </div>
      )}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
