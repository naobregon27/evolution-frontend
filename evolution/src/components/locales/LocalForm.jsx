import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createLocal, updateLocal } from '../../store/reducers/localesReducer';
import PropTypes from 'prop-types';
import { XIcon } from '@heroicons/react/outline';

const LocalForm = ({ local, onSubmit, onCancel, isProcessing }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.settings.darkMode);
  const loading = useSelector(state => state.locales.loading);
  
  const initialState = {
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    descripcion: '',
    horario: {
      apertura: '09:00',
      cierre: '18:00',
      diasOperacion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    },
    activo: true
  };
  
  const [formData, setFormData] = useState(initialState);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (local) {
      setFormData({
        nombre: local.nombre || '',
        direccion: local.direccion || '',
        telefono: local.telefono || '',
        email: local.email || '',
        descripcion: local.descripcion || '',
        horario: {
          apertura: local.horario?.apertura || '09:00',
          cierre: local.horario?.cierre || '18:00',
          diasOperacion: local.horario?.diasOperacion || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
        },
        activo: local.activo !== undefined ? local.activo : true
      });
      
      setDiasSeleccionados(local.horario?.diasOperacion || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
    } else {
      setFormData(initialState);
      setDiasSeleccionados(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
    }
  }, [local]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handleDiaChange = (dia) => {
    let nuevosDias;
    
    if (diasSeleccionados.includes(dia)) {
      nuevosDias = diasSeleccionados.filter(d => d !== dia);
    } else {
      nuevosDias = [...diasSeleccionados, dia];
    }
    
    setDiasSeleccionados(nuevosDias);
    
    setFormData({
      ...formData,
      horario: {
        ...formData.horario,
        diasOperacion: nuevosDias
      }
    });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{10,}$/.test(formData.telefono.replace(/[-()\s]/g, ''))) {
      newErrors.telefono = 'Ingrese un número de teléfono válido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
    }
    
    if (diasSeleccionados.length === 0) {
      newErrors.diasOperacion = 'Debe seleccionar al menos un día de operación';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (local) {
      dispatch(updateLocal({
        localId: local._id,
        localData: formData
      })).then(result => {
        if (!result.error) {
          onSubmit(formData);
        }
      });
    } else {
      dispatch(createLocal(formData)).then(result => {
        if (!result.error) {
          onSubmit(formData);
        }
      });
    }
  };
  
  const diasDeLaSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {local ? 'Editar Local' : 'Nuevo Local'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className={`p-1 rounded-full ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre*
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' 
                : 'bg-white border-gray-300 focus:border-indigo-500'
            } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            placeholder="Nombre del local"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Dirección*
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' 
                : 'bg-white border-gray-300 focus:border-indigo-500'
            } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            placeholder="Dirección del local"
          />
          {errors.direccion && (
            <p className="mt-1 text-sm text-red-500">{errors.direccion}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Teléfono*
          </label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' 
                : 'bg-white border-gray-300 focus:border-indigo-500'
            } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            placeholder="Teléfono de contacto"
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Email*
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' 
                : 'bg-white border-gray-300 focus:border-indigo-500'
            } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            placeholder="Email de contacto"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows="3"
          className={`w-full px-3 py-2 border rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' 
              : 'bg-white border-gray-300 focus:border-indigo-500'
          } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
          placeholder="Descripción del local"
        ></textarea>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Días de operación*
        </label>
        <div className="flex flex-wrap gap-2">
          {diasDeLaSemana.map((dia) => (
            <label key={dia} className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                checked={diasSeleccionados.includes(dia)}
                onChange={() => handleDiaChange(dia)}
              />
              <span className="ml-2">{dia}</span>
            </label>
          ))}
        </div>
        {errors.diasOperacion && (
          <p className="mt-1 text-sm text-red-500">{errors.diasOperacion}</p>
        )}
      </div>
      
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleCheckboxChange}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <span className="ml-2">Activo</span>
        </label>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Horario de apertura
        </label>
        <input
          type="time"
          name="horario.apertura"
          value={formData.horario.apertura}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' 
              : 'bg-white border-gray-300 focus:border-indigo-500'
          } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
        />
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Horario de cierre
        </label>
        <input
          type="time"
          name="horario.cierre"
          value={formData.horario.cierre}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' 
              : 'bg-white border-gray-300 focus:border-indigo-500'
          } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            local ? 'Actualizar Local' : 'Crear Local'
          )}
        </button>
      </div>
    </form>
  );
};

LocalForm.propTypes = {
  local: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool
};

LocalForm.defaultProps = {
  local: null,
  isProcessing: false
};

export default LocalForm; 