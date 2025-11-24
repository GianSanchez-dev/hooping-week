import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Cargar sesión al iniciar (Persistencia simple)
  useEffect(() => {
    const storedUser = localStorage.getItem('user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // 2. Función de Login
  const login = async (email, password) => {
    try {
      // Llama al backend real
      const userData = await authService.login(email, password);
      
      // Guardamos el usuario en estado y localStorage
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user_session', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 3. Función de Registro (CONECTADA)
  const register = async (data) => {
    try {
      // Llama al backend real (/api/auth/register)
      const userData = await authService.register(data);
      
      // Opcional: Autologin después del registro
      // setUser(userData);
      // setIsAuthenticated(true);
      // localStorage.setItem('user_session', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error("Error en registro:", error);
      return { success: false, message: error.message };
    }
  };

  // 4. Cerrar Sesión
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
