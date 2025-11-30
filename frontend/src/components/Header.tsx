import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Import icons

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-primary-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-earth-100">
          Irish Potatoes NG
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-primary-200">Home</Link>
          <Link to="/products" className="hover:text-primary-200">Products</Link>
          <Link to="/gallery" className="hover:text-primary-200">Gallery</Link>
          <Link to="/cart" className="hover:text-primary-200">Cart</Link>
          <Link to="/login" className="hover:text-primary-200">Login</Link>
          <Link to="/register" className="hover:text-primary-200">Register</Link>
          <Link to="/account" className="hover:text-primary-200">Account</Link>
        </nav>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-primary-700 flex flex-col items-center justify-center space-y-6 z-50">
          <button onClick={toggleMobileMenu} className="absolute top-4 right-4 text-white focus:outline-none">
            <X className="w-8 h-8" />
          </button>
          <Link to="/" className="text-3xl font-bold text-white hover:text-primary-200" onClick={toggleMobileMenu}>Home</Link>
          <Link to="/products" className="text-3xl font-bold text-white hover:text-primary-200" onClick={toggleMobileMenu}>Products</Link>
          <Link to="/gallery" className="text-3xl font-bold text-white hover:text-primary-200" onClick={toggleMobileMenu}>Gallery</Link>
          <Link to="/cart" className="text-3xl font-bold text-white hover:text-primary-200" onClick={toggleMobileMenu}>Cart</Link>
          <Link to="/login" className="text-3xl font-bold text-white hover:text-primary-200" onClick={toggleMobileMenu}>Login</Link>
          <Link to="/register" className="text-3xl font-bold text-white hover:text-primary-200" onClick={toggleMobileMenu}>Register</Link>
          <Link to="/account" className="text-3xl font-bold text-white hover:text-primary-200" onClick={toggleMobileMenu}>Account</Link>
        </div>
      )}
    </header>
  );
};

export default Header;