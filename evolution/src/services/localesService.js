import api from './api';

// Servicio para gestionar operaciones con locales
const localesService = {
  // Obtener todos los locales
  getLocales: async () => {
    try {
      const response = await api.get('/api/locales');
      return response.data;
    } catch (error) {
      console.error('Error al obtener locales:', error);
      throw error;
    }
  },
  
  // Obtener un local por ID
  getLocalById: async (localId) => {
    try {
      const response = await api.get(`/api/locales/${localId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener local con ID ${localId}:`, error);
      throw error;
    }
  },
  
  // Crear un nuevo local
  createLocal: async (localData) => {
    try {
      const response = await api.post('/api/locales', localData);
      return response.data;
    } catch (error) {
      console.error('Error al crear local:', error);
      throw error;
    }
  },
  
  // Actualizar un local existente
  updateLocal: async (localId, localData) => {
    try {
      const response = await api.put(`/api/locales/${localId}`, localData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar local con ID ${localId}:`, error);
      throw error;
    }
  },
  
  // Eliminar un local
  deleteLocal: async (localId) => {
    try {
      const response = await api.delete(`/api/locales/${localId}`);
      return { _id: localId, ...response.data };
    } catch (error) {
      console.error(`Error al eliminar local con ID ${localId}:`, error);
      throw error;
    }
  },
  
  // Cambiar el estado de un local (activo/inactivo)
  changeLocalStatus: async (localId, isActive) => {
    try {
      const response = await api.patch(`/api/locales/${localId}/status`, { activo: isActive });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del local con ID ${localId}:`, error);
      throw error;
    }
  },
  
  // Obtener usuarios asignados a un local
  getLocalUsers: async (localId) => {
    try {
      const response = await api.get(`/api/locales/${localId}/users`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuarios del local con ID ${localId}:`, error);
      throw error;
    }
  },
  
  // Asignar un administrador a un local sin cambiar el rol
  assignAdminToLocal: async (localId, userId) => {
    try {
      console.log(`Enviando petición para asignar usuario ${userId} al local ${localId} sin cambiar rol`);
      
      // Primero, intentamos obtener el usuario actual para conocer su rol
      let userInfo;
      try {
        // Intentar obtener información del usuario
        const userResponse = await api.get(`/api/admin/users/${userId}`);
        userInfo = userResponse.data?.data || userResponse.data;
        console.log('Información del usuario obtenida:', userInfo);
      } catch (userError) {
        console.warn('No se pudo obtener información del usuario, continuando con asignación básica:', userError);
      }
      
      // Construir payload con usuario y rol existente (si está disponible)
      const payload = { 
        userId: userId,
        // Si tenemos info del usuario, especificamos mantener el mismo rol
        mantenerRol: true,
        // Estas propiedades adicionales pueden ayudar al backend a entender que no queremos cambiar el rol
        soloAsignarLocal: true,
        preservarRol: userInfo?.role || userInfo?.data?.role
      };
      
      console.log('Payload enviado para asignación:', payload);
      
      // Intentar la asignación con el payload mejorado
      const response = await api.post(`/api/locales/${localId}/admin`, payload);
      console.log('Respuesta del servidor de asignación:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error al asignar admin al local con ID ${localId}:`, error);
      console.error('Detalles del error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Desasignar un usuario de un local
  unassignUserFromLocal: async (localId, userId) => {
    try {
      const response = await api.post(`/api/locales/${localId}/unassign`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Error al desasignar usuario del local con ID ${localId}:`, error);
      throw error;
    }
  }
};

export default localesService; 