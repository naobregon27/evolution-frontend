import { createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

const initialState = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      // Asegurar que tengamos la estructura correcta de datos
      const payload = action.payload || {};
      
      // Extraer la información necesaria (con validaciones)
      let user = null;
      let role = null;
      
      // Extraer y normalizar el rol - asegurarse de que no tengamos errores si falta algún campo
      if (payload.user && typeof payload.user === 'object') {
        // Caso más común: la respuesta tiene un objeto user
        user = { ...payload.user };
        role = payload.user.role || null;
      } else if (payload.role && typeof payload === 'object') {
        // Caso alternativo: el usuario está en la raíz del payload
        user = { ...payload };
        role = payload.role || null;
      } else if (typeof payload === 'object') {
        // Caso de fallback: asumir que todo el payload es el usuario
        user = { ...payload };
        // Buscar posibles campos de rol en diversas ubicaciones
        role = payload.role || payload.userRole || null;
      }
      
      // Normalizar el rol a uno de los tres valores esperados
      let normalizedRole = null;
      if (role === 'usuario' || role === 'admin' || role === 'superAdmin') {
        // Si el rol ya es uno de los valores esperados, lo usamos directamente
        normalizedRole = role;
      } else if (role === 'user') {
        // Si por alguna razón llega 'user', lo mapeamos a 'usuario'
        normalizedRole = 'usuario';
      } else {
        // Si no reconocemos el rol, usamos 'usuario' por defecto (más seguro)
        console.warn(`Rol no reconocido: "${role}". Usando 'usuario' por defecto.`);
        normalizedRole = 'usuario';
      }
      
      // Actualizar el estado de una sola vez para evitar renderizados múltiples
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user || {};
      state.userRole = normalizedRole;
      state.error = null;
      
      // Log con información depurada
      const email = user?.email || 'desconocido';
      console.log(`Login exitoso. Usuario: ${email}, Rol: ${normalizedRole || 'no especificado'}`);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      // Limpiar todo el estado
      Object.assign(state, initialState);
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// Thunks
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const userData = await authService.login(credentials);
    // Depuración para ver exactamente qué datos recibimos del servidor
    console.log('Respuesta completa del servidor:', userData);
    if (userData.user) {
      console.log('Rol del usuario en la respuesta:', userData.user.role);
    } else {
      console.log('Estructura de respuesta:', Object.keys(userData).join(', '));
    }
    dispatch(loginSuccess(userData));
    return userData;
  } catch (error) {
    console.error('Error detallado del login:', error);
    const errorMessage = error.message || 'Error al iniciar sesión';
    dispatch(loginFailure(errorMessage));
    throw error;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await authService.logout();
    dispatch(logout());
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Aunque haya un error, cerramos sesión localmente
    dispatch(logout());
  }
};

export default authSlice.reducer; 