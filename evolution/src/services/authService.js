import api from './api';
import store from '../store';
import axios from 'axios';

// Función para obtener configuración con token actual
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

// Función para obtener el ID del usuario actual
const getCurrentUserId = () => {
  // Primero intentar obtener desde Redux
  const state = store.getState();
  if (state?.auth?.user?._id) {
    return state.auth.user._id;
  }
  
  // Si no está en Redux, intentar obtenerlo del localStorage
  try {
    const currentUserStr = localStorage.getItem('user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      return currentUser?._id || currentUser?.id;
    }
  } catch (e) {
    console.error('Error al parsear usuario del localStorage:', e);
  }
  
  return null;
};

export const authService = {
  async login(credentials) {
    try {
      // Realizar la petición de login
      const response = await api.post('/api/users/login', credentials);
      
      // Verificar y mostrar información detallada sobre la respuesta
      if (response.data) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('Token guardado correctamente');
        } else {
          console.warn('No se encontró token en la respuesta del servidor');
        }
        
        // Verificar si tenemos la información del usuario y su rol
        if (response.data.user) {
          console.log('Información del usuario recibida:', {
            id: response.data.user._id,
            email: response.data.user.email,
            role: response.data.user.role
          });
        } else {
          console.warn('No se encontró información del usuario en la respuesta');
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error durante el login:', error.response?.status || error.message);
      console.error('Detalles del error:', error.response?.data);
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/api/users/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrarse' };
    }
  },

  async logout() {
    try {
      await api.post('/api/users/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener información del usuario' };
    }
  },
  
  async changePassword(passwordData) {
    try {
      // Usar el endpoint correcto según lo indicado por el cliente
      console.log('Enviando solicitud para cambiar contraseña...');
      
      // El endpoint correcto es /api/users/change-password con método PUT
      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      };
      
      // Obtener configuración con el token del usuario logueado
      const config = getAuthConfig();
      console.log('Token incluido en la petición:', config.headers.Authorization ? 'Sí' : 'No');
      
      // URL deployada del backend
      const deployedUrl = 'https://evolution-backend-flhq.onrender.com/api/users/change-password';
      
      console.log(`Intentando con URL: ${deployedUrl} usando método PUT`);
      
      // Usar método PUT en lugar de POST
      const response = await axios.put(deployedUrl, payload, config);
      
      console.log('¡Respuesta exitosa!');
      console.log('Respuesta del servidor:', {
        status: response.status,
        success: !!response.data?.success,
        message: response.data?.message || 'No message provided'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error.response?.status || error.message);
      console.error('Detalles del error:', error.response?.data);
      throw error.response?.data || { message: 'Error al cambiar la contraseña' };
    }
  }
}; 