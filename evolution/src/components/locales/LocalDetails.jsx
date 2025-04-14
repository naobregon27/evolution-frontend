import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const LocalDetails = ({ local, onEdit, onClose }) => {
  const isDarkMode = useSelector(state => state.settings.darkMode);

  if (!local) {
    return null;
  }

  const formatHorario = () => {
    const { apertura, cierre, diasOperacion } = local.horario || { apertura: '', cierre: '', diasOperacion: [] };
    return `${apertura} - ${cierre}, ${diasOperacion ? diasOperacion.join(', ') : ''}`;
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{local.nombre}</h2>
        <div className="flex space-x-2">
          {local.activo ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Activo
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Inactivo
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
              <p className="font-medium">{local.direccion || 'No disponible'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
              <p className="font-medium">{local.telefono || 'No disponible'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{local.email || 'No disponible'}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Horario</h3>
          
          <div className="space-y-3">
            {local.horario ? (
              <>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Horario de atención</p>
                  <p className="font-medium">{formatHorario()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Días de operación</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {local.horario?.diasOperacion?.map(dia => (
                      <span 
                        key={dia}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-md text-sm"
                      >
                        {dia}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay información de horario disponible</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Descripción</h3>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {local.descripcion || 'No hay descripción disponible para este local.'}
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          Cerrar
        </button>
        <button
          onClick={() => onEdit(local._id)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Editar
        </button>
      </div>
    </div>
  );
};

LocalDetails.propTypes = {
  local: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default LocalDetails; 