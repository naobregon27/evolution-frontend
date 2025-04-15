import React, { useState } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (error) setError('');
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      setError('La contraseña actual es obligatoria');
      return false;
    }
    
    if (!formData.newPassword.trim()) {
      setError('La nueva contraseña es obligatoria');
      return false;
    }
    
    if (!formData.confirmPassword.trim()) {
      setError('Debe confirmar la nueva contraseña');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      console.log('Enviando solicitud para cambiar contraseña...');
      
      // Imprimir información sobre el token actual (sin mostrar el valor completo)
      const token = localStorage.getItem('token');
      console.log('Token disponible:', token ? 'Sí (primeros 10 caracteres: ' + token.substring(0, 10) + '...)' : 'No');
      
      // Intentar obtener información sobre el usuario actual
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('Usuario actual:', { 
            id: user._id || user.id, 
            email: user.email,
            role: user.role
          });
        } catch (e) {
          console.error('Error al parsear usuario del localStorage:', e);
        }
      } else {
        console.log('No hay información de usuario en localStorage');
      }
      
      const response = await authService.changePassword(formData);
      
      console.log('Respuesta exitosa:', response);
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Contraseña cambiada exitosamente');
      
      if (onSuccess) onSuccess();
      
      onClose();
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      
      let errorMessage = 'Error al cambiar la contraseña';
      
      // Extraer mensaje de error de varias posibles estructuras
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Mensajes específicos basados en códigos de error o textos comunes
      if (errorMessage.includes('incorrecta') || errorMessage.includes('incorrect')) {
        errorMessage = 'La contraseña actual es incorrecta';
      } else if (errorMessage.includes('no encontrada') || errorMessage.includes('not found')) {
        errorMessage = 'El servicio de cambio de contraseña no está disponible en este momento';
        console.error('Error 404: Ruta del endpoint incorrecta. Verificar la URL en authService.js');
      } else if (errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
        errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente';
        console.error('Error de autenticación. El token podría haber expirado o ser inválido');
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={loading}
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Contraseña Actual
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              Debe tener al menos 8 caracteres
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cambiando...
                </>
              ) : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 