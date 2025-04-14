import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Importar componentes
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';

// Importar servicios
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus 
} from '../services/userService';

// Clave para guardar usuarios en localStorage
const USERS_STORAGE_KEY = 'evolution_crm_users_cache';

const UsersManagement = () => {
  const { isAuthenticated, userRole, token } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Estados para la gestión de usuarios
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);
  const [showConfirmToggle, setShowConfirmToggle] = useState(false);

  // Estado para el token
  const [storedToken, setStoredToken] = useState(localStorage.getItem('token'));
  
  // Estado para indicar si estamos usando datos del cache
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Actualizar el token almacenado cuando cambie
  useEffect(() => {
    const tokenInStorage = localStorage.getItem('token');
    setStoredToken(tokenInStorage);
    console.log('Token actualizado en localStorage:', tokenInStorage ? tokenInStorage.substring(0, 20) + '...' : 'No hay token');
  }, [token]);

  useEffect(() => {
    // Protección de ruta: Si no está autenticado o no es superAdmin, redirigir al login
    if (!isAuthenticated || userRole !== 'superAdmin') {
      console.log('Redirigiendo a login - No autorizado:', { isAuthenticated, userRole });
      navigate('/login');
    } else {
      console.log('Usuario autorizado como superAdmin:', { isAuthenticated, userRole });
      console.log('Token presente en estado de Redux:', token ? token.substring(0, 20) + '...' : 'No');
      console.log('Token en localStorage:', localStorage.getItem('token') ? localStorage.getItem('token').substring(0, 20) + '...' : 'No encontrado');
      
      // Verificar formato de token
      const localToken = localStorage.getItem('token');
      if (localToken) {
        console.log('¿El token comienza con "Bearer "?', localToken.startsWith('Bearer '));
        if (localToken.startsWith('Bearer ')) {
          console.error('ERROR: El token ya incluye el prefijo "Bearer" en localStorage. Corrigiendo...');
          const correctedToken = localToken.replace('Bearer ', '');
          localStorage.setItem('token', correctedToken);
          console.log('Token corregido en localStorage');
        }
      }
      
      // Cargar usuarios al montar el componente
      fetchUsers();
    }
  }, [isAuthenticated, userRole, navigate, token]);

  // Función para obtener usuarios del caché local
  const getUsersFromCache = () => {
    try {
      const cachedUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      if (cachedUsersJson) {
        const cachedUsers = JSON.parse(cachedUsersJson);
        console.log('Usuarios recuperados del caché local:', cachedUsers.length);
        return cachedUsers;
      }
    } catch (e) {
      console.error('Error al recuperar usuarios del caché:', e);
    }
    return null;
  };

  // Función para guardar usuarios en el caché local
  const saveUsersToCache = (usersData) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersData));
      console.log('Usuarios guardados en caché local:', usersData.length);
    } catch (e) {
      console.error('Error al guardar usuarios en caché:', e);
    }
  };

  // Función para cargar todos los usuarios
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    // Primero intentar cargar del caché para tener una respuesta inmediata
    const cachedUsers = getUsersFromCache();
    if (cachedUsers && cachedUsers.length > 0) {
      console.log('Mostrando usuarios desde caché mientras se actualiza del servidor');
      setUsers(cachedUsers);
      setUsingCachedData(true);
    }
    
    try {
      console.log('Iniciando fetchUsers con endpoint /api/admin/users?includeInactive=true...');
      
      // Verificar token antes de la petición
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        throw new Error('No hay token disponible para autenticación');
      }
      
      // Realizar la petición al endpoint específico
      const response = await getAllUsers();
      console.log('Respuesta completa de getAllUsers:', response);
      
      // Extraer los datos según la estructura específica de la API
      let userData = [];
      
      if (response && response.data) {
        console.log('Estructura de la respuesta:', typeof response.data);
        console.log('Claves en response.data:', Object.keys(response.data).join(', '));
        
        // Verificación específica para estructura {success: true, data: { users: [...] }}
        if (response.data.success && response.data.data && response.data.data.users) {
          userData = response.data.data.users;
          console.log('Datos encontrados en response.data.data.users:', userData.length);
        }
        // Verificación específica para estructura {success: true, data: [...]}
        else if (response.data.success && Array.isArray(response.data.data)) {
          userData = response.data.data;
          console.log('Datos encontrados en response.data.data:', userData.length);
        }
        // Diferentes posibilidades según la estructura de la API
        else if (Array.isArray(response.data)) {
          userData = response.data;
          console.log('Datos encontrados como array directo:', userData.length);
        } 
        else if (response.data.users && Array.isArray(response.data.users)) {
          userData = response.data.users;
          console.log('Datos encontrados en response.data.users:', userData.length);
        } 
        else if (response.data.usuarios && Array.isArray(response.data.usuarios)) {
          userData = response.data.usuarios;
          console.log('Datos encontrados en response.data.usuarios:', userData.length);
        }
        else {
          // Si la estructura no coincide con los patrones esperados, intentar encontrar un array en alguna propiedad
          const keys = Object.keys(response.data);
          for (const key of keys) {
            if (Array.isArray(response.data[key])) {
              userData = response.data[key];
              console.log(`Datos encontrados en response.data.${key}:`, userData.length);
              break;
            }
            
            // Buscar también en subobjetos
            if (typeof response.data[key] === 'object' && response.data[key] !== null) {
              const subKeys = Object.keys(response.data[key]);
              for (const subKey of subKeys) {
                if (Array.isArray(response.data[key][subKey])) {
                  userData = response.data[key][subKey];
                  console.log(`Datos encontrados en response.data.${key}.${subKey}:`, userData.length);
                  break;
                }
              }
            }
          }
          
          // Si aún no encontramos un array, podría ser que la respuesta es un solo objeto de usuario
          if (userData.length === 0 && typeof response.data === 'object' && !Array.isArray(response.data)) {
            if (response.data._id || response.data.id) {
              userData = [response.data];
              console.log('Un solo usuario encontrado en la respuesta');
            } else {
              console.error('No se encontraron datos de usuarios en la respuesta');
            }
          }
        }
        
        // Mostrar muestra del primer usuario si hay datos
        if (userData.length > 0) {
          console.log('Muestra del primer usuario:', userData[0]);
          console.log('Campos disponibles:', Object.keys(userData[0]).join(', '));
          
          // Asegurarse de que todos los usuarios tengan campo activo definido
          userData = userData.map(user => ({
            ...user,
            activo: user.activo !== undefined ? user.activo : 
                   user.active !== undefined ? user.active : 
                   user.isActive !== undefined ? user.isActive : 
                   true // valor por defecto
          }));
          
          console.log('Usuarios después de normalizar campo activo:', userData.length);
          
          // Combinar con los usuarios en caché para asegurarnos de incluir usuarios inactivos
          if (cachedUsers && cachedUsers.length > 0) {
            // Obtener IDs de usuarios del servidor
            const serverUserIds = userData.map(user => user._id || user.id);
            
            // Agregar usuarios del caché que no están en la respuesta del servidor (posiblemente inactivos)
            const missingUsers = cachedUsers.filter(cachedUser => {
              const cachedUserId = cachedUser._id || cachedUser.id;
              return !serverUserIds.includes(cachedUserId);
            });
            
            if (missingUsers.length > 0) {
              console.log(`Se encontraron ${missingUsers.length} usuarios en caché que no están en la respuesta del servidor`);
              userData = [...userData, ...missingUsers];
              console.log('Total de usuarios después de combinar:', userData.length);
            }
          }
          
          // Guardar en cache local para uso futuro
          saveUsersToCache(userData);
        } else {
          console.warn('No se encontraron usuarios en la respuesta');
          
          // Si no hay usuarios en la respuesta pero tenemos caché, mantener el caché
          if (cachedUsers && cachedUsers.length > 0) {
            console.log('Usando datos de caché porque no hay datos del servidor');
            userData = cachedUsers;
            setUsingCachedData(true);
          }
        }
        
        setUsers(userData);
        setUsingCachedData(false);
      } else {
        console.error('Respuesta sin datos:', response);
        
        // Si no hay respuesta válida pero tenemos caché, mantener el caché
        if (cachedUsers && cachedUsers.length > 0) {
          console.log('Manteniendo datos de caché porque la respuesta del servidor no tiene datos');
          setUsingCachedData(true);
        } else {
          setError('No se recibieron datos de usuarios del servidor');
        }
      }
    } catch (error) {
      console.error('Error en fetchUsers:', error);
      
      // Si hay un error pero tenemos caché, mantener el caché
      if (cachedUsers && cachedUsers.length > 0) {
        console.log('Usando datos de caché debido a error en la solicitud al servidor');
        setUsingCachedData(true);
      } else {
        if (error.response) {
          console.error('Estado de respuesta:', error.response.status);
          console.error('Datos de respuesta:', error.response.data);
          
          // Mensaje más específico según el código de estado
          if (error.response.status === 401) {
            setError('Error de autenticación: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            // Redireccionar si hay error de autenticación
            localStorage.removeItem('token');
            navigate('/login');
          } else if (error.response.status === 403) {
            setError('Error de autorización: No tienes permiso para acceder a estos datos.');
          } else {
            setError(`Error del servidor (${error.response.status}): ${error.response.data?.message || 'Error desconocido'}`);
          }
        } else {
          setError('Error al cargar los usuarios. Detalles: ' + (error.message || 'Error desconocido'));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para gestión de usuarios
  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  // Función para editar usuario con validación de estructura
  const handleEditUser = (user) => {
    console.log('Editando usuario:', user);
    
    // Obtener el ID del usuario (nuestro backend usa 'id' no '_id')
    if (!user._id && !user.id) {
      console.error('No se pudo encontrar un ID válido para el usuario', user);
      setError('Error: No se pudo identificar el usuario a editar');
      return;
    }
    
    // Si no tiene _id, añadirlo para compatibilidad
    if (!user._id && user.id) {
      user._id = user.id;
    }
    
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Función para eliminar usuario con validación de estructura
  const handleDeleteUser = (user) => {
    console.log('Preparando eliminación de usuario:', user);
    
    // Obtener el ID del usuario (nuestro backend usa 'id' no '_id')
    if (!user._id && !user.id) {
      console.error('No se pudo encontrar un ID válido para el usuario', user);
      setError('Error: No se pudo identificar el usuario a eliminar');
      return;
    }
    
    // Si no tiene _id, añadirlo para compatibilidad
    if (!user._id && user.id) {
      user._id = user.id;
    }
    
    // Si el usuario no tiene nombre, intentar encontrar un nombre alternativo
    if (!user.nombre) {
      user.nombre = user.name || user.username || 'Usuario sin nombre';
    }
    
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  // Función para activar/desactivar usuario con validación de estructura
  const handleToggleUserStatus = (user) => {
    console.log('Preparando cambio de estado para usuario:', user);
    
    // Obtener el ID del usuario (nuestro backend usa 'id' no '_id')
    if (!user._id && !user.id) {
      console.error('No se pudo encontrar un ID válido para el usuario', user);
      setError('Error: No se pudo identificar el usuario para cambiar su estado');
      return;
    }
    
    // Si no tiene _id, añadirlo para compatibilidad
    if (!user._id && user.id) {
      user._id = user.id;
    }
    
    // Si el usuario no tiene activo, intentar encontrar un estado alternativo
    if (user.activo === undefined) {
      user.activo = user.active || user.isActive || user.status === 'active';
      console.log('Usando estado alternativo:', user.activo);
    }
    
    // Si el usuario no tiene nombre, intentar encontrar un nombre alternativo
    if (!user.nombre) {
      user.nombre = user.name || user.username || 'Usuario sin nombre';
    }
    
    setUserToToggle(user);
    setShowConfirmToggle(true);
  };

  // Funciones para manejar acciones en modales
  const handleUserSubmit = async (userData) => {
    setIsLoading(true);
    try {
      console.log('Procesando envío de datos de usuario:', userData);
      
      // Asegurarse de que el usuario tenga los campos requeridos
      if (!userData.email) {
        throw new Error('El email es obligatorio');
      }
      
      if (selectedUser) {
        // Actualizar usuario existente
        // Obtener ID del usuario - puede estar en _id o id
        const userId = selectedUser._id || selectedUser.id;
        if (!userId) {
          throw new Error('No se pudo identificar el ID del usuario a actualizar');
        }
        
        console.log(`Actualizando usuario con ID ${userId}:`, userData);
        const response = await updateUser(userId, userData);
        console.log('Usuario actualizado:', response);
      } else {
        // Crear nuevo usuario
        console.log('Creando nuevo usuario:', userData);
        const response = await createUser(userData);
        console.log('Usuario creado:', response);
      }
      
      setShowUserModal(false);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error en handleUserSubmit:', error);
      
      // Proporcionar un mensaje de error más específico si está disponible
      if (error.response && error.response.data) {
        let errorMessage = '';
        
        // Extraer mensajes de error del formato del backend
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          // Si hay un array de errores, mostrar todos en una lista
          errorMessage = error.response.data.errors.map(err => 
            err.msg || err.message || JSON.stringify(err)
          ).join(', ');
        } else if (error.response.data.message) {
          // Mensaje de error único
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          // Formato alternativo de mensaje de error
          errorMessage = error.response.data.error;
        } else {
          // Si no se puede extraer un mensaje específico, usar el mensaje genérico
          errorMessage = error.message;
        }
        
        setError(`Error al ${selectedUser ? 'actualizar' : 'crear'} el usuario: ${errorMessage}`);
      } else {
        setError(`Error al ${selectedUser ? 'actualizar' : 'crear'} el usuario: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsLoading(true);
    try {
      // Obtener ID del usuario - puede estar en _id o id
      const userId = userToDelete._id || userToDelete.id;
      if (!userId) {
        throw new Error('No se pudo identificar el ID del usuario a eliminar');
      }
      
      console.log(`Eliminando usuario con ID ${userId}`);
      const response = await deleteUser(userId);
      console.log('Usuario eliminado con éxito, respuesta:', response);
      
      setShowConfirmDelete(false);
      setUserToDelete(null);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error detallado en confirmDeleteUser:', error);
      
      // Proporcionar un mensaje de error más específico si está disponible
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.message || error.response.data.error || error.message;
        setError(`Error al eliminar el usuario: ${errorMsg}`);
      } else {
        setError(`Error al eliminar el usuario: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    
    setIsLoading(true);
    setError(null); // Limpiar errores anteriores
    
    try {
      // Obtener ID del usuario - puede estar en _id o id
      let userId = userToToggle._id || userToToggle.id;
      
      // Validar que el ID sea una cadena de texto válida
      if (!userId) {
        throw new Error('No se pudo identificar el ID del usuario para cambiar su estado');
      }
      
      // Convertir a string y eliminar espacios en blanco
      userId = userId.toString().trim();
      
      console.log(`Procesando cambio de estado para usuario con ID: ${userId}`);
      console.log(`Información del usuario:`, JSON.stringify(userToToggle, null, 2));
      
      // Determinar el estado actual y el nuevo estado
      const currentStatus = typeof userToToggle.activo !== 'undefined' 
        ? userToToggle.activo 
        : userToToggle.active || userToToggle.isActive || false;
        
      const newStatus = !currentStatus;
      console.log(`Cambiando estado de: ${currentStatus} a: ${newStatus}`);
      
      // Llamar a la función correcta con los parámetros adecuados
      const response = await toggleUserStatus(userId, newStatus);
      
      if (response && response.success) {
        console.log('Estado de usuario actualizado con éxito:', response);
        
        // Actualizar el usuario localmente en la lista de usuarios
        const updatedUsers = users.map(user => {
          // Comparar IDs teniendo en cuenta diferentes formatos posibles
          const compareIds = (id1, id2) => {
            if (!id1 || !id2) return false;
            
            // Convertir a string y eliminar espacios
            const str1 = id1.toString().trim();
            const str2 = id2.toString().trim();
            
            // Comparación directa
            if (str1 === str2) return true;
            
            // Buscar un patrón de ObjectId en ambos strings
            const extractObjectId = (str) => {
              const match = str.match(/([0-9a-f]{24})/i);
              return match ? match[1] : null;
            };
            
            const objId1 = extractObjectId(str1);
            const objId2 = extractObjectId(str2);
            
            // Si ambos tienen un ObjectId válido, comparar esos
            if (objId1 && objId2) {
              return objId1 === objId2;
            }
            
            return false;
          };
          
          // Identificar el usuario correcto por su ID (comparando cualquier formato)
          if (compareIds(user._id, userId) || compareIds(user.id, userId)) {
            // Crear una copia del usuario con su estado actualizado
            return {
              ...user,
              activo: newStatus
            };
          }
          return user;
        });
        
        // Actualizar estado y caché
        setUsers(updatedUsers);
        saveUsersToCache(updatedUsers);
        
        setShowConfirmToggle(false);
        setUserToToggle(null);
      } else {
        throw new Error('La respuesta del servidor no indica éxito en la operación');
      }
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      
      let errorMessage = 'Error al cambiar el estado del usuario';
      
      // Extraer mensaje específico del error si existe
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = `Error: ${error.response.data.message}`;
        } else if (error.response.data.error) {
          errorMessage = `Error: ${error.response.data.error}`;
        }
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      
      // Cerrar el modal en caso de error para evitar confusión
      setShowConfirmToggle(false);
      setUserToToggle(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <div className="flex flex-col sm:flex-row items-end gap-2">
            {usingCachedData && (
              <span className="text-amber-600 text-xs">
                Usando datos en caché. Algunos usuarios podrían no estar actualizados.
              </span>
            )}
            <button
              onClick={handleCreateUser}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Crear Usuario
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {isLoading && !showUserModal && !showConfirmDelete && !showConfirmToggle ? (
          <div className="text-center py-8 sm:py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="text-center py-6 sm:py-10 bg-gray-50 rounded-lg mb-4 sm:mb-6 px-3 sm:px-6">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No hay usuarios para mostrar</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  No se encontraron usuarios en la base de datos. Puedes crear un nuevo usuario haciendo clic en el botón "Crear Usuario".
                </p>
                <button
                  onClick={handleCreateUser}
                  className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-flex items-center text-sm sm:text-base"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Crear Primer Usuario
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:-mx-0">
                <UserTable
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onToggleStatus={handleToggleUserStatus}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modales */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        onSave={handleUserSubmit}
        loading={isLoading}
      />
      
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDeleteUser}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={isLoading}
        type="danger"
      />
      
      <ConfirmDialog
        isOpen={showConfirmToggle}
        onClose={() => setShowConfirmToggle(false)}
        onConfirm={confirmToggleStatus}
        title={userToToggle?.activo ? "Desactivar Usuario" : "Activar Usuario"}
        message={`¿Estás seguro de que deseas ${userToToggle?.activo ? 'desactivar' : 'activar'} a ${userToToggle?.nombre}?`}
        confirmLabel={userToToggle?.activo ? "Desactivar" : "Activar"}
        loading={isLoading}
        type={userToToggle?.activo ? "warning" : "info"}
      />
    </div>
  );
};

export default UsersManagement;