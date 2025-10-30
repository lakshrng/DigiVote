import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireVerification = true, requireStudentProfile = false }) => {
  const { isAuthenticated, isVerified, hasStudentProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to email verification if verification required but not verified
  if (requireVerification && !isVerified()) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Redirect to create profile if student profile required but not exists
  if (requireStudentProfile && !hasStudentProfile()) {
    return <Navigate to="/create-profile" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
