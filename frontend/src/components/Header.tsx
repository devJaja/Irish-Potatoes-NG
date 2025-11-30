import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
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
        {/* Mobile menu button - TO BE IMPLEMENTED */}
        <div className="md:hidden">
          <button className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;