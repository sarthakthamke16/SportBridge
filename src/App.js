import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AthletePortal from './pages/AthletePortal';
import ClubManagerPortal from './pages/ClubManagerPortal';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('sb_token');
  const role = localStorage.getItem('sb_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return role === 'manager' || role === 'owner' ? (
      <Navigate to="/manager" replace />
    ) : (
      <Navigate to="/athlete" replace />
    );
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Athlete Portal */}
        <Route
          path="/athlete/*"
          element={
            <ProtectedRoute allowedRoles={['athlete']}>
              <AthletePortal />
            </ProtectedRoute>
          }
        />

        {/* Club Manager Portal */}
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute allowedRoles={['manager', 'owner']}>
              <ClubManagerPortal />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
