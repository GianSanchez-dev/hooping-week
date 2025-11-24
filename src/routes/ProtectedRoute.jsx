import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Puedes poner un Spinner bonito aquí
    return <div className="p-4 text-center">Cargando autorización...</div>;
  }

  // 1. Si no está logueado, patada al Login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // 2. (Opcional) Si pasamos una lista de roles permitidos y el usuario no lo tiene
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Podríamos redirigir a una página de "Acceso Denegado" o al home
    return <Navigate to="/" replace />;
  }

  // Si todo está bien, renderiza la ruta hija
  return <Outlet />;
};

export default ProtectedRoute;
