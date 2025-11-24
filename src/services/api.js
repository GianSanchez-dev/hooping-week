import axios from 'axios';

// Creamos una instancia de Axios con la configuración base
const api = axios.create({
  // Asegúrate de que este puerto coincida con el de tu backend (server.js)
  baseURL: 'https://hooping-week-backend.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTORES (Opcional pero recomendado) ---
// Esto nos servirá más adelante para inyectar el Token de autenticación automáticamente
api.interceptors.request.use(
  (config) => {
    // Por ahora lo dejamos pasar directo.
    // En el futuro aquí haremos: 
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
