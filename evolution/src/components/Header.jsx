import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const Header = ({ user, onLogout }) => {
  const isDarkMode = useSelector(state => state.settings?.darkMode);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Definir las clases de color para el header - Color fijo para que coincida con la interfaz
  const headerBgClass = 'bg-indigo-600 text-white';

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className={`sticky top-0 z-30 shadow-md ${headerBgClass} w-full`}>
      <div className="py-3 px-4 md:px-6">
        {/* Diseño para escritorio */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Evolution CRM</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2">Usuario:</span>
              <span className="font-medium">{user?.email || 'Usuario'}</span>
            </div>
            
            <button 
              onClick={onLogout}
              className="px-4 py-2 rounded-md bg-indigo-800 hover:bg-indigo-900 text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Diseño para móvil */}
        <div className="flex md:hidden justify-between items-center">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Evolution CRM</h2>
          </div>
          
          <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Menú desplegable para móvil */}
        {showMobileMenu && (
          <div className="mt-3 py-3 border-t border-indigo-400 md:hidden">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center py-2">
                <span className="mr-2">Usuario:</span>
                <span className="font-medium">{user?.email || 'Usuario'}</span>
              </div>
              
              <button 
                onClick={onLogout}
                className="w-full px-4 py-2 text-left rounded-md bg-indigo-800 hover:bg-indigo-900 text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 