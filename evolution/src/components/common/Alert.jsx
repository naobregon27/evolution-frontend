import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

const Alert = ({ 
  type = 'info',  // info, success, warning, error
  message, 
  duration = 5000,
  onClose,
  isVisible = true,
  showIcon = true,
  showDismiss = true
}) => {
  const isDarkMode = useSelector(state => state.settings?.darkMode);
  const [visible, setVisible] = useState(isVisible);
  
  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);
  
  useEffect(() => {
    if (duration && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);
  
  // Manejar el cierre
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  if (!visible) return null;
  
  // Configuración de colores basada en el tipo
  let config = {
    bg: '',
    border: '',
    text: '',
    icon: null,
  };
  
  switch (type) {
    case 'success':
      config = {
        bg: isDarkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-100',
        border: isDarkMode ? 'border-green-700' : 'border-green-400',
        text: isDarkMode ? 'text-green-400' : 'text-green-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )
      };
      break;
    case 'warning':
      config = {
        bg: isDarkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-100',
        border: isDarkMode ? 'border-yellow-700' : 'border-yellow-400',
        text: isDarkMode ? 'text-yellow-400' : 'text-yellow-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        )
      };
      break;
    case 'error':
      config = {
        bg: isDarkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-100',
        border: isDarkMode ? 'border-red-700' : 'border-red-400',
        text: isDarkMode ? 'text-red-400' : 'text-red-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )
      };
      break;
    default: // info
      config = {
        bg: isDarkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-100',
        border: isDarkMode ? 'border-blue-700' : 'border-blue-400',
        text: isDarkMode ? 'text-blue-400' : 'text-blue-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )
      };
  }
  
  return (
    <div 
      className={`p-4 mb-4 rounded-lg border ${config.bg} ${config.border} ${config.text}`}
      role="alert"
    >
      <div className="flex items-center">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            {config.icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm font-medium">
            {message}
          </div>
        </div>
        {showDismiss && (
          <div className="flex-shrink-0 ml-auto">
            <button
              type="button"
              className={`rounded-md inline-flex focus:outline-none ${config.text}`}
              onClick={handleClose}
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  isVisible: PropTypes.bool,
  showIcon: PropTypes.bool,
  showDismiss: PropTypes.bool
};

export default Alert; 