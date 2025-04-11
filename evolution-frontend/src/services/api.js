import axios from 'axios';

// Crear una instancia de axios con la configuración predeterminada
const api = axios.create({
  baseURL: 'https://evolution-backend-flhq.onrender.com',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para manejar errores de forma global
api.interceptors.response.use(
  response => response,
  error => {
    console.log('[API] Error en petición:', error.message);
    
    if (error.response) {
      // La solicitud fue hecha y el servidor respondió con un código de estado
      // que cae fuera del rango 2xx
      console.log('[API] Estado del error:', error.response.status);
      console.log('[API] Datos del error:', error.response.data);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.log('[API] No se recibió respuesta:', error.request);
    } else {
      // Ocurrió un error al configurar la solicitud
      console.log('[API] Error de configuración:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Interceptor para añadir token a los headers si está disponible
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api; 