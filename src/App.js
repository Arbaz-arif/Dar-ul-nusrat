import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MemberListPage from './pages/MemberListPage';
import MemberFormPage from './pages/MemberFormPage';
import MemberDetailsPage from './pages/MemberDetailsPage';
import MyProfilePage from './pages/MyProfilePage';

// Styles
import './styles/Global.css';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members"
        element={
          <ProtectedRoute requiredRoles={['Super Admin', 'Ansar Admin', 'Lajna Admin', 'Khuddam Zaeem', 'Khuddam Muntazim', 'Sadar', 'Atfal Admin', 'Bachgan Admin']}>
            <MemberListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members/create"
        element={
          <ProtectedRoute requiredRoles={['Super Admin', 'Ansar Admin', 'Lajna Admin', 'Khuddam Zaeem', 'Sadar', 'Atfal Admin', 'Bachgan Admin']}>
            <MemberFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members/:id"
        element={
          <ProtectedRoute requiredRoles={['Super Admin', 'Ansar Admin', 'Lajna Admin', 'Khuddam Zaeem', 'Khuddam Muntazim', 'Sadar', 'Atfal Admin', 'Bachgan Admin']}>
            <MemberDetailsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/members/:id/edit"
        element={
          <ProtectedRoute requiredRoles={['Super Admin', 'Ansar Admin', 'Lajna Admin', 'Khuddam Zaeem', 'Sadar', 'Atfal Admin', 'Bachgan Admin']}>
            <MemberFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
