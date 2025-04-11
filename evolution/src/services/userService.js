import api from './api';
import axios from 'axios';

// URL del backend
const API_URL = 'https://evolution-backend-flhq.onrender.com';

// Rutas del API - Corregidas según información del backend real
const ENDPOINTS = {
  USERS: '/api/admin/users',
  USERS_ALL: '/api/admin/users?includeInactive=true',
  USER_BY_ID: (id) => `/api/admin/users/${id}`,
  USER_STATUS: (id) => `/api/admin/users/${id}/status`
};

// Obtener configuración con token para axios manual
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

// Obtener todos los usuarios - Simplificado para usar el endpoint correcto
export const getAllUsers = async () => {
  console.log('Iniciando getAllUsers con URL específica /api/admin/users?includeInactive=true');
  
  try {
    // Usar el endpoint que incluye explícitamente usuarios inactivos
    const response = await api.get(ENDPOINTS.USERS_ALL);
    console.log('Respuesta exitosa de getAllUsers:', response);
    
    // IMPORTANTE: Formatear los IDs de los usuarios para que coincidan con los de MongoDB
    if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map(user => {
        // Si el usuario tiene un ID en formato no estándar, intentar extraer el ObjectId
        if (user._id && typeof user._id === 'string' && user._id.length > 24) {
          // Buscar un patrón de ObjectId (24 caracteres hexadecimales)
          const match = user._id.match(/([0-9a-f]{24})/i);
          if (match && match[1]) {
            user._id = match[1];
          }
        }
        
        // Si el ID principal está en 'id' en lugar de '_id', asegurarse de que '_id' también lo tenga
        if (!user._id && user.id) {
          // Extraer un ObjectId si es posible
          if (typeof user.id === 'string') {
            const match = user.id.match(/([0-9a-f]{24})/i);
            if (match && match[1]) {
              user._id = match[1];
            } else {
              user._id = user.id;
            }
          } else {
            user._id = user.id;
          }
        }
        
        // Asegurarse de que el frontend también tenga el ID en ambos formatos
        if (user._id && !user.id) {
          user.id = user._id;
        }
        
        return user;
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error en getAllUsers:', error.message);
    console.error('Código de error:', error.response?.status);
    console.error('Datos de error:', error.response?.data);
    throw error;
  }
};

// Obtener un usuario específico
export const getUserById = async (userId) => {
  try {
    console.log(`getUserById - Intentando obtener usuario: ${userId}`);
    const response = await api.get(ENDPOINTS.USER_BY_ID(userId));
    console.log('getUserById - Respuesta:', response);
    return response;
  } catch (error) {
    console.error(`Error al obtener usuario ${userId}:`, error);
    throw error;
  }
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  try {
    console.log('createUser - Datos a enviar:', userData);
    
    // Asegurarse de que el objeto userData tiene todos los campos necesarios
    const userDataComplete = {
      nombre: userData.nombre || 'Usuario Sin Nombre',
      email: userData.email,
      password: userData.password,
      role: userData.role || 'usuario',
      activo: userData.activo !== undefined ? userData.activo : true,
      local: userData.local, // Permitir que sea un string vacío
      telefono: userData.telefono || '0000000000',
      direccion: userData.direccion || 'Dirección por defecto',
    };
    
    console.log('createUser - Datos completos a enviar:', userDataComplete);
    
    // Intentar crear el usuario
    console.log('createUser - Intentando crear usuario en:', ENDPOINTS.USERS);
    const response = await api.post(ENDPOINTS.USERS, userDataComplete);
    
    console.log('createUser - Respuesta del servidor:', response);
    return response;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    // Información detallada sobre el error para depuración
    if (error.response) {
      console.error('Código de estado:', error.response.status);
      console.error('Datos del error:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      console.error('Request:', error.request);
    } else {
      console.error('Error en la configuración de la petición:', error.message);
    }
    
    throw error;
  }
};

// Actualizar un usuario existente
export const updateUser = async (userId, userData) => {
  try {
    console.log(`updateUser - Actualizando usuario ${userId}:`, userData);
    console.log(`updateUser - Endpoint utilizado: ${ENDPOINTS.USER_BY_ID(userId)}`);
    
    // Eliminar campos innecesarios o que podrían causar problemas
    const cleanedData = { ...userData };
    
    // Si no se proporciona una contraseña nueva, eliminarla del objeto
    if (!cleanedData.password || cleanedData.password.trim() === '') {
      delete cleanedData.password;
    }
    
    // Eliminar cualquier campo __v, createdAt, updatedAt que podrían venir del frontend
    delete cleanedData.__v;
    delete cleanedData.createdAt;
    delete cleanedData.updatedAt;
    delete cleanedData.createdBy;
    delete cleanedData.updatedBy;
    delete cleanedData.ultimoLogin;
    delete cleanedData.ultimaConexion;
    delete cleanedData.fechaCreacion;
    delete cleanedData.fechaActualizacion;
    delete cleanedData.ultimaModificacion;
    
    // Eliminar _id o id para evitar conflictos con el backend
    delete cleanedData._id;
    delete cleanedData.id;
    
    // Asegurarnos de que el campo local puede ser string vacío (no se aplica valor por defecto)
    cleanedData.local = userData.local; // Permitir que sea un string vacío
    
    console.log('Datos finales enviados al actualizar usuario:', cleanedData);
    
    const response = await api.put(ENDPOINTS.USER_BY_ID(userId), cleanedData);
    console.log('updateUser - Respuesta:', response);
    return response;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    // Información detallada sobre el error para depuración
    if (error.response) {
      console.error('Código de estado:', error.response.status);
      console.error('Datos del error:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      console.error('Request:', error.request);
    } else {
      console.error('Error en la configuración de la petición:', error.message);
    }
    throw error;
  }
};

// Eliminar un usuario
export const deleteUser = async (userId) => {
  try {
    console.log(`deleteUser - Eliminando usuario: ${userId}`);
    console.log(`deleteUser - Endpoint utilizado: ${ENDPOINTS.USER_BY_ID(userId)}`);
    const response = await api.delete(ENDPOINTS.USER_BY_ID(userId));
    console.log('deleteUser - Respuesta:', response);
    return response;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    // Información detallada sobre el error para depuración
    if (error.response) {
      console.error('Código de estado:', error.response.status);
      console.error('Datos del error:', error.response.data);
    }
    throw error;
  }
};

// Actualizar el estado de un usuario
export const updateUserStatus = async (userId, status) => {
  try {
    // 1. Primero obtener la lista completa de usuarios para encontrar el ID correcto
    console.log(`Buscando información correcta para el usuario con ID: ${userId}`);
    
    const allUsersResponse = await getAllUsers();
    console.log('Estructura de respuesta completa:', allUsersResponse);
    
    // Extraer los usuarios de la respuesta en cualquier formato que venga
    let users = [];
    
    if (allUsersResponse && allUsersResponse.data) {
      if (allUsersResponse.data.success && allUsersResponse.data.data) {
        // Formato: {success: true, data: [...]} o {success: true, data: {users: [...]}}
        if (Array.isArray(allUsersResponse.data.data)) {
          users = allUsersResponse.data.data;
        } else if (allUsersResponse.data.data.users && Array.isArray(allUsersResponse.data.data.users)) {
          users = allUsersResponse.data.data.users;
        }
      } else if (Array.isArray(allUsersResponse.data)) {
        // Formato: [...]
        users = allUsersResponse.data;
      } else if (allUsersResponse.data.users && Array.isArray(allUsersResponse.data.users)) {
        // Formato: {users: [...]}
        users = allUsersResponse.data.users;
      }
    }
    
    console.log(`Se encontraron ${users.length} usuarios en el sistema`);
    
    if (users.length === 0) {
      // Si no pudimos extraer usuarios, intentar directamente con el ID proporcionado
      console.warn(`No se pudieron encontrar usuarios en la respuesta. Intentando directamente con el ID: ${userId}`);
      
      // Asegurarse de que sea un string limpio
      const cleanId = userId.toString().trim();
      
      // Construir la URL
      const fullUrl = `${API_URL}${ENDPOINTS.USER_STATUS(cleanId)}`;
      console.log(`Intentando directamente con URL: ${fullUrl}`);
      
      // Preparar el payload
      const payload = {
        activo: status.activo === true || status.activo === false ? status.activo : false
      };
      
      // Obtener configuración con token para axios
      const config = getAuthConfig();
      
      // Realizar la petición directamente
      const response = await axios.patch(fullUrl, payload, config);
      console.log('Respuesta directa exitosa:', response);
      return response;
    }
    
    // 2. Buscar el usuario correcto
    // Función para comparar IDs, teniendo en cuenta diferentes formatos
    const compareIds = (id1, id2) => {
      if (!id1 || !id2) return false;
      
      // Convertir a string y eliminar espacios
      const str1 = id1.toString().trim();
      const str2 = id2.toString().trim();
      
      // Comparación directa
      if (str1 === str2) return true;
      
      // Buscar un patrón de ObjectId en ambos strings
      const extractObjectId = (str) => {
        const match = str.match(/([0-9a-f]{24})/i);
        return match ? match[1] : null;
      };
      
      const objId1 = extractObjectId(str1);
      const objId2 = extractObjectId(str2);
      
      // Si ambos tienen un ObjectId válido, comparar esos
      if (objId1 && objId2) {
        return objId1 === objId2;
      }
      
      return false;
    };
    
    // Buscar el usuario usando cualquiera de los campos de ID
    const matchingUser = users.find(user => 
      compareIds(user._id, userId) || 
      compareIds(user.id, userId) || 
      compareIds(user.userId, userId)
    );
    
    let correctId;
    
    if (matchingUser) {
      // 3. Usar el ID correcto de MongoDB para la actualización
      correctId = matchingUser._id || matchingUser.id;
      console.log(`Usuario encontrado! ID correcto para actualizar: ${correctId}`);
    } else {
      // Si no encontramos el usuario, usar el ID original pero limpiar y verificar formato
      console.warn(`No se encontró el usuario con ID ${userId} en la lista. Intentando con el ID proporcionado.`);
      
      // Extraer un posible ObjectId
      const extractObjectId = (str) => {
        const match = str.toString().match(/([0-9a-f]{24})/i);
        return match ? match[1] : str;
      };
      
      correctId = extractObjectId(userId);
    }
    
    // 4. Asegurarse de que el ID sea un string limpio
    const cleanId = correctId.toString().trim();
    
    // 5. Construir la URL con el ID correcto
    const fullUrl = `${API_URL}${ENDPOINTS.USER_STATUS(cleanId)}`;
    console.log(`URL final para actualización: ${fullUrl}`);
    
    // 6. Preparar el payload
    const payload = {
      activo: status.activo === true || status.activo === false ? status.activo : false
    };
    
    console.log('Payload final enviado al backend:', payload);
    
    // 7. Obtener configuración con token para axios manual
    const config = getAuthConfig();
    
    // 8. Realizar la petición con el ID correcto
    const response = await axios.patch(fullUrl, payload, config);
    console.log('updateUserStatus - Respuesta exitosa:', response);
    return response;
    
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    
    // Información detallada sobre el error para depuración
    if (error.response) {
      console.error('Código de estado:', error.response.status);
      console.error('Datos del error:', error.response.data);
      console.error('Headers:', error.response.headers);
      if (error.config) {
        console.error('URL solicitada:', error.config.url);
        console.error('Método usado:', error.config.method);
        console.error('Datos enviados:', error.config.data);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      console.error('Request:', error.request);
    } else {
      console.error('Error en la configuración de la petición:', error.message);
    }
    
    throw error;
  }
}; 