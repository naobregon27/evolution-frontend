import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import Login from './pages/Login';
import SuperAdminPage from './pages/SuperAdminPage';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import Layout from './components/Layout';
import UsersManagement from './pages/UsersManagement';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LocalesPage from './pages/LocalesPage';
import AsignacionLocalesPage from './pages/AsignacionLocalesPage';
import axios from 'axios';

function App() {
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settings);
  const isAuthenticated = auth?.isAuthenticated || false;
  const userRole = auth?.userRole || '';
  const user = auth?.user || null;
  const isDarkMode = settings?.darkMode || false;

  // Efecto para aplicar el modo oscuro cuando cambie el estado
  useEffect(() => {
    console.log('App.jsx - useEffect para darkMode:', settings?.darkMode);

    // Forzar un pequeño retraso para asegurar que todo está listo
    const applyTheme = () => {
      try {
        if (settings?.darkMode) {
          console.log('App.jsx - Añadiendo clase dark');
          document.documentElement.classList.add('dark');
        } else {
          console.log('App.jsx - Removiendo clase dark');
          document.documentElement.classList.remove('dark');
        }
        console.log('App.jsx - Clases actuales:', document.documentElement.className);
      } catch (error) {
        console.error('App.jsx - Error aplicando el tema:', error);
      }
    };

    // Ejecutar inmediatamente y también con un pequeño retraso para asegurar que se aplica
    applyTheme();
    const timeoutId = setTimeout(applyTheme, 100);
    
    return () => clearTimeout(timeoutId);
  }, [settings?.darkMode]);

  const API_URL = 'https://evolution-backend-flhq.onrender.com';

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Función para verificar autenticación y roles
  const requireAuth = (element, requiredRole = null) => {
    if (!isAuthenticated) {
      console.log('App - Redirigiendo a login: No autenticado');
      return <Navigate to="/login" />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
      console.log(`App - Redirigiendo: Rol requerido ${requiredRole}, tiene ${userRole}`);
      
      // Redirigir a la página correspondiente al rol
      if (userRole === 'superAdmin') return <Navigate to="/super-admin" />;
      if (userRole === 'admin') return <Navigate to="/admin" />;
      return <Navigate to="/user" />;
    }
    
    return element;
  };

  // Componente de página genérico para rutas sin Layout
  const PageContainer = ({ children, className = "" }) => (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} ${className}`}>
      {children}
    </div>
  );

  return (
    <div className={`app-root ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Router>
        <Routes>
          <Route path="/" element={
            isAuthenticated ? (
              <Navigate to={
                userRole === 'superAdmin' ? '/super-admin' : 
                userRole === 'admin' ? '/admin' : 
                '/user'
              } />
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/login" element={
            <Login />
          } />
          
          {/* Rutas de SuperAdmin */}
          <Route path="/super-admin" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <SuperAdminPage />
              </Layout>,
              'superAdmin'
            )
          } />
          
          <Route path="/super-admin/users" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <UsersManagement />
              </Layout>,
              'superAdmin'
            )
          } />
          
          {/* Rutas de Locales */}
          <Route path="/super-admin/locales" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <LocalesPage />
              </Layout>,
              'superAdmin'
            )
          } />
          
          {/* Rutas de Asignación de Locales */}
          <Route path="/super-admin/asignacion-locales" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <AsignacionLocalesPage />
              </Layout>,
              'superAdmin'
            )
          } />
          
          <Route path="/super-admin/profile" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <ProfilePage />
              </Layout>,
              'superAdmin'
            )
          } />
          
          <Route path="/super-admin/settings" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <SettingsPage />
              </Layout>,
              'superAdmin'
            )
          } />
          
          {/* Rutas de Admin */}
          <Route path="/admin" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <AdminPage />
              </Layout>,
              'admin'
            )
          } />
          
          {/* Rutas de Usuario */}
          <Route path="/user" element={
            requireAuth(
              <Layout user={user} userRole={userRole}>
                <UserPage />
              </Layout>,
              'usuario'
            )
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
