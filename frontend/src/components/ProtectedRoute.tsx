import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  // Add any specific roles or conditions if needed later
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    // This case should ideally not happen if AuthProvider wraps everything correctly
    console.error("AuthContext not found! Is AuthProvider missing?");
    return <Navigate to="/login" replace />; // Redirect to login if context is somehow missing
  }

  const { isAuthenticated, loading } = authContext;

  if (loading) {
    return <div>Loading authentication...</div>; // Or a proper loading spinner/component
  }

  if (!isAuthenticated) {
    toast.error('You need to be logged in to access this page.');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render the child routes
};

export default ProtectedRoute;
