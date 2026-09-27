import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-devops-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-devops-bg flex items-center justify-center p-4">
        <div className="bg-devops-card border border-devops-border rounded-xl p-8 max-w-md text-center space-y-3">
          <h2 className="text-lg font-bold text-rose-400">Access Restricted (403)</h2>
          <p className="text-xs text-slate-400">
            This section requires one of the following roles: [{allowedRoles.join(', ')}]. Your current role is [{role}].
          </p>
        </div>
      </div>
    );
  }

  return children;
}
