// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

interface ProtectedRouteProps {
  user: any;
  children: React.ReactNode;
}

const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Not signed in with Firebase → Redirect to "/"
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user) {
    // Signed in with Firebase, but not authenticated with backend
    return <>{/* You can also redirect or show fallback here */}<Login /></>;
  }

  // Fully authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
