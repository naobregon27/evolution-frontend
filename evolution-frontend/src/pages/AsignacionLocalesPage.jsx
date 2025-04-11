import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLocales, assignAdminToLocal } from '../store/reducers/localesReducer';
import { toast } from 'react-toastify';
import { FaUser, FaBuilding, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import localesService from '../services/localesService';
import { getAllUsers } from '../services/userService';

// Datos de ejemplo en caso de que la API no esté disponible
const MOCK_USERS = [
  { _id: '1', nombre: 'Juan Pérez', email: 'juan@ejemplo.com', role: 'admin', activo: true },
  { _id: '2', nombre: 'María García', email: 'maria@ejemplo.com', role: 'user', activo: true },
  { _id: '3', nombre: 'Carlos López', email: 'carlos@ejemplo.com', role: 'user', activo: true },
  { _id: '4', nombre: 'Ana Rodríguez', email: 'ana@ejemplo.com', role: 'admin', activo: false }
];

// Servicio para obtener usuarios utilizando la API configurada con axios
const fetchUsers = async (useMockData = false) => {
  if (useMockData) {
    console.log('Usando datos de ejemplo para usuarios');
    return MOCK_USERS;
  }

  try {
    console.log('Obteniendo usuarios desde la API');
    // Usar la función getAllUsers del servicio de usuarios
    const response = await getAllUsers();
    console.log('Respuesta de getAllUsers:', response);
    
    // Verificar que la respuesta sea válida
    if (!response || !response.data) {
      console.error('Estructura de respuesta inesperada:', response);
      return { success: false, error: 'Error al obtener los usuarios, estructura de respuesta inesperada' };
    }

    // Extraer los usuarios de la respuesta - ahora sabemos que están en .data.users
    if (response.data.success && response.data.data && response.data.data.users) {
      // La API está devolviendo los usuarios en data.users
      return {
        success: true,
        data: response.data.data.users
      };
    } else if (response.data.users) {
      // Si los usuarios están directamente en response.data.users
      return {
        success: true,
        data: response.data.users
      };
    } else {
      console.error('Formato de respuesta inesperado:', response.data);
      return { success: false, error: 'Formato de respuesta inesperado' };
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Error desconocido al obtener usuarios' 
    };
  }
};

const AsignacionLocalesPage = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.settings.darkMode);
  const locales = useSelector(state => state.locales.locales);
  const loading = useSelector(state => state.locales.loading);
  const user = useSelector(state => state.auth.user); // Obtener el usuario autenticado
  
  // Inicializamos el estado de users como un array vacío
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState({});
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  // Filtrar usuarios activos
  const activeUsers = useMemo(() => {
    // Verificar que users sea un array antes de aplicar filter
    if (!Array.isArray(users)) {
      console.error('Error: users no es un array', users);
      
      // Si es un objeto con una propiedad users que es array, usamos eso
      if (users && users.users && Array.isArray(users.users)) {
        console.log('Usando users.users para filtrar usuarios activos');
        return users.users.filter(user => user?.activo === true || user?.estado === 'activo');
      }
      
      return [];
    }
    
    // Filtrar usuarios según el campo de activación, que puede variar según la API
    return users.filter(user => 
      user?.activo === true || // Si tiene un campo activo: true
      user?.estado === 'activo' || // Si tiene un campo estado: 'activo'
      (user?.estado !== 'inactivo' && user?.activo !== false) // Si no está explícitamente marcado como inactivo
    );
  }, [users]);

  // Cargar locales al montar el componente
  useEffect(() => {
    dispatch(fetchLocales());
  }, [dispatch]);

  // Función para cargar usuarios (llevada fuera del useEffect para poderla reutilizar)
  const loadUsers = async () => {
    setUsersLoading(true);
    setError(null);
    try {
      const userData = await fetchUsers(useMockData);
      
      if (userData.success && userData.data) {
        // Ahora userData.data debería ser el array de usuarios
        if (Array.isArray(userData.data)) {
          setUsers(userData.data);
          if (userData.data.length === 0) {
            setError('No se encontraron usuarios en la base de datos.');
          }
        } else {
          console.error('fetchUsers devolvió datos en formato inesperado:', userData);
          setUsers([]);
          setError('Error en el formato de datos de usuarios recibidos.');
        }
      } else if (Array.isArray(userData)) {
        // Por si acaso es un array directo (caso de mock data)
        setUsers(userData);
        if (userData.length === 0) {
          setError('No se encontraron usuarios en la base de datos.');
        }
      } else {
        console.error('fetchUsers no devolvió un array ni un objeto válido:', userData);
        setUsers([]);
        setError('Error en el formato de datos de usuarios recibidos.');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError(error.message || 'Error al cargar usuarios');
      setUsers([]); // Asegurar que users sea siempre un array
    } finally {
      setUsersLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    // Solo cargar usuarios si el usuario está autenticado
    if (user) {
      loadUsers();
    } else {
      setError('Debe iniciar sesión para ver los usuarios');
      setUsers([]); // Asegurar que users sea siempre un array
    }
  }, [user, useMockData]);

  // Manejar la selección de un local
  const handleSelectLocal = (local) => {
    // Si ya está seleccionado este local, lo deseleccionamos
    if (selectedLocal && selectedLocal._id === local._id) {
      setSelectedLocal(null);
      setSelectedUsers([]);
      return;
    }
    
    // Si es un local diferente, lo seleccionamos
    setSelectedLocal(local);
    // Al seleccionar un local, limpiamos los usuarios seleccionados previamente
    setSelectedUsers([]);
  };

  // Manejar la selección de un usuario
  const handleSelectUser = (user) => {
    if (!selectedLocal) {
      toast.warning('Primero debe seleccionar un local');
      return;
    }

    // Verificar si el usuario ya está seleccionado
    const isSelected = selectedUsers.length > 0 && 
      (selectedUsers[0].id === user.id || selectedUsers[0]._id === user._id);
    
    if (isSelected) {
      // Si ya está seleccionado, lo deseleccionamos
      setSelectedUsers([]);
    } else {
      // Si no está seleccionado, lo agregamos (solo un usuario a la vez)
      setSelectedUsers([user]);
    }
  };

  // Guardar la asignación
  const handleSaveAssignments = async () => {
    if (!selectedLocal || selectedUsers.length === 0) {
      toast.error('Seleccione un local y un usuario para continuar');
      return;
    }
    
    setSavingAssignments(true);
    
    try {
      // Obtenemos el ID del local y del usuario
      const localId = selectedLocal.id || selectedLocal._id;
      const userId = selectedUsers[0].id || selectedUsers[0]._id;
      
      console.log(`Asignando usuario ${userId} al local ${localId}`);
      
      // Utilizamos el servicio de locales para hacer la asignación
      const response = await localesService.assignAdminToLocal(localId, userId);
      console.log('Respuesta de asignación:', response);
      
      // Mostrar mensaje de éxito
      toast.success(`Usuario asignado correctamente al local ${selectedLocal.nombre}`);
      
      // Primero recargar los datos para reflejar los cambios
      await Promise.all([
        dispatch(fetchLocales()),
        loadUsers()
      ]);
      
      // Luego resetear selecciones cuando ya tenemos los datos actualizados
      setSelectedLocal(null);
      setSelectedUsers([]);
      
    } catch (error) {
      console.error('Error al asignar usuario:', error);
      toast.error(error.response?.data?.message || 'Error al asignar usuario al local');
    } finally {
      setSavingAssignments(false);
    }
  };

  // Recargar usuarios usando la nueva función loadUsers
  const handleReloadUsers = async () => {
    await loadUsers();
    toast.success('Usuarios actualizados correctamente');
  };

  // Alternar entre datos reales y simulados
  const toggleMockData = () => {
    setUseMockData(!useMockData);
    toast.info(useMockData ? 'Cambiando a datos reales' : 'Cambiando a datos simulados');
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-2xl font-bold mb-6">Asignación de Locales</h1>
      
      <div className={`bg-white shadow-md rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
        <div className="mb-6">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
            Administración de Locales y Usuarios
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            En esta sección puedes asignar usuarios a locales específicos y gestionar sus permisos.
          </p>
        </div>

        {loading || usersLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-3">Cargando datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lista de Locales */}
            <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <FaBuilding className="inline mr-2" />
                Locales Disponibles
              </h3>
              
              {locales?.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {locales.map(local => (
                      <li 
                        key={local._id}
                        className={`py-3 px-2 cursor-pointer hover:bg-gray-100 ${
                          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        } ${selectedLocal?._id === local._id ? 
                          (isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100') : ''}
                        `}
                        onClick={() => handleSelectLocal(local)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FaBuilding className={`h-5 w-5 ${selectedLocal?._id === local._id ? 'text-indigo-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{local.nombre}</p>
                            <p className="text-sm text-gray-500">{local.direccion}</p>
                          </div>
                          {selectedLocal?._id === local._id && (
                            <FaCheckCircle className="ml-auto text-green-500" />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No hay locales disponibles
                </div>
              )}
            </div>
            
            {/* Lista de Usuarios */}
            <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <FaUser className="inline mr-2" />
                  Usuarios Disponibles
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={toggleMockData}
                    className={`text-xs px-2 py-1 rounded ${
                      useMockData 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                    }`}
                  >
                    {useMockData ? 'Datos Simulados' : 'Usar Datos Simulados'}
                  </button>
                  <button 
                    onClick={handleReloadUsers}
                    className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center"
                    disabled={usersLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Recargar
                  </button>
                </div>
              </div>
              
              {useMockData && (
                <div className="mb-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs">
                  Usando datos simulados. La asignación real no será posible.
                </div>
              )}
              
              {error ? (
                <div className="text-center py-10">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button 
                    onClick={handleReloadUsers}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-sm"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              ) : users.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {users.map(user => {
                      const userId = user.id || user._id;
                      // Esta es nuestra propia lógica para determinar si un usuario está seleccionado
                      const isSelected = selectedUsers.length > 0 && 
                        (selectedUsers[0].id === userId || selectedUsers[0]._id === userId);
                        
                      return (
                        <li 
                          key={userId}
                          className={`py-3 px-2 cursor-pointer ${
                            isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          } ${isSelected ? (isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100') : ''}
                          `}
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <FaUser className={`h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="ml-3 flex-grow">
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.nombre || user.email}
                              </p>
                              <div className="flex flex-wrap text-xs text-gray-500 gap-1">
                                <span className={`px-1.5 py-0.5 rounded ${
                                  user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                                  user.role === 'superAdmin' ? 'bg-purple-100 text-purple-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.role || 'usuario'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded ${
                                  user.activo === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.activo === true ? 'Activo' : 'Inactivo'}
                                </span>
                                {user.local && (
                                  <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                                    {user.local.nombre || 'Con local'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* NUESTRA PROPIA MARCA VISUAL EXPLÍCITA DE SELECCIÓN */}
                            {isSelected && (
                              <FaCheckCircle className="ml-auto text-green-500" />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No hay usuarios disponibles
                </div>
              )}
            </div>
          </div>
        )}
        
        {selectedLocal && (
          <div className="mt-6">
            <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Resumen de Asignación
            </h3>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center mb-3">
                <FaBuilding className="text-indigo-600 mr-2" />
                <p className="font-medium">Local seleccionado: <span className="text-indigo-600">{selectedLocal.nombre}</span></p>
              </div>
              
              <div className="mb-3">
                <p className="font-medium mb-2">Usuario seleccionado:</p>
                {selectedUsers.length > 0 ? (
                  <div className="bg-white rounded p-3 shadow-sm">
                    {selectedUsers.map(user => (
                      <div key={user.id || user._id} className="flex items-center">
                        <FaUser className="text-indigo-600 mr-2" />
                        <div>
                          <p className="font-medium">{user.nombre || user.email}</p>
                          <div className="flex flex-wrap text-xs text-gray-500 gap-1 mt-1">
                            <span className={`px-1.5 py-0.5 rounded ${
                              user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                              user.role === 'superAdmin' ? 'bg-purple-100 text-purple-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role || 'usuario'}
                            </span>
                            {user.local && (
                              <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                                {user.local.nombre || 'Con local'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Ningún usuario seleccionado</p>
                )}
              </div>
              
              {selectedUsers.length > 0 && selectedUsers[0].local && selectedUsers[0].local.nombre && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Este usuario ya está asignado a <strong>{selectedUsers[0].local.nombre}</strong>. Si continúa, se reasignará al local seleccionado.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-end">
          <button 
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded flex items-center ${
              !selectedLocal || selectedUsers.length === 0 || savingAssignments || useMockData
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
            disabled={!selectedLocal || selectedUsers.length === 0 || savingAssignments || useMockData}
            onClick={handleSaveAssignments}
          >
            {savingAssignments ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaArrowRight className="mr-2" />
                Guardar Asignación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignacionLocalesPage; 