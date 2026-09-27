import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/protected/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetails from './pages/ApplicationDetails';
import Deployments from './pages/Deployments';
import DeploymentDetails from './pages/DeploymentDetails';
import Pipelines from './pages/Pipelines';
import Logs from './pages/Logs';
import Infrastructure from './pages/Infrastructure';
import Monitoring from './pages/Monitoring';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Platform Console Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/deployments" element={<Deployments />} />
            <Route path="/deployments/:id" element={<DeploymentDetails />} />
            <Route path="/pipelines" element={<Pipelines />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback & Root Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
