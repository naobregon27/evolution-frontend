import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../store/reducers/authReducer';

const AdminPage = () => {
  const { isAuthenticated, userRole, user } = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo para fines de depuración
    console.log('AdminPage - Estado de autenticación:', { isAuthenticated, userRole });
    
    // Protección de ruta: primero verificamos si está autenticado
    if (!isAuthenticated || !userRole) {
      console.log('No autenticado, redirigiendo a login');
      navigate('/login');
      return;
    }
    
    // Ahora verificamos los permisos específicos - solo admin y superAdmin pueden acceder
    const allowedRoles = ['admin', 'superAdmin'];
    if (!allowedRoles.includes(userRole)) {
      console.log(`Rol "${userRole}" no tiene permisos de administrador, redirigiendo...`);
      // Si es un usuario normal, lo enviamos al dashboard
      if (userRole === 'usuario') {
        navigate('/dashboard');
      } else {
        // Si el rol no es reconocido, por seguridad lo enviamos a login
        navigate('/login');
      }
      return;
    }
    
    // Si llegamos aquí, el usuario está autenticado y tiene permisos
    console.log(`Usuario con rol "${userRole}" tiene acceso al panel de administración`);
    setIsLoading(false);
  }, [isAuthenticated, userRole, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // En caso de error, intentar redireccionar de todos modos
      navigate('/login');
    }
  };

  // Si está cargando, mostrar un indicador
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto transform transition-all hover:scale-105">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-5 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Panel de Administrador</h1>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex items-center mb-8 p-6 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-6">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'Administrador'}</h2>
                <p className="text-blue-600 font-medium">{user?.email || 'admin@example.com'}</p>
                <div className="mt-1 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {userRole === 'superAdmin' ? 'Super Administrador' : 'Administrador'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Gestión de Contenido</h3>
                <p className="text-gray-600 mb-4">Administra el contenido y recursos del sistema.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Gestionar contenido
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Usuarios</h3>
                <p className="text-gray-600 mb-4">Administra usuarios regulares del sistema.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Administrar usuarios
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Reportes</h3>
                <p className="text-gray-600 mb-4">Visualiza estadísticas y reportes del sistema.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Ver reportes
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Configuración</h3>
                <p className="text-gray-600 mb-4">Configura parámetros básicos del sistema.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 