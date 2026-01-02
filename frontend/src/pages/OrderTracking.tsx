import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../services/api';
import { AlertCircle, Package, MapPin, Calendar, CreditCard, User, Box, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    phone: string;
  };
  totalAmount: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order, Error>({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getOrder(id!).then(res => res.data),
    enabled: !!id, // Only run the query if id is available
    onError: (err) => {
      toast.error(`Failed to load order: ${err.message}`);
    }
  });

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">No Order ID Provided</h2>
          <p className="text-gray-600 mt-2">Please navigate from your order history or provide a valid order ID.</p>
          <Link to="/account" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Go to Account</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="ml-4 text-lg text-gray-700">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Error Loading Order</h2>
          <p className="text-gray-600 mt-2">Could not retrieve order details. Please try again later.</p>
          <Link to="/account" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Go to Account</Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Order Details <span className="text-xl font-normal ml-3">#{order._id.substring(0, 10)}...</span>
          </h1>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center"><User className="w-5 h-5 mr-2" /> Customer Info</h3>
            <p className="text-gray-700"><strong>Name:</strong> {order.user.name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {order.user.email}</p>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center"><Calendar className="w-5 h-5 mr-2" /> Order Dates</h3>
            <p className="text-gray-700"><strong>Ordered On:</strong> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
            <p className="text-gray-700"><strong>Last Update:</strong> {new Date(order.updatedAt).toLocaleDateString()} at {new Date(order.updatedAt).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-8 bg-purple-50 p-5 rounded-lg border border-purple-200">
          <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center"><MapPin className="w-5 h-5 mr-2" /> Shipping Address</h3>
          <p className="text-gray-700">{order.shippingAddress.street}</p>
          <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
          <p className="text-gray-700">Phone: {order.shippingAddress.phone}</p>
        </div>

        {/* Order Items */}
        <div className="mb-8 bg-yellow-50 p-5 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center"><Box className="w-5 h-5 mr-2" /> Order Items</h3>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.product._id} className="flex items-center space-x-4 border-b pb-3 last:border-b-0 last:pb-0">
                <img 
                  src={item.product.images[0] || 'https://via.placeholder.com/60'} 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover rounded-md" 
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.product.name}</p>
                  <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-800">₦{(item.product.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-red-50 p-5 rounded-lg border border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center"><CreditCard className="w-5 h-5 mr-2" /> Payment Info</h3>
          <div className="flex justify-between items-center text-xl font-bold text-gray-800 mb-2">
            <span>Total Amount:</span>
            <span>₦{order.totalAmount.toLocaleString()}</span>
          </div>
          <p className={`text-right text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
            Payment Status: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;