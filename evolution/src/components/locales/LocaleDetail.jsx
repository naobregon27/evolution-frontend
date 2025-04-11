import React from 'react';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCalendarAlt } from 'react-icons/fa';

const LocaleDetail = ({ local }) => {
  const isDarkMode = useSelector(state => state.settings.darkMode);
  
  if (!local) {
    return (
      <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <p className="text-center">No se ha seleccionado ningún local.</p>
      </div>
    );
  }
  
  const formatDiasOperacion = (dias) => {
    if (!dias || !Array.isArray(dias) || dias.length === 0) {
      return 'No disponible';
    }
    
    return dias.join(', ');
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <div className="border-b pb-4 mb-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {local.nombre}
        </h2>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          ID: {local._id}
        </div>
        <div className={`mt-2 px-2 py-1 inline-block rounded ${
          local.activo 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {local.activo ? 'Activo' : 'Inactivo'}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start">
          <FaMapMarkerAlt className={`mt-1 mr-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Dirección
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {local.direccion || 'No disponible'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FaPhone className={`mt-1 mr-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Teléfono
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {local.telefono || 'No disponible'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FaEnvelope className={`mt-1 mr-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Email
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {local.email || 'No disponible'}
            </p>
          </div>
        </div>
        
        {local.descripcion && (
          <div className="pt-3 border-t">
            <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Descripción
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {local.descripcion}
            </p>
          </div>
        )}
        
        <div className="pt-3 border-t">
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Horario
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start">
              <FaClock className={`mt-1 mr-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <div>
                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Horario de Atención
                </h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {local.horario?.apertura && local.horario?.cierre
                    ? `${local.horario.apertura} - ${local.horario.cierre}`
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaCalendarAlt className={`mt-1 mr-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <div>
                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Días de Operación
                </h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {formatDiasOperacion(local.horario?.diasOperacion)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t">
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Información Adicional
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Fecha de Creación
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {local.createdAt 
                  ? new Date(local.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : 'No disponible'
                }
              </p>
            </div>
            
            <div>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Última Actualización
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {local.updatedAt 
                  ? new Date(local.updatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : 'No disponible'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocaleDetail; 