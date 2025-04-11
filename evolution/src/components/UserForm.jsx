import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLocales } from '../store/reducers/localesReducer';

const UserForm = ({ user, onSave, onCancel, loading }) => {
  const dispatch = useDispatch();
  const { locales } = useSelector(state => state.locales);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'usuario',
    local: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar locales cuando el componente se monta
  useEffect(() => {
    dispatch(fetchLocales());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        password: '', // No incluimos la contraseña al editar
        role: user.role || 'usuario',
        local: user.local || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        activo: user.activo !== undefined ? user.activo : true
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar el error del campo que se está editando
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.email) newErrors.email = 'El email es obligatorio';
    
    // Validar email con expresión regular
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato de email no es válido';
    }
    
    // Solo validar contraseña en creación (no en edición)
    if (!user && !formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    
    // Validar formato de contraseña si se proporciona
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Si es edición y no se ha cambiado la contraseña, la eliminamos del objeto
      const dataToSubmit = { ...formData };
      if (user && !formData.password) {
        delete dataToSubmit.password;
      }
      
      // Para teléfono y dirección, mantener valores por defecto si están vacíos
      if (!dataToSubmit.telefono) dataToSubmit.telefono = '0000000000';
      if (!dataToSubmit.direccion) dataToSubmit.direccion = 'Dirección por defecto';
      
      // Solo para creación de nuevo usuario, asegurarse de que activo esté definido
      if (!user) {
        dataToSubmit.activo = true;
      }

      console.log('Datos que se enviarán al servidor:', dataToSubmit);
      
      onSave(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo*
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.nombre ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email*
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {user ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña*'}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rol*
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="usuario">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="superAdmin">Super Administrador</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local (opcional)
          </label>
          <select
            name="local"
            value={formData.local}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.local ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sin local</option>
            {locales && locales.length > 0 ? (
              locales.map((local) => (
                <option key={local._id || local.id} value={local._id || local.id}>
                  {local.nombre || local.name || `Local ${local._id || local.id}`}
                </option>
              ))
            ) : (
              <option value="" disabled>Cargando locales...</option>
            )}
          </select>
          {errors.local && (
            <p className="mt-1 text-sm text-red-600">{errors.local}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono (opcional)
          </label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0000000000"
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección (opcional)
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.direccion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Dirección por defecto"
          />
          {errors.direccion && (
            <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none text-sm sm:text-base"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? 'Guardando...' : user ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserForm; 