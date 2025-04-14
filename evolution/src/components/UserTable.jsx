import React from 'react';

const UserTable = ({ users, onEdit, onDelete, onToggleStatus }) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No hay usuarios para mostrar.</p>
      </div>
    );
  }

  // Función auxiliar para obtener valores de diferentes posibles nombres de campo
  const getField = (user, fieldOptions, defaultValue = '') => {
    for (const field of fieldOptions) {
      if (user[field] !== undefined) {
        return user[field];
      }
    }
    return defaultValue;
  };

  // Función para obtener el valor de un objeto anidado
  const getNestedField = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;
    
    // Si el campo es un objeto, extraer el valor de nombre o id
    if (typeof obj === 'object' && obj !== null) {
      if (obj.nombre) return obj.nombre;
      if (obj.name) return obj.name;
      if (obj.id) return obj.id;
      return defaultValue;
    }
    
    // Si es un string o número, devolverlo directamente
    return obj.toString();
  };

  // Formatear fecha para mostrar
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

  // Validar estructura de datos para mostrar información en consola
  console.log('Renderizando UserTable con datos:', users);
  if (users.length > 0) {
    const firstUser = users[0];
    console.log('Primer usuario:', firstUser);
    console.log('Campos disponibles:', Object.keys(firstUser).join(', '));
  }

  // Vista para escritorio: tabla completa
  const desktopView = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Local
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Último Acceso
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user, index) => {
            // Obtener valores de diferentes posibles nombres de campo
            const id = getField(user, ['_id', 'id', 'userId'], `user-${index}`);
            
            // Obtener un ID limpio en formato ObjectId de MongoDB si existe
            const getCleanMongoId = (idValue) => {
              if (!idValue) return null;
              const idStr = idValue.toString().trim();
              // Si ya es un ObjectId válido (24 caracteres hexadecimales)
              if (/^[0-9a-f]{24}$/i.test(idStr)) {
                return idStr;
              }
              // Buscar un patrón de ObjectId dentro del string
              const match = idStr.match(/([0-9a-f]{24})/i);
              return match ? match[1] : idStr;
            };
            
            // Asegurarse de que el usuario tenga un ID válido en formato ObjectId
            const mongoId = getCleanMongoId(id);
            user._id = mongoId; // Asignar el ID limpio al objeto usuario
            
            const nombre = getField(user, ['nombre', 'name', 'username'], 'Usuario');
            const email = getField(user, ['email', 'correo'], 'Sin email');
            const role = getField(user, ['role', 'rol', 'userRole'], 'usuario');
            
            // Manejar campos anidados como local (que puede ser un objeto o un string)
            let localValue = 'Sin asignar';
            
            // Verificar si el usuario tiene la propiedad locales (array)
            if (user.locales && Array.isArray(user.locales) && user.locales.length > 0) {
              // Mostrar todos los nombres de locales separados por coma
              localValue = user.locales.map(local => 
                local.nombre || local.name || local.id || 'Local sin nombre'
              ).join(', ');
            } 
            // Verificar si existe primaryLocal
            else if (user.primaryLocal && typeof user.primaryLocal === 'object') {
              localValue = user.primaryLocal.nombre || user.primaryLocal.name || user.primaryLocal.id || 'Local principal';
            }
            // Verificar la propiedad local tradicional
            else if (user.local) {
              if (typeof user.local === 'object' && user.local !== null) {
                localValue = user.local.nombre || user.local.name || user.local.id || 'Local asignado';
            } else {
                localValue = user.local;
              }
            }
            
            const imagenPerfil = getField(user, ['imagenPerfil', 'profileImage', 'avatar'], 'default.jpg');
            const ultimoLogin = getField(user, ['ultimoLogin', 'lastLogin', 'lastAccess', 'ultimaConexion'], null);
            const isActive = getField(user, ['activo', 'active', 'isActive', 'status'], true);
            
            // Convertir isActive a booleano si viene como string
            const activo = typeof isActive === 'string' 
              ? isActive.toLowerCase() === 'true' || isActive === '1' 
              : Boolean(isActive);
            
            // Asignar el estado activo al usuario para que esté disponible en las acciones
            user.activo = activo;

            // URL de la imagen de perfil (con manejo de ruta relativa o absoluta)
            const imageUrl = imagenPerfil.startsWith('http') 
              ? imagenPerfil 
              : `/assets/profiles/${imagenPerfil}`;

            return (
              <tr key={mongoId || id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                      {imagenPerfil !== 'default.jpg' ? (
                        <img src={imageUrl} alt={nombre} className="h-10 w-10 object-cover" />
                      ) : (
                        <div className="bg-indigo-100 h-10 w-10 flex items-center justify-center rounded-full">
                          <span className="text-indigo-700 font-medium">
                            {nombre.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{nombre}</div>
                      <div className="text-sm text-gray-500">{email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${role === 'superAdmin' ? 'bg-purple-100 text-purple-800' : 
                      role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {role === 'superAdmin' ? 'Super Admin' : 
                     role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {localValue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(ultimoLogin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        console.log('Usuario a cambiar estado:', { 
                          id, 
                          mongoId, 
                          _id: user._id, 
                          nombre, 
                          activo
                        });
                        onToggleStatus(user);
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium focus:outline-none 
                        ${activo ? 
                          'bg-amber-100 text-amber-700 hover:bg-amber-200' : 
                          'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-xs font-medium focus:outline-none"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium focus:outline-none"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Vista para móvil: tarjetas
  const mobileView = () => (
    <div className="md:hidden space-y-4 px-3">
      {users.map((user, index) => {
        // Obtener valores de diferentes posibles nombres de campo
        const id = getField(user, ['_id', 'id', 'userId'], `user-${index}`);
        
        // Obtener un ID limpio en formato ObjectId de MongoDB si existe
        const getCleanMongoId = (idValue) => {
          if (!idValue) return null;
          const idStr = idValue.toString().trim();
          // Si ya es un ObjectId válido (24 caracteres hexadecimales)
          if (/^[0-9a-f]{24}$/i.test(idStr)) {
            return idStr;
          }
          // Buscar un patrón de ObjectId dentro del string
          const match = idStr.match(/([0-9a-f]{24})/i);
          return match ? match[1] : idStr;
        };
        
        // Asegurarse de que el usuario tenga un ID válido en formato ObjectId
        const mongoId = getCleanMongoId(id);
        user._id = mongoId; // Asignar el ID limpio al objeto usuario
        
        const nombre = getField(user, ['nombre', 'name', 'username'], 'Usuario');
        const email = getField(user, ['email', 'correo'], 'Sin email');
        const role = getField(user, ['role', 'rol', 'userRole'], 'usuario');
        
        // Manejar campos anidados como local
        let localValue = 'Sin asignar';
        
        // Verificar si el usuario tiene la propiedad locales (array)
        if (user.locales && Array.isArray(user.locales) && user.locales.length > 0) {
          // Mostrar todos los nombres de locales separados por coma
          localValue = user.locales.map(local => 
            local.nombre || local.name || local.id || 'Local sin nombre'
          ).join(', ');
        } 
        // Verificar si existe primaryLocal
        else if (user.primaryLocal && typeof user.primaryLocal === 'object') {
          localValue = user.primaryLocal.nombre || user.primaryLocal.name || user.primaryLocal.id || 'Local principal';
        }
        // Verificar la propiedad local tradicional
        else if (user.local) {
          if (typeof user.local === 'object' && user.local !== null) {
            localValue = user.local.nombre || user.local.name || user.local.id || 'Local asignado';
        } else {
            localValue = user.local;
          }
        }
        
        const imagenPerfil = getField(user, ['imagenPerfil', 'profileImage', 'avatar'], 'default.jpg');
        const ultimoLogin = getField(user, ['ultimoLogin', 'lastLogin', 'lastAccess', 'ultimaConexion'], null);
        const isActive = getField(user, ['activo', 'active', 'isActive', 'status'], true);
        
        // Convertir isActive a booleano si viene como string
        const activo = typeof isActive === 'string' 
          ? isActive.toLowerCase() === 'true' || isActive === '1' 
          : Boolean(isActive);
          
        // Asignar el estado activo al usuario para que esté disponible en las acciones
        user.activo = activo;

        // URL de la imagen de perfil
        const imageUrl = imagenPerfil.startsWith('http') 
          ? imagenPerfil 
          : `/assets/profiles/${imagenPerfil}`;

        return (
          <div key={mongoId || id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center p-4 border-b border-gray-100">
              <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden">
                {imagenPerfil !== 'default.jpg' ? (
                  <img src={imageUrl} alt={nombre} className="h-12 w-12 object-cover" />
                ) : (
                  <div className="bg-indigo-100 h-12 w-12 flex items-center justify-center rounded-full">
                    <span className="text-indigo-700 font-medium text-lg">
                      {nombre.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="font-medium text-gray-900">{nombre}</div>
                <div className="text-sm text-gray-500">{email}</div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                ${activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            
            <div className="px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Rol:</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${role === 'superAdmin' ? 'bg-purple-100 text-purple-800' : 
                    role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {role === 'superAdmin' ? 'Super Admin' : 
                   role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Local:</span>
                <span className="text-gray-800">{localValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Último acceso:</span>
                <span className="text-gray-800 text-xs">{formatDate(ultimoLogin)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between">
              <button
                onClick={() => {
                  console.log('Usuario a cambiar estado (móvil):', { 
                    id, 
                    mongoId, 
                    _id: user._id, 
                    nombre, 
                    activo
                  });
                  onToggleStatus(user);
                }}
                className={`px-3 py-1 rounded text-xs font-medium focus:outline-none 
                  ${activo ? 
                    'bg-amber-100 text-amber-700 hover:bg-amber-200' : 
                    'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {activo ? 'Desactivar' : 'Activar'}
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(user)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-xs font-medium focus:outline-none"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(user)}
                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium focus:outline-none"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Vista para dispositivos móviles y escritorio */}
      {mobileView()}
      {desktopView()}
    </div>
  );
};

export default UserTable; 