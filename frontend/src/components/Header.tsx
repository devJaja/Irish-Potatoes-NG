import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut, User as UserIcon, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { totalUniqueItems } = useCart();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
    toggleMobileMenu();
  };

  return (
    <header className="bg-white text-gray-800 p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-700">
          <img src="/logo.png" alt="Plateau Potatoes NG Logo" className="h-8" />
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-green-600 transition-colors duration-200">Home</Link>
          <Link to="/products" className="hover:text-green-600 transition-colors duration-200">Products</Link>
          <Link to="/gallery" className="hover:text-green-600 transition-colors duration-200">Gallery</Link>
          
          <Link to="/cart" className="relative hover:text-green-600 transition-colors duration-200">
            <ShoppingCart className="w-6 h-6" />
            {totalUniqueItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalUniqueItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/account" className="flex items-center hover:text-green-600 transition-colors duration-200">
                <UserIcon className="w-5 h-5 mr-1" /> Account
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/products" className="flex items-center hover:text-green-600 transition-colors duration-200">
                    <Edit className="w-5 h-5 mr-1" /> Admin Dashboard
                  </Link>
                  <Link to="/admin/products" className="flex items-center hover:text-green-600 transition-colors duration-200">
                    <Edit className="w-5 h-5 mr-1" /> Admin Products
                  </Link>
                  <Link to="/admin/orders" className="flex items-center hover:text-green-600 transition-colors duration-200">
                    <Edit className="w-5 h-5 mr-1" /> Admin Orders
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-100 px-3 py-1 rounded"
              >
                <LogOut className="w-5 h-5 mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-600 transition-colors duration-200">Login</Link>
              <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200">Register</Link>
            </>
          )}
        </nav>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-gray-800 focus:outline-none">
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-95 flex flex-col items-center justify-center space-y-8 z-50 animate-fade-in-down">
          <button onClick={toggleMobileMenu} className="absolute top-4 right-4 text-white focus:outline-none">
            <X className="w-8 h-8" />
          </button>
          <Link to="/" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200" onClick={toggleMobileMenu}>Home</Link>
          <Link to="/products" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200" onClick={toggleMobileMenu}>Products</Link>
          <Link to="/gallery" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200" onClick={toggleMobileMenu}>Gallery</Link>
          
          <Link to="/cart" className="relative text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200" onClick={toggleMobileMenu}>
            <ShoppingCart className="inline-block w-8 h-8 mr-2" /> Cart
            {totalUniqueItems > 0 && (
              <span className="absolute -top-2 right-0 bg-red-500 text-white text-base rounded-full h-7 w-7 flex items-center justify-center">
                {totalUniqueItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/account" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200 flex items-center" onClick={toggleMobileMenu}>
                <UserIcon className="w-8 h-8 mr-2" /> Account
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/products" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200 flex items-center" onClick={toggleMobileMenu}>
                    <Edit className="w-8 h-8 mr-2" /> Admin Dashboard
                  </Link>
                  <Link to="/admin/products" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200 flex items-center" onClick={toggleMobileMenu}>
                    <Edit className="w-8 h-8 mr-2" /> Admin Products
                  </Link>
                  <Link to="/admin/orders" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200 flex items-center" onClick={toggleMobileMenu}>
                    <Edit className="w-8 h-8 mr-2" /> Admin Orders
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="text-4xl font-bold text-red-400 hover:text-red-500 transition-colors duration-200 flex items-center"
              >
                <LogOut className="w-8 h-8 mr-2" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-4xl font-bold text-white hover:text-green-400 transition-colors duration-200" onClick={toggleMobileMenu}>Login</Link>
              <Link to="/register" className="text-4xl font-bold bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors duration-200" onClick={toggleMobileMenu}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;