import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { AlertCircle, Edit, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// A basic type for the order, can be expanded
interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  totalAmount: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Changed from status to orderStatus
  createdAt: string;
}

const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order['orderStatus']>('pending'); // Changed from status to orderStatus

  const { data: orders, isLoading, isError, error } = useQuery<Order[], Error>({
    queryKey: ['adminAllOrders'],
    queryFn: ordersAPI.adminGetAllOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ordersAPI.adminUpdateOrderStatus,
    onMutate: async (newData: { orderId: string; status: Order['orderStatus'] }) => {
      await queryClient.cancelQueries({ queryKey: ['adminAllOrders'] });
      const previousOrders = queryClient.getQueryData(['adminAllOrders']);
      queryClient.setQueryData(['adminAllOrders'], (oldData: Order[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(order =>
          order._id === newData.orderId ? { ...order, orderStatus: newData.status } : order
        );
      });
      return { previousOrders };
    },
    onError: (err, newData, context) => {
      const errorMessage = (err as any).response?.data?.message || 'Failed to update order status.';
      toast.error(errorMessage);
      if (context?.previousOrders) {
        queryClient.setQueryData(['adminAllOrders'], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllOrders'] });
      setIsModalOpen(false);
      setSelectedOrder(null);
    },
  });

  const getStatusColor = (status: Order['orderStatus']) => { // Changed from status to orderStatus
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus); // Changed from order.status to order.orderStatus
    setIsModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      updateStatusMutation.mutate({ orderId: selectedOrder._id, status: newStatus });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const validStatuses: Order['orderStatus'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']; // Changed from status to orderStatus

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Orders</h1>

      {isError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error?.message || 'Failed to fetch orders.'}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap font-mono text-xs">{order._id}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {order.user ? (
                      <>
                        <p className="text-gray-900 whitespace-no-wrap">{order.user.name}</p>
                        <p className="text-gray-600 whitespace-no-wrap text-xs">{order.user.email}</p>
                      </>
                    ) : (
                      <p className="text-gray-500 whitespace-no-wrap">User not available</p>
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap font-semibold">
                      ₦{order.totalAmount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      <span className="relative">{order.orderStatus}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <button
                      onClick={() => handleEditClick(order)}
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-1"
                      aria-label={`Edit order ${order._id}`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Update Order Status</h2>
            <p className="mb-4">Order ID: <span className="font-mono text-sm bg-gray-100 p-1 rounded">{selectedOrder._id}</span></p>
            <div className="mb-4">
              <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                New Status:
              </label>
              <select
                id="status-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Order['orderStatus'])}
                disabled={updateStatusMutation.isLoading}
              >
                {validStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                disabled={updateStatusMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                disabled={updateStatusMutation.isLoading}
              >
                {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
