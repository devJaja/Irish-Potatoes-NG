import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-white mb-4">Plateau Potatoes NG</h3>
            <p className="text-sm">
              Your trusted source for premium Plateau potatoes, delivered fresh to your doorstep.
              Quality and freshness guaranteed for homes and businesses across Nigeria.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors duration-200">Products</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors duration-200">Gallery</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors duration-200">My Account</Link></li>
              {/* Add other links like About Us, Contact Us, Privacy Policy if they exist */}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Connect With Us</h3>
            <p className="text-sm mb-4">Email: info@plateaupotatoesng.com</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                <Facebook size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                <Twitter size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                <Instagram size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {currentYear} Plateau Potatoes NG. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
