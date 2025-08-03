import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated, isAppLoaded } = useSelector((state) => state.auth);

  if (!isAppLoaded) {
    return <div>Loading authentication...</div>; // Or a proper loading spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;