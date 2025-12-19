import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import UserAccount from './pages/UserAccount';
import Login from './pages/Login';
import Register from './pages/Register';
import GalleryPage from './pages/GalleryPage'; // Import the new GalleryPage
import ForgotPassword from './pages/ForgotPassword';
import SendOTP from './pages/SendOTP';
import ResetPassword from './pages/ResetPassword';
import AdminProducts from './pages/AdminProducts'; // Import the AdminProducts page
import AdminOrders from './pages/AdminOrders'; // Import the AdminOrders page
import AdminDashboard from './pages/AdminDashboard'; // Import the AdminDashboard page
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ProtectedAdminRoute from './components/ProtectedAdminRoute'; // Import ProtectedAdminRoute
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import Footer from './components/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Header />
            <Toaster />
            <main className="container mx-auto p-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/send-otp" element={<SendOTP />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/gallery" element={<GalleryPage />} /> {/* Add the new Gallery route */}

                {/* Protected Routes for registered members */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                  <Route path="/account" element={<UserAccount />} />
                </Route>
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedAdminRoute />}>
                  <Route index element={<AdminDashboard />} /> {/* Admin Dashboard as the index route */}
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;