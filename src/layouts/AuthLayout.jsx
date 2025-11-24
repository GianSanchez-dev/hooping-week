import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  // El layout ahora es un contenedor transparente. 
  // Dejamos que LoginPage y RegisterPage controlen su propio diseño de pantalla completa.
  return (
    <div className="w-full h-full">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
