import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/reducers/authReducer';

const UserPage = () => {
  const { isAuthenticated, userRole, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Protección de ruta: Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-100">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto transform transition-all hover:scale-105">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 px-8 py-5 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Panel de Usuario</h1>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex items-center mb-8 p-6 bg-green-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold mr-6">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'Usuario'}</h2>
                <p className="text-green-600 font-medium">{user?.email || 'usuario@example.com'}</p>
                <div className="mt-1 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Usuario
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Mi Perfil</h3>
                <p className="text-gray-600 mb-4">Visualiza y edita tu información personal.</p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                  Ver perfil
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Mis Actividades</h3>
                <p className="text-gray-600 mb-4">Revisa tu historial de actividades.</p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                  Ver actividades
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Mensajes</h3>
                <p className="text-gray-600 mb-4">Revisa tus mensajes y notificaciones.</p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                  Ver mensajes
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Cambiar Contraseña</h3>
                <p className="text-gray-600 mb-4">Actualiza tu contraseña de acceso.</p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage; 