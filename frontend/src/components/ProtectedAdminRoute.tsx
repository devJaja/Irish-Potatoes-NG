import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedAdminRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>; // Or a spinner component
  }

  if (!user || user.role !== 'admin') {
    // Redirect to login if not authenticated, or home/unauthorized page if not admin
    return <Navigate to="/login" replace />; // Or to="/" or "/unauthorized"
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
