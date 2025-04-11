import { createSlice } from '@reduxjs/toolkit';

// Intentar cargar la configuración del localStorage si existe
const loadSettingsFromStorage = () => {
  try {
    const storedSettings = localStorage.getItem('app_settings');
    return storedSettings ? JSON.parse(storedSettings) : null;
  } catch (error) {
    console.error('Error al cargar la configuración:', error);
    return null;
  }
};

// Inicializar el estado con valores predeterminados o valores almacenados
const storedSettings = loadSettingsFromStorage();
const initialState = {
  darkMode: storedSettings?.darkMode ?? false,
  language: storedSettings?.language ?? 'es',
  notificationsEnabled: storedSettings?.notificationsEnabled ?? true,
  autoLogout: storedSettings?.autoLogout ?? true,
  sessionTimeout: storedSettings?.sessionTimeout ?? 30
};

// Función para guardar la configuración en localStorage
const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error al guardar la configuración:', error);
  }
};

// Función para aplicar el modo oscuro al documento
const applyDarkMode = (isDarkMode) => {
  console.log('Aplicando modo oscuro:', isDarkMode);
  
  // Asegurarnos de que se ejecute en el cliente y no en el servidor
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Usar setTimeout para asegurar que esto se ejecute después de que el DOM esté disponible
    setTimeout(() => {
      try {
        if (isDarkMode) {
          console.log('Añadiendo clase dark al HTML');
          document.documentElement.classList.add('dark');
        } else {
          console.log('Removiendo clase dark del HTML');
          document.documentElement.classList.remove('dark');
        }
        console.log('Estado actual de las clases en HTML:', document.documentElement.className);
      } catch (error) {
        console.error('Error al aplicar el modo oscuro:', error);
      }
    }, 0);
  }
};

// Crear el slice de settings
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      console.log('toggleDarkMode llamado, valor actual:', state.darkMode);
      state.darkMode = !state.darkMode;
      console.log('Nuevo valor de darkMode:', state.darkMode);
      saveSettingsToStorage(state);
      
      // Aplicar el modo oscuro inmediatamente
      applyDarkMode(state.darkMode);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      saveSettingsToStorage(state);
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
      saveSettingsToStorage(state);
    },
    toggleAutoLogout: (state) => {
      state.autoLogout = !state.autoLogout;
      saveSettingsToStorage(state);
    },
    setSessionTimeout: (state, action) => {
      state.sessionTimeout = action.payload;
      saveSettingsToStorage(state);
    },
    updateSettings: (state, action) => {
      // Actualizar múltiples configuraciones a la vez
      const oldDarkMode = state.darkMode;
      Object.assign(state, action.payload);
      saveSettingsToStorage(state);
      
      // Si cambió el modo oscuro, aplicarlo
      if (oldDarkMode !== state.darkMode) {
        applyDarkMode(state.darkMode);
      }
    }
  }
});

// Exportar acciones y reducer
export const { 
  toggleDarkMode, 
  setLanguage, 
  toggleNotifications, 
  toggleAutoLogout,
  setSessionTimeout,
  updateSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;

// Inicialización del tema al cargar la aplicación
export const initializeSettings = () => (dispatch, getState) => {
  console.log('Inicializando settings desde el store');
  const { darkMode } = getState().settings;
  console.log('Valor inicial de darkMode:', darkMode);
  
  // Aplicar el tema oscuro si está habilitado
  applyDarkMode(darkMode);
}; 