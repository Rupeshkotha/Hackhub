import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  // You can add roles or other conditions here if needed
  // allowedRoles?: string[];
  children?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // While authentication state is loading, you could render a spinner or loading screen
  if (loading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // If user is not authenticated, redirect to login page
  if (!currentUser) {
    // Use Navigate component for redirection within JSX
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the children (if passed directly) or the Outlet (for nested routes)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 