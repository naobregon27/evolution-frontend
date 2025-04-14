import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserTie, FaUser, FaCircle, FaSpinner } from 'react-icons/fa';

const LocalUsersModal = ({ isOpen, onClose, localData, usuarios, stats, loading }) => {
  const [adminUsuarios, setAdminUsuarios] = useState([]);
  const [regularUsuarios, setRegularUsuarios] = useState([]);

  useEffect(() => {
    if (usuarios && usuarios.length > 0) {
      // Separar administradores y usuarios regulares
      const admins = usuarios.filter(user => 
        user.role === 'admin' || user.role === 'superAdmin' || user.esAdministradorLocal
      );
      const regulars = usuarios.filter(user => 
        user.role === 'usuario' && !user.esAdministradorLocal
      );
      
      // Ordenar por nombre
      const sortedAdmins = [...admins].sort((a, b) => a.nombre.localeCompare(b.nombre));
      const sortedRegulars = [...regulars].sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      setAdminUsuarios(sortedAdmins);
      setRegularUsuarios(sortedRegulars);
    } else {
      setAdminUsuarios([]);
      setRegularUsuarios([]);
    }
  }, [usuarios]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Usuarios del Local: {localData?.nombre || 'Local seleccionado'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-indigo-600 text-4xl mb-4" />
              <p className="text-gray-600">Cargando usuarios del local...</p>
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-indigo-600 font-medium">Total Usuarios</p>
                  <p className="text-2xl font-bold text-indigo-700">{stats?.total || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-green-700">{stats?.activos || 0}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-600 font-medium">Administradores</p>
                  <p className="text-2xl font-bold text-amber-700">{stats?.admin || 0}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Usuarios Regular</p>
                  <p className="text-2xl font-bold text-blue-700">{stats?.usuarios || 0}</p>
                </div>
              </div>
              
              {/* Lista de Administradores */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <FaUserTie className="text-amber-600 mr-2" />
                  Administradores ({adminUsuarios.length})
                </h4>
                {adminUsuarios.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 divide-y">
                    {adminUsuarios.map(admin => (
                      <div key={admin._id} className="flex items-center p-3 hover:bg-gray-50">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          {admin.imagenPerfil && admin.imagenPerfil !== 'default.jpg' ? (
                            <img 
                              src={admin.imagenPerfil} 
                              alt={admin.nombre} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-amber-700 text-lg font-medium">
                              {admin.nombre.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <h5 className="text-sm font-medium text-gray-900">{admin.nombre}</h5>
                            <span className="ml-2 inline-flex items-center">
                              <FaCircle className={`text-xs ${admin.enLinea ? 'text-green-500' : 'text-gray-300'}`} />
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              {admin.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                            </span>
                            {admin.esAdministradorLocal && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Admin Local
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              admin.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {admin.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto text-right">
                          <span className="text-xs text-gray-500">
                            {admin.telefono || 'Sin teléfono'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay administradores asignados a este local</p>
                )}
              </div>
              
              {/* Lista de Usuarios Regulares */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <FaUser className="text-blue-600 mr-2" />
                  Usuarios Regulares ({regularUsuarios.length})
                </h4>
                {regularUsuarios.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 divide-y">
                    {regularUsuarios.map(usuario => (
                      <div key={usuario._id} className="flex items-center p-3 hover:bg-gray-50">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {usuario.imagenPerfil && usuario.imagenPerfil !== 'default.jpg' ? (
                            <img 
                              src={usuario.imagenPerfil} 
                              alt={usuario.nombre} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-700 text-lg font-medium">
                              {usuario.nombre.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <h5 className="text-sm font-medium text-gray-900">{usuario.nombre}</h5>
                            <span className="ml-2 inline-flex items-center">
                              <FaCircle className={`text-xs ${usuario.enLinea ? 'text-green-500' : 'text-gray-300'}`} />
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{usuario.email}</p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto text-right">
                          <span className="text-xs text-gray-500">
                            {usuario.telefono || 'Sin teléfono'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay usuarios regulares asignados a este local</p>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Pie */}
        <div className="border-t px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalUsersModal; 