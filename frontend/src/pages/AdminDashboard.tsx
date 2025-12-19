import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Products Card */}
        <Link to="/admin/products" className="block">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center justify-center text-center h-48">
            <Package className="w-12 h-12 text-indigo-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Manage Products</h2>
            <p className="text-gray-600">Add, edit, or delete products.</p>
          </div>
        </Link>

        {/* Manage Orders Card */}
        <Link to="/admin/orders" className="block">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center justify-center text-center h-48">
            <ShoppingBag className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Manage Orders</h2>
            <p className="text-gray-600">View and update customer orders.</p>
          </div>
        </Link>

        {/* Manage Users Card (Placeholder for future) */}
        <div className="block cursor-not-allowed opacity-70">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center h-48">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-500 mb-2">Manage Users</h2>
            <p className="text-gray-400">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
