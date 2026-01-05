import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../services/api';
import { Package, ShoppingBag, Users, TrendingUp, DollarSign, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecentOrder {
  _id: string;
  user: {
    name: string;
  };
  totalAmount: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  recentOrders: RecentOrder[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery<AdminStats, Error>({
    queryKey: ['adminStats'],
    queryFn: () => ordersAPI.getAdminStats().then(res => res.data),
    onError: (err) => {
      toast.error(`Failed to load dashboard data: ${err.message}`);
    }
  });

  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="ml-4 text-lg text-gray-700">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Error Loading Dashboard</h2>
          <p className="text-gray-600 mt-2">Could not retrieve dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">₦{stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-emerald-100 text-sm">Total Revenue</p>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalOrders}</h3>
            <p className="text-blue-100 text-sm">Total Orders</p>
          </div>

          {/* Total Products */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalProducts}</h3>
            <p className="text-purple-100 text-sm">Total Products</p>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.pendingOrders}</h3>
            <p className="text-orange-100 text-sm">Pending Orders</p>
          </div>
        </div>

        {/* Main Action Cards and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Action Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manage Products Card */}
              <button 
                onClick={() => handleNavigation('/admin/products')}
                className="block group text-left w-full"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-indigo-500">
                  <div className="bg-indigo-100 rounded-lg p-4 w-fit mb-4 group-hover:bg-indigo-500 transition-colors duration-300">
                    <Package className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Manage Products</h3>
                  <p className="text-slate-600 mb-4">Add, edit, or delete products from your inventory.</p>
                  <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Go to Products</span>
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </button>

              {/* Manage Orders Card */}
              <button 
                onClick={() => handleNavigation('/admin/orders')}
                className="block group text-left w-full"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500">
                  <div className="bg-green-100 rounded-lg p-4 w-fit mb-4 group-hover:bg-green-500 transition-colors duration-300">
                    <ShoppingBag className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Manage Orders</h3>
                  <p className="text-slate-600 mb-4">View and update customer orders and shipments.</p>
                  <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Go to Orders</span>
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </button>

              {/* Manage Users Card */}
              <div className="block cursor-not-allowed group">
                <div className="bg-white rounded-xl shadow-md p-8 border-2 border-dashed border-slate-300 opacity-60">
                  <div className="bg-slate-100 rounded-lg p-4 w-fit mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-500 mb-2">Manage Users</h3>
                  <p className="text-slate-400 mb-4">User management features coming soon.</p>
                  <div className="flex items-center text-slate-400 font-semibold">
                    <span>Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Orders</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-slate-800">#{order._id.substring(0, 7)}</p>
                        <p className="text-sm text-slate-500">{order.user?.name || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">₦{order.totalAmount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No recent orders found.</p>
                )}
              </div>
              <button 
                onClick={() => handleNavigation('/admin/orders')}
                className="block w-full mt-6 text-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                View All Orders →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;