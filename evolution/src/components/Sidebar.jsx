import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '../store/reducers/settingsReducer';

const Sidebar = ({ userType, userRole, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.settings?.darkMode);
  
  // Usar userRole si está disponible, de lo contrario usar userType para compatibilidad
  const role = userRole || userType;

  // Configuración fija de elementos del menú
  const menuItems = [
    {
      title: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      ),
      path: '/super-admin',
      roles: ['superAdmin', 'admin']
    },
    {
      title: 'Locales',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      ),
      path: '/super-admin/locales',
      roles: ['superAdmin']
    },
    {
      title: 'Asignación Locales',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      path: '/super-admin/asignacion-locales',
      roles: ['superAdmin']
    },
    {
      title: 'Usuarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      path: '/super-admin/users',
      roles: ['superAdmin']
    },
    {
      title: 'Configuración',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      path: '/super-admin/settings',
      roles: ['superAdmin', 'admin']
    },
    {
      title: 'Mi Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      ),
      path: '/super-admin/profile',
      roles: ['superAdmin', 'admin']
    }
  ];

  // Filtrar los elementos del menú según el rol
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role)
  );

  // Clases para el fondo del sidebar
  const sidebarBgClass = isDarkMode 
    ? 'bg-gradient-to-b from-indigo-900 to-indigo-800' 
    : 'bg-gradient-to-b from-indigo-700 to-indigo-800';

  // Clases para botones y efectos hover
  const toggleButtonClass = `${isDarkMode ? 'text-indigo-200' : 'text-indigo-300'} p-1 rounded-full ${isDarkMode ? 'hover:bg-indigo-700' : 'hover:bg-indigo-500'} hover:text-white focus:outline-none ${isCollapsed ? 'w-full flex justify-center' : ''}`;
  const menuItemActiveClass = isDarkMode ? 'bg-indigo-700 text-white font-medium' : 'bg-indigo-500 text-white font-medium';
  const menuItemHoverClass = isDarkMode ? 'text-indigo-200 hover:bg-indigo-700 hover:text-white' : 'text-indigo-100 hover:bg-indigo-600 hover:text-white';
  const borderClass = isDarkMode ? 'border-indigo-700' : 'border-indigo-600';

  // Manejo del clic en el botón de toggle
  const handleToggleSidebar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  // Función para cambiar el modo oscuro
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
    
    // Actualizar clases de HTML y guardar preferencia en localStorage
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <div 
      className={`${sidebarBgClass} text-white transition-all duration-300 ease-in-out h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      } fixed left-0 top-0 z-10`}
    >
      <div className={`flex items-center justify-between h-16 px-4 border-b ${borderClass}`}>
        {!isCollapsed && (
          <h1 className="text-xl font-bold">Evolution CRM</h1>
        )}
        <button 
          onClick={handleToggleSidebar}
          className={toggleButtonClass}
          aria-label="Toggle sidebar"
        >
          <svg 
            className={`w-6 h-6 transform ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
      </div>
      
      <div className="py-4">
        <ul className="space-y-2 px-2">
          {filteredMenuItems.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? menuItemActiveClass 
                    : menuItemHoverClass
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón para cambiar el tema */}
      {!isCollapsed ? (
        <div className={`absolute bottom-4 left-0 right-0 px-4 py-2 border-t ${borderClass}`}>
          <button 
            onClick={handleToggleDarkMode}
            className={`flex items-center w-full px-4 py-2 rounded-lg ${menuItemHoverClass}`}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isDarkMode ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              )}
            </svg>
            <span className="ml-3">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
        </div>
      ) : (
        <div className={`absolute bottom-4 left-0 right-0 flex justify-center py-2 border-t ${borderClass}`}>
          <button 
            onClick={handleToggleDarkMode}
            className={`p-2 rounded-lg ${menuItemHoverClass}`}
            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isDarkMode ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              )}
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 