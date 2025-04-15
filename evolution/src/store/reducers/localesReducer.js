import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import localesService from '../../services/localesService';

// Thunks
export const fetchLocales = createAsyncThunk(
  'locales/fetchLocales',
  async (_, { rejectWithValue }) => {
    try {
      const response = await localesService.getLocales();
      console.log('Datos de locales obtenidos:', response);
      
      // Procesamos la respuesta para extraer los locales desde la estructura correcta
      if (response && response.success && response.data && response.data.locales) {
        return response.data.locales;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error en fetchLocales:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al obtener locales');
    }
  }
);

export const fetchLocalById = createAsyncThunk(
  'locales/fetchLocalById',
  async (localId, { rejectWithValue }) => {
    try {
      const response = await localesService.getLocalById(localId);
      
      // Procesamos la respuesta para extraer el local desde la estructura correcta
      if (response && response.success && response.data) {
        return response.data;
      } else {
        throw new Error('No se encontró el local solicitado');
      }
    } catch (error) {
      console.error('Error en fetchLocalById:', error);
      return rejectWithValue(error.response?.data?.message || error.message || `Error al obtener local con ID ${localId}`);
    }
  }
);

export const createLocal = createAsyncThunk(
  'locales/createLocal',
  async (localData, { rejectWithValue }) => {
    try {
      const response = await localesService.createLocal(localData);
      
      // Procesamos la respuesta para extraer el local desde la estructura correcta
      if (response && response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Error al crear el local');
      }
    } catch (error) {
      console.error('Error en createLocal:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al crear local');
    }
  }
);

export const updateLocal = createAsyncThunk(
  'locales/updateLocal',
  async ({ localId, localData }, { rejectWithValue }) => {
    try {
      const response = await localesService.updateLocal(localId, localData);
      
      // Procesamos la respuesta para extraer el local desde la estructura correcta
      if (response && response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Error al actualizar el local');
      }
    } catch (error) {
      console.error('Error en updateLocal:', error);
      return rejectWithValue(error.response?.data?.message || error.message || `Error al actualizar local con ID ${localId}`);
    }
  }
);

export const deleteLocal = createAsyncThunk(
  'locales/deleteLocal',
  async (localId, { rejectWithValue }) => {
    try {
      // Verificar que tenemos un ID válido
      if (!localId) {
        throw new Error('ID de local no válido');
      }
      
      console.log(`Eliminando local ${localId} usando endpoint: /api/locales/${localId}`);
      const response = await localesService.deleteLocal(localId);
      
      // Procesamos la respuesta para extraer el local desde la estructura correcta
      if (response && (response.success || response._id)) {
        // Si tenemos éxito, devolvemos un objeto con el ID para actualizar el estado
        return { _id: localId, ...response.data };
      } else {
        throw new Error('Error al eliminar el local: Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error(`Error en deleteLocal (${localId}):`, error);
      return rejectWithValue(error.response?.data?.message || error.message || `Error al eliminar local con ID ${localId}`);
    }
  }
);

export const changeLocalStatus = createAsyncThunk(
  'locales/changeLocalStatus',
  async ({ localId, isActive }, { rejectWithValue }) => {
    try {
      const response = await localesService.changeLocalStatus(localId, isActive);
      
      // Procesamos la respuesta para extraer el local desde la estructura correcta
      if (response && response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Error al cambiar estado del local');
      }
    } catch (error) {
      console.error('Error en changeLocalStatus:', error);
      return rejectWithValue(error.response?.data?.message || error.message || `Error al cambiar estado del local con ID ${localId}`);
    }
  }
);

export const fetchLocalUsers = createAsyncThunk(
  'locales/fetchLocalUsers',
  async (localId, { rejectWithValue }) => {
    try {
      const response = await localesService.getLocalUsers(localId);
      
      // Procesamos la respuesta para extraer los usuarios desde la estructura correcta
      if (response && response.success && response.data) {
        return response.data.usuarios || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error en fetchLocalUsers:', error);
      return rejectWithValue(error.response?.data?.message || error.message || `Error al obtener usuarios del local con ID ${localId}`);
    }
  }
);

export const assignAdminToLocal = createAsyncThunk(
  'locales/assignAdminToLocal',
  async ({ localId, userId }, { rejectWithValue }) => {
    try {
      const response = await localesService.assignAdminToLocal(localId, userId);
      
      // Procesamos la respuesta para extraer el local desde la estructura correcta
      if (response && response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Error al asignar admin al local');
      }
    } catch (error) {
      console.error('Error en assignAdminToLocal:', error);
      return rejectWithValue(error.response?.data?.message || error.message || `Error al asignar admin al local con ID ${localId}`);
    }
  }
);

export const unassignUserFromLocal = createAsyncThunk(
  'locales/unassignUserFromLocal',
  async ({ localId, userId }, { rejectWithValue }) => {
    try {
      const response = await localesService.unassignUserFromLocal(localId, userId);
      
      // Procesamos la respuesta para extraer el local desde la estructura correcta
      if (response && response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Error al desasignar usuario del local');
      }
    } catch (error) {
      console.error('Error en unassignUserFromLocal:', error);
      return rejectWithValue(error.response?.data?.message || error.message || `Error al desasignar usuario del local con ID ${localId}`);
    }
  }
);

// Slice inicial
const initialState = {
  locales: [],
  selectedLocal: null,
  localUsers: [],
  loading: false,
  error: null,
  success: false,
  message: ''
};

// Slice
const localesSlice = createSlice({
  name: 'locales',
  initialState,
  reducers: {
    resetLocalesState: (state) => {
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearSelectedLocal: (state) => {
      state.selectedLocal = null;
      state.localUsers = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all locales
      .addCase(fetchLocales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocales.fulfilled, (state, action) => {
        state.loading = false;
        state.locales = action.payload;
      })
      .addCase(fetchLocales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al obtener locales';
        console.error('fetchLocales rechazado:', action.payload);
      })
      
      // Fetch local by id
      .addCase(fetchLocalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocalById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLocal = action.payload;
      })
      .addCase(fetchLocalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al obtener detalles del local';
      })
      
      // Create local
      .addCase(createLocal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createLocal.fulfilled, (state, action) => {
        state.loading = false;
        state.locales.push(action.payload);
        state.success = true;
        state.message = 'Local creado exitosamente';
      })
      .addCase(createLocal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al crear local';
        state.success = false;
      })
      
      // Update local
      .addCase(updateLocal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateLocal.fulfilled, (state, action) => {
        state.loading = false;
        state.locales = state.locales.map(local => 
          local._id === action.payload._id ? action.payload : local
        );
        if (state.selectedLocal && state.selectedLocal._id === action.payload._id) {
          state.selectedLocal = action.payload;
        }
        state.success = true;
        state.message = 'Local actualizado exitosamente';
      })
      .addCase(updateLocal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al actualizar local';
        state.success = false;
      })
      
      // Delete local
      .addCase(deleteLocal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteLocal.fulfilled, (state, action) => {
        state.loading = false;
        state.locales = state.locales.filter(local => local._id !== action.payload._id);
        if (state.selectedLocal && state.selectedLocal._id === action.payload._id) {
          state.selectedLocal = null;
        }
        state.success = true;
        state.message = 'Local eliminado exitosamente';
      })
      .addCase(deleteLocal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al eliminar local';
        state.success = false;
      })
      
      // Change local status
      .addCase(changeLocalStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeLocalStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.locales = state.locales.map(local => 
          local._id === action.payload._id ? action.payload : local
        );
        if (state.selectedLocal && state.selectedLocal._id === action.payload._id) {
          state.selectedLocal = action.payload;
        }
        state.success = true;
        state.message = `Estado del local ${action.payload.activo ? 'activado' : 'desactivado'} exitosamente`;
      })
      .addCase(changeLocalStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al cambiar estado del local';
      })
      
      // Fetch local users
      .addCase(fetchLocalUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocalUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.localUsers = action.payload;
      })
      .addCase(fetchLocalUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al obtener usuarios del local';
      })
      
      // Assign admin to local
      .addCase(assignAdminToLocal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(assignAdminToLocal.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedLocal && state.selectedLocal._id === action.payload._id) {
          state.selectedLocal = action.payload;
        }
        state.success = true;
        state.message = 'Administrador asignado exitosamente';
      })
      .addCase(assignAdminToLocal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al asignar administrador';
        state.success = false;
      })
      
      // Unassign user from local
      .addCase(unassignUserFromLocal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(unassignUserFromLocal.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedLocal && state.selectedLocal._id === action.payload._id) {
          state.selectedLocal = action.payload;
        }
        state.success = true;
        state.message = 'Usuario desasignado exitosamente';
      })
      .addCase(unassignUserFromLocal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido al desasignar usuario';
        state.success = false;
      });
  }
});

export const { resetLocalesState, clearSelectedLocal } = localesSlice.actions;
export default localesSlice.reducer; 