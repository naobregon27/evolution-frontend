import api from './api';

// Función para obtener configuración con token actual
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
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
      const response = await api.post('/api/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar la contraseña' };
    }
  }
}; 