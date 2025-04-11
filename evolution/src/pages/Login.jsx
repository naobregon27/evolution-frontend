import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/reducers/authReducer';
import axios from 'axios';

// URL para la API backend (Render)
const BACKEND_URL = 'https://evolution-backend-flhq.onrender.com';
// Ruta base para las API
const API_BASE = '/api';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showDebug, setShowDebug] = useState(false);
  const [localError, setLocalError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [apiInfo, setApiInfo] = useState(null);
  const [proxyStatus, setProxyStatus] = useState(null); // null, 'working', 'failed'
  const [backendChecked, setBackendChecked] = useState(false); // Para evitar verificaciones múltiples
  
  // Referencia para controlar si ya se realizó una redirección
  const hasRedirected = useRef(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Obtener el estado de autenticación del store
  const { isAuthenticated, user, userRole, loading } = useSelector(state => state.auth);
  
  // Redirigir si ya está autenticado, basado en el rol (con control para evitar redirecciones múltiples)
  useEffect(() => {
    // Solo ejecutamos la redirección si no se ha realizado antes y tenemos los datos necesarios
    if (isAuthenticated && user && userRole && !hasRedirected.current) {
      // Marcamos que ya hemos hecho una redirección
      hasRedirected.current = true;
      
      let targetRoute = '/dashboard'; // ruta por defecto para usuarios normales
      
      // Redirección basada en el rol exacto del backend
      switch(userRole) {
        case 'superAdmin':
          targetRoute = '/super-admin';
          console.log('Usuario superAdmin: Redirigiendo a /super-admin');
          break;
        case 'admin':
          targetRoute = '/admin'; 
          console.log('Usuario admin: Redirigiendo a /admin');
          break;
        case 'usuario':
          targetRoute = '/dashboard';
          console.log('Usuario normal: Redirigiendo a /dashboard');
          break;
        default:
          console.warn(`Rol no reconocido: ${userRole}. Redirigiendo a ruta por defecto.`);
          targetRoute = '/dashboard';
      }
      
      console.log(`Redirigiendo a usuario con rol ${userRole} a: ${targetRoute}`);
      
      // Usamos setTimeout para asegurar que el estado se ha actualizado completamente
      setTimeout(() => {
        navigate(targetRoute);
      }, 100);
    }
  }, [isAuthenticated, userRole, navigate]);
  
  // Limpiamos la referencia al desmontar el componente
  useEffect(() => {
    return () => {
      hasRedirected.current = false;
    };
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
    // Limpiar errores al cambiar los campos
    setLocalError('');
  };
  
  const validateForm = () => {
    if (!credentials.email || !credentials.password) {
      setLocalError('Por favor, completa todos los campos');
      return false;
    }
    
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setLocalError('Por favor, introduce un email válido');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar el formulario
    if (!validateForm()) return;
    
    // Resetear el estado de redirección antes de iniciar un nuevo login
    hasRedirected.current = false;
    
    try {
      await dispatch(loginUser(credentials));
      // La redirección se maneja en el useEffect
    } catch (error) {
      setLocalError(error.message || 'Error al iniciar sesión');
    }
  };

  // Verificar el estado del backend al cargar, solo una vez
  useEffect(() => {
    if (!backendChecked) {
      const checkBackendStatus = async () => {
        setBackendStatus('checking');
        try {
          // Intentar acceder al backend directamente
          const response = await axios.get(BACKEND_URL, { 
            timeout: 15000,
            headers: { 'Accept': 'application/json' }
          });
          setApiInfo(response.data);
          setBackendStatus('online');
          setProxyStatus('working');
        } catch (error) {
          console.error('Error al verificar backend:', error);
          setBackendStatus('offline');
          setProxyStatus('failed');
        } finally {
          setBackendChecked(true);
        }
      };
      
      checkBackendStatus();
    }
  }, [backendChecked]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Iniciar sesión en Evolution
          </h2>
          <p className="text-indigo-100">
            Ingresa tus credenciales para acceder
          </p>
          <button 
            className="mt-2 text-xs text-indigo-200 underline hover:text-white"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Ocultar debug' : 'Mostrar debug'}
          </button>
        </div>
        
        {showDebug && (
          <div className="mb-6 text-xs bg-indigo-900 bg-opacity-40 p-4 rounded text-white shadow-lg border border-indigo-800">
            <p>Backend URL: {BACKEND_URL}</p>
            <p>API Base: {API_BASE}</p>
            <p>Estado del backend: {
              backendStatus === 'checking' ? 'Verificando...' :
              backendStatus === 'online' ? '✅ Conectado' : 
              '❌ No disponible'
            }</p>
            <p>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</p>
            <p>Rol: {userRole || 'No definido'}</p>
            <p>Redirigido: {hasRedirected.current ? 'Sí' : 'No'}</p>
            {apiInfo && (
              <div className="mt-1 text-green-300">
                <p>Versión API: {apiInfo.version}</p>
                <p>Entorno: {apiInfo.environment}</p>
                <p>Mensaje: {apiInfo.message}</p>
              </div>
            )}
            <button 
              onClick={() => {
                setBackendChecked(false);
                setBackendStatus('checking');
                setProxyStatus(null);
                setApiInfo(null);
              }}
              className="mt-1 px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-800 transition-colors"
            >
              Probar conexión
            </button>
            <p className="mt-1">
              <a href={BACKEND_URL} target="_blank" className="text-blue-300 underline hover:text-blue-200">
                Abrir API en nueva pestaña
              </a>
            </p>
            {backendStatus === 'offline' && (
              <p className="mt-1 text-red-300 text-xs">
                Nota: Render puede tardar hasta 30 segundos en iniciar un servidor gratuito si ha estado inactivo.
              </p>
            )}
          </div>
        )}
        
        {localError && (
          <div className="mb-4 rounded-md bg-red-600 bg-opacity-40 p-4 shadow-md border border-red-400">
            <div className="text-sm text-white">{localError}</div>
          </div>
        )}
        
        {backendStatus === 'offline' && !localError && (
          <div className="mb-4 bg-yellow-600 bg-opacity-40 border border-yellow-400 text-white px-4 py-3 rounded shadow-md" role="alert">
            <span className="font-bold">Advertencia:</span>
            <span className="block sm:inline"> El servidor backend no está disponible en este momento. El inicio de sesión no funcionará hasta que el servidor esté en línea. Render puede tardar hasta 30 segundos en iniciar un servidor gratuito si ha estado inactivo.</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-indigo-900 bg-opacity-20 rounded-lg p-5 shadow-xl border-2 border-black">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2 bg-indigo-700 bg-opacity-40 text-white placeholder-indigo-300 border border-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent hover:bg-indigo-600 hover:bg-opacity-50 transition-all duration-200"
                placeholder="Tu correo electrónico"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-indigo-700 bg-opacity-40 text-white placeholder-indigo-300 border border-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent hover:bg-indigo-600 hover:bg-opacity-50 transition-all duration-200"
                placeholder="Tu contraseña"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Recordarme
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-200 hover:text-white transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || backendStatus === 'checking'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Iniciar sesión
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 