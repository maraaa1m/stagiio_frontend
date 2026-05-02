import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'COMPANY' | 'ADMIN')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role') as 'STUDENT' | 'COMPANY' | 'ADMIN' | null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // If user is logged in but role not allowed, redirect to their respective dashboard
    const redirectPath = userRole === 'STUDENT' ? '/student/dashboard' 
                       : userRole === 'COMPANY' ? '/company/dashboard' 
                       : '/admin/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
