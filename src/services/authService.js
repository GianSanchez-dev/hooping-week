import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al iniciar sesión");
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        avatar: userData.avatar // <--- AÑADIDO
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al registrar usuario");
    }
  }
};
