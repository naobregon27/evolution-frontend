import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { SearchIcon } from '@heroicons/react/outline';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle 
} from 'react-icons/fa';
import Loader from '../common/Loader';

const LocalesList = ({ locales, loading, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const isDarkMode = useSelector(state => state.settings.darkMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('todos');

  // Filtrar locales por el término de búsqueda y por estado activo/inactivo
  const filteredLocales = locales.filter(local => {
    const matchesSearch = local.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          local.direccion.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentFilter === 'todos') return matchesSearch;
    if (currentFilter === 'activos') return matchesSearch && local.activo;
    if (currentFilter === 'inactivos') return matchesSearch && !local.activo;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader />
      </div>
    );
  }

  if (!locales || locales.length === 0) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <p className="text-lg">{t('locales.no_locales')}</p>
        <p className="mt-2">{t('locales.add_new_instruction')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder={t('locales.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            } w-full`}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentFilter('todos')}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentFilter === 'todos' 
                ? 'bg-indigo-600 text-white' 
                : isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {t('locales.filters.all')}
          </button>
          <button
            onClick={() => setCurrentFilter('activos')}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentFilter === 'activos' 
                ? 'bg-indigo-600 text-white' 
                : isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {t('locales.filters.active')}
          </button>
          <button
            onClick={() => setCurrentFilter('inactivos')}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentFilter === 'inactivos' 
                ? 'bg-indigo-600 text-white' 
                : isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {t('locales.filters.inactive')}
          </button>
        </div>
      </div>
      
      {filteredLocales.length === 0 ? (
        <div className={`text-center py-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <p className="text-lg">{t('locales.no_results')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  {t('locales.table.name')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  {t('locales.table.address')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  {t('locales.table.phone')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  {t('locales.table.email')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  {t('locales.table.status')}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredLocales.map((local) => (
                <tr 
                  key={local._id || local.id} 
                  className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium">{local.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-xs">{local.direccion}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {local.telefono}
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-xs">{local.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {local.activo ? (
                        <>
                          <FaCheckCircle className="text-green-500 mr-2" />
                          <span>{t('users.active')}</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-red-500 mr-2" />
                          <span>{t('users.inactive')}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onView(local)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title={t('locales.actions.view_details')}
                      >
                        <FaEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(local)}
                        className="text-blue-600 hover:text-blue-900"
                        title={t('common.edit')}
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(local)}
                        className="text-red-600 hover:text-red-900"
                        title={t('common.delete')}
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

LocalesList.propTypes = {
  locales: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default LocalesList; 