import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaUserShield, FaUserCog, FaTimes } from 'react-icons/fa';

const StatsModal = ({ isOpen, onClose, title, data, type }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (data) {
      setFilteredData(data);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const filtered = data.filter(item => {
        // Buscar en diferentes campos según el tipo de datos
        if (type === 'users' || type === 'admins' || type === 'superadmins') {
          return (
            item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.primaryLocal?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.telefono || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else if (type === 'locales') {
          return (
            (item.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.direccion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.telefono || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return true;
      });
      setFilteredData(filtered);
    }
  }, [searchTerm, data, type]);

  if (!isOpen) return null;

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Formato inválido';
    }
  };

  // Renderizar contenido según el tipo
  const renderContent = () => {
    if (!filteredData || filteredData.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      );
    }

    switch (type) {
      case 'users':
      case 'admins':
      case 'superadmins':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local Principal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          {user.imagenPerfil && user.imagenPerfil !== 'default.jpg' ? (
                            <img src={user.imagenPerfil} alt={user.nombre} className="h-10 w-10 object-cover" />
                          ) : (
                            <div className="bg-indigo-100 h-10 w-10 flex items-center justify-center rounded-full">
                              <span className="text-indigo-700 font-medium">
                                {user.nombre?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {user.role === 'superAdmin' ? 'Super Admin' : 
                             user.role === 'admin' ? 'Administrador' : 'Usuario'}
                          </div>
                          {user.esAdministradorLocal && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Admin Local
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.telefono && (
                        <div className="text-sm text-gray-500">{user.telefono}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-sm text-gray-900">{user.primaryLocal?.nombre || 'Sin asignar'}</div>
                      {user.primaryLocal?.direccion && (
                        <div className="text-xs text-gray-500">{user.primaryLocal.direccion}</div>
                      )}
                      {user.locales && user.locales.length > 1 && (
                        <div className="text-xs text-indigo-600">
                          + {user.locales.length - 1} {user.locales.length - 1 === 1 ? 'local' : 'locales'} más
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.fechaCreacion)}
                      {user.creadoPor && (
                        <div className="text-xs text-gray-500">
                          por {user.creadoPor.nombre}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'locales':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administradores
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((local) => (
                  <tr key={local.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <div className="bg-green-100 h-10 w-10 flex items-center justify-center rounded-full">
                            <span className="text-green-700 font-medium">
                              {local.nombre?.charAt(0).toUpperCase() || 'L'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{local.nombre}</div>
                          <div className="text-xs text-gray-500">{local.direccion || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{local.email || 'No disponible'}</div>
                      <div className="text-sm text-gray-500">{local.telefono || 'No disponible'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-sm font-medium text-gray-900">
                        {local.adminsCount || local.admins?.length || 0}
                      </div>
                      {local.admins && local.admins.length > 0 && (
                        <div className="mt-1">
                          {local.admins.slice(0, 2).map(admin => (
                            <div key={admin.id} className="text-xs text-gray-500">
                              {admin.nombre}
                            </div>
                          ))}
                          {local.admins.length > 2 && (
                            <div className="text-xs text-indigo-600">
                              + {local.admins.length - 2} más
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-sm font-medium text-gray-900">
                        {local.usuariosCount || local.usuarios?.length || 0}
                      </div>
                      {local.usuarios && local.usuarios.length > 0 && (
                        <div className="mt-1">
                          {local.usuarios.slice(0, 2).map(usuario => (
                            <div key={usuario.id} className="text-xs text-gray-500">
                              {usuario.nombre}
                            </div>
                          ))}
                          {local.usuarios.length > 2 && (
                            <div className="text-xs text-indigo-600">
                              + {local.usuarios.length - 2} más
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Tipo de datos no soportado</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex" onClick={onClose}>
      <div 
        className="relative p-6 bg-white w-full max-w-6xl m-auto rounded-lg shadow-xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal; 