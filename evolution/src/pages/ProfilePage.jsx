import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ChangePasswordModal from '../components/ChangePasswordModal';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Función para manejar el éxito del cambio de contraseña
  const handlePasswordChangeSuccess = () => {
    // El componente ChangePasswordModal ya muestra un toast de éxito
    setShowChangePasswordModal(false);
    
    // Opcionalmente, podrías actualizar algo en tu estado de Redux si fuera necesario
    // Por ejemplo, si quisieras actualizar la última vez que se cambió la contraseña
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>
        
        <div className="bg-indigo-50 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold mr-6">
              {user?.name?.charAt(0).toUpperCase() || user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name || user?.nombre || 'Usuario'}</h2>
              <p className="text-indigo-600 font-medium">{user?.email || 'usuario@example.com'}</p>
              <div className="mt-1 inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                {user?.role === 'superAdmin' ? 'Super Administrador' : 
                 user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Información Personal</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="text-gray-700">{user?.name || user?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo Electrónico</p>
                <p className="text-gray-700">{user?.email || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-gray-700">{user?.telefono || user?.phone || 'No disponible'}</p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Seguridad</h3>
            <p className="text-gray-600 mb-4">
              Es recomendable cambiar tu contraseña regularmente para mayor seguridad.
            </p>
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default ProfilePage; 