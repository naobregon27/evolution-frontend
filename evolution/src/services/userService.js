import axios from 'axios';
import store from '../store';

// Configuración base de axios
const API_URL = 'https://evolution-backend-flhq.onrender.com';

// Función para obtener el token de autenticación actual
const getAuthToken = () => {
  // Primero intentar obtener el token desde el store de Redux
  const state = store.getState();
  let token = state.auth?.token;
  
  // Si no está en Redux, intentar obtenerlo desde localStorage
  if (!token) {
    token = localStorage.getItem('token');
  }
  
  return token;
};

// Función para crear configuración con token
const getAuthConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para añadir el token de autenticación a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token añadido a la petición:', token.substring(0, 15) + '...');
    } else {
      console.warn('No se encontró token para la petición');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Error 401 (No autorizado) - probablemente la sesión expiró
    if (error.response && error.response.status === 401) {
      console.log('Sesión expirada o usuario no autenticado. Redirigiendo a login...');
      // Despachar acción para cerrar sesión
      store.dispatch({ type: 'auth/logout' });
      // Limpiar token en localStorage por si acaso
      localStorage.removeItem('token');
      // Redirigir al login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Función para obtener todos los usuarios
export const getAllUsers = async (params = {}) => {
  try {
    const config = getAuthConfig();
    
    // Asegurarse de que por defecto busque todos los usuarios (sin paginación)
    const defaultParams = {
      limit: 100, // Un límite alto para obtener todos los usuarios
      page: 1,
      ...params
    };
    
    // Construir los query params
    const queryParams = new URLSearchParams();
    Object.entries(defaultParams).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    console.log(`Obteniendo usuarios con parámetros: ${queryParams.toString()}`);
    
    const response = await api.get(`/api/admin/users?${queryParams.toString()}`, config);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    
    // Devolver un formato de respuesta consistente incluso en error
    return {
      success: false,
      error: error.message || 'Error al obtener usuarios',
      data: {
        users: []
      }
    };
  }
};

// Función para obtener un usuario por ID
export const getUserById = async (userId) => {
  try {
    const config = getAuthConfig();
    const response = await api.get(`/api/admin/users/${userId}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${userId}:`, error);
    throw error;
  }
};

// Función para crear un nuevo usuario
export const createUser = async (userData) => {
  try {
    const config = getAuthConfig();
    const response = await api.post('/api/admin/users', userData, config);
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Función para actualizar un usuario existente
export const updateUser = async (userId, userData) => {
  try {
    const config = getAuthConfig();
    const response = await api.put(`/api/admin/users/${userId}`, userData, config);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${userId}:`, error);
    throw error;
  }
};

// Función para eliminar un usuario
export const deleteUser = async (userId) => {
  try {
    const config = getAuthConfig();
    const response = await api.delete(`/api/admin/users/${userId}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${userId}:`, error);
    throw error;
  }
};

// Función para cambiar el estado (activo/inactivo) de un usuario
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const config = getAuthConfig();
    console.log(`Cambiando estado de usuario ${userId} a ${isActive ? 'activo' : 'inactivo'}`);
    
    const response = await api.patch(
      `/api/admin/users/${userId}/status`, 
      { activo: isActive }, 
      config
    );
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado del usuario con ID ${userId}:`, error);
    throw error;
  }
};

// Función para cambiar la contraseña de un usuario
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const config = getAuthConfig();
    const response = await api.post(
      `/api/auth/change-password`, 
      {
        userId,
        oldPassword,
        newPassword
      }, 
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    throw error;
  }
};

// Función para obtener los locales
export const getLocales = async () => {
  try {
    const config = getAuthConfig();
    const response = await api.get('/api/admin/locales', config);
    return response.data;
  } catch (error) {
    console.error('Error al obtener locales:', error);
    throw error;
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changePassword,
  getLocales
}; 