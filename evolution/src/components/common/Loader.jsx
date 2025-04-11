import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../../node_modules/react-i18next';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const { t } = useTranslation();
  const isDarkMode = useSelector(state => state.settings?.darkMode);
  
  // Determinar tamaño del spinner
  let sizeClass = 'w-8 h-8';
  if (size === 'small') sizeClass = 'w-5 h-5';
  if (size === 'large') sizeClass = 'w-12 h-12';
  
  // Clases para contenedor basado en si es pantalla completa
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-opacity-75 z-50'
    : 'flex flex-col items-center justify-center p-4';
    
  // Color basado en el modo oscuro
  const spinnerColor = isDarkMode ? 'text-indigo-400' : 'text-indigo-600';
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-700';
  
  return (
    <div className={`${containerClasses} ${fullScreen ? bgColor : ''}`}>
      <div className="flex flex-col items-center">
        <div className={`animate-spin rounded-full border-t-2 border-b-2 ${spinnerColor} ${sizeClass}`}></div>
        <p className={`mt-3 ${textColor} font-medium`}>{t('common.loading')}</p>
      </div>
    </div>
  );
};

export default Loader; 