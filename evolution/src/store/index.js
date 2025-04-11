import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import settingsReducer from './reducers/settingsReducer';
import localesReducer from './reducers/localesReducer';

// Configura el store con los middleware necesarios
const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    locales: localesReducer,
    // Aquí puedes agregar más reducers si los necesitas
  },
  // El middleware por defecto incluye thunk, lo que permite despachar funciones asíncronas
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora acciones que no son serializables para ciertos paths
        ignoredActions: ['authLogin/fulfilled', 'authLogin/rejected'],
        ignoredPaths: ['auth.user'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 