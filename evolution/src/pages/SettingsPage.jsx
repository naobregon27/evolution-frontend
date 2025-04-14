import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from '../../node_modules/react-i18next';
import { 
  toggleDarkMode, 
  setLanguage, 
  toggleNotifications, 
  toggleAutoLogout,
  setSessionTimeout,
  updateSettings
} from '../store/reducers/settingsReducer';

const SettingsPage = () => {
  const { t } = useTranslation();
  // Usar el estado global de Redux en lugar del estado local
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  
  // Efecto para debugging
  useEffect(() => {
    console.log("Estado actual de darkMode:", settings.darkMode);
    console.log("Clases en HTML:", document.documentElement.classList.contains('dark') ? 'dark activado' : 'dark desactivado');
  }, [settings.darkMode]);

  // Manejar cambios en toggles (checkboxes)
  const handleToggle = (key) => {
    console.log(`Toggling ${key}, valor actual:`, settings[key]);
    
    switch (key) {
      case 'darkMode':
        dispatch(toggleDarkMode());
        break;
      case 'notificationsEnabled':
        dispatch(toggleNotifications());
        break;
      case 'autoLogout':
        dispatch(toggleAutoLogout());
        break;
      default:
        console.warn(`Toggle para ${key} no implementado`);
    }
  };

  // Manejar cambios en campos select
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'language':
        dispatch(setLanguage(value));
        break;
      case 'sessionTimeout':
        dispatch(setSessionTimeout(parseInt(value, 10)));
        break;
      default:
        console.warn(`Cambio para ${name} no implementado`);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se enviarían los ajustes al backend si es necesario
    dispatch(updateSettings(settings));
    alert('Configuración guardada correctamente');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className={`rounded-lg shadow-md p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-6 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>Configuración del Sistema</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold border-b pb-2 ${settings.darkMode ? 'text-gray-200 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Preferencias Personales</h2>
              
              <div className="flex justify-between items-center py-3">
                <div>
                  <h3 className={`font-medium ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Notificaciones</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recibir notificaciones del sistema</p>
                </div>
                <div className="relative inline-block w-12 align-middle select-none cursor-pointer" onClick={() => handleToggle('notificationsEnabled')}>
                  <input 
                    type="checkbox" 
                    id="notificationsEnabled" 
                    name="notificationsEnabled"
                    checked={settings.notificationsEnabled}
                    onChange={() => {}} // Controlado por el onClick del div padre
                    className="sr-only"
                  />
                  <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${settings.notificationsEnabled ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <div>
                  <h3 className={`font-medium ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Modo Oscuro</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cambiar la apariencia visual de la aplicación</p>
                </div>
                <div className="relative inline-block w-12 align-middle select-none cursor-pointer" onClick={() => handleToggle('darkMode')}>
                  <input 
                    type="checkbox" 
                    id="darkMode" 
                    name="darkMode"
                    checked={settings.darkMode}
                    onChange={() => {}} // Controlado por el onClick del div padre
                    className="sr-only"
                  />
                  <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${settings.darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${settings.darkMode ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div className="py-3">
                <label className={`block font-medium mb-2 ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Idioma del Sistema</label>
                <select 
                  name="language" 
                  value={settings.language}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    settings.darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold border-b pb-2 ${settings.darkMode ? 'text-gray-200 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Seguridad y Sesión</h2>
              
              <div className="flex justify-between items-center py-3">
                <div>
                  <h3 className={`font-medium ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Cierre Automático</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cerrar sesión después de un periodo de inactividad</p>
                </div>
                <div className="relative inline-block w-12 align-middle select-none cursor-pointer" onClick={() => handleToggle('autoLogout')}>
                  <input 
                    type="checkbox" 
                    id="autoLogout" 
                    name="autoLogout"
                    checked={settings.autoLogout}
                    onChange={() => {}} // Controlado por el onClick del div padre
                    className="sr-only"
                  />
                  <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${settings.autoLogout ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${settings.autoLogout ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div className="py-3">
                <label className={`block font-medium mb-2 ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tiempo de Inactividad</label>
                <select 
                  name="sessionTimeout" 
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  disabled={!settings.autoLogout}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    !settings.autoLogout 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : settings.darkMode 
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-900 border-gray-300'
                  }`}
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className={`mt-8 pt-6 border-t ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage; 