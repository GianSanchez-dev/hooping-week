import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CalendarPage from '../pages/bookings/CalendarPage';
import MyBookingsPage from '../pages/bookings/MyBookingsPage';
import TeamsPage from '../pages/dashboard/TeamsPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminVenuesPage from '../pages/admin/AdminVenuesPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* ZONA AUTENTICACIÓN */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/auth/login" />} />
      </Route>

      {/* APLICACIÓN PRINCIPAL (MainLayout envuelve todo) */}
      <Route path="/" element={<MainLayout />}>
        
        {/* --- RUTAS PÚBLICAS (Cualquiera puede verlas) --- */}
        <Route index element={<Navigate to="/calendar" />} />
        <Route path="calendar" element={<CalendarPage />} /> {/* ¡Liberada! */}

        {/* --- RUTAS PROTEGIDAS (Solo usuarios logueados) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="my-teams" element={<TeamsPage />} />

          {/* ZONA ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin_cancha', 'super_admin']} />}>
            <Route path="admin/bookings" element={<AdminBookingsPage />} />
            <Route path="admin/venues" element={<AdminVenuesPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};
