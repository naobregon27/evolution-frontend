import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logoutUser } from '../store/reducers/authReducer';

// Importar componentes
import Layout from '../components/Layout';
import ChangePasswordModal from '../components/ChangePasswordModal';

// Importar servicios
import { getAllUsers } from '../services/userService';

const SuperAdminPage = () => {
  const { isAuthenticated, userRole, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Estados
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    // Protección de ruta: Si no está autenticado o no es superAdmin, redirigir al login
    if (!isAuthenticated || userRole !== 'superAdmin') {
      navigate('/login');
    } else {
      // Cargar estadísticas al montar el componente
      loadStats();
    }
  }, [isAuthenticated, userRole, navigate]);

  // Función para cargar estadísticas
  const loadStats = async () => {
    setIsLoading(true);
    try {
      console.log('Cargando estadísticas...');
      const response = await getAllUsers();
      console.log('Datos para estadísticas:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const users = response.data;
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter(user => user.activo).length,
          inactiveUsers: users.filter(user => !user.activo).length,
          adminUsers: users.filter(user => user.role === 'admin' || user.role === 'superAdmin').length
        });
      } else {
        // Datos de prueba si no hay usuarios
        setStats({
          totalUsers: 5,
          activeUsers: 4,
          inactiveUsers: 1,
          adminUsers: 2
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar las estadísticas');
      
      // Datos de prueba si hay error
      setStats({
        totalUsers: 5,
        activeUsers: 4,
        inactiveUsers: 1,
        adminUsers: 2
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Error durante el logout:', error);
      navigate('/login');
    }
  };

  // Componente principal - Ahora usando el componente Layout
  return (
    <Layout user={user} userRole={userRole}>
      <div className="w-full">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">Panel de Super Administrador</h1>
          
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cambiar Contraseña
          </button>
        </div>
        
        {/* Estadísticas */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumen del Sistema</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando estadísticas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <h3 className="text-sm font-medium text-gray-500">Total Usuarios</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <h3 className="text-sm font-medium text-gray-500">Usuarios Activos</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.activeUsers}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <h3 className="text-sm font-medium text-gray-500">Usuarios Inactivos</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.inactiveUsers}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500">
                <h3 className="text-sm font-medium text-gray-500">Administradores</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.adminUsers}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Accesos rápidos */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Acciones Rápidas</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/super-admin/users"
              className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex items-center space-x-4"
            >
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Gestionar Usuarios</h3>
                <p className="text-sm text-gray-500">Administrar todos los usuarios del sistema</p>
              </div>
            </Link>
            
            <Link
              to="/super-admin/profile"
              className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex items-center space-x-4"
            >
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Mi Perfil</h3>
                <p className="text-sm text-gray-500">Gestionar mi información personal</p>
              </div>
            </Link>
            
            <Link
              to="/super-admin/settings"
              className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex items-center space-x-4"
            >
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Configuración</h3>
                <p className="text-sm text-gray-500">Ajustar la configuración del sistema</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          alert('Contraseña cambiada correctamente');
          setShowChangePasswordModal(false);
        }}
      />
    </Layout>
  );
};

export default SuperAdminPage; 