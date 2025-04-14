import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLocales, 
  fetchLocalById, 
  changeLocalStatus, 
  fetchLocalUsers, 
  resetLocalesState,
  createLocal,
  updateLocal,
  deleteLocal
} from '../store/reducers/localesReducer';
import LocalForm from '../components/locales/LocalForm';
import LocalDetails from '../components/locales/LocalDetails';
import LocalUsersModal from '../components/locales/LocalUsersModal';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUsers } from 'react-icons/fa';
import { PlusIcon, ExclamationIcon } from '@heroicons/react/outline';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import LocalesList from '../components/locales/LocalesList';
import { getUsersByLocalId } from '../services/userService';

// Datos de prueba para mostrar mientras se soluciona el problema con la API
const MOCK_LOCALES = [
  {
    _id: '1',
    nombre: 'Local Centro',
    direccion: 'Av. Rivadavia 1234',
    telefono: '1145678901',
    email: 'centro@locales.com',
    descripcion: 'Local en el centro de la ciudad',
    activo: true
  },
  {
    _id: '2',
    nombre: 'Local Norte',
    direccion: 'Av. Cabildo 4567',
    telefono: '1156789012',
    email: 'norte@locales.com',
    descripcion: 'Local en la zona norte',
    activo: true
  },
  {
    _id: '3',
    nombre: 'Local Sur',
    direccion: 'Av. Sáenz 7890',
    telefono: '1167890123',
    email: 'sur@locales.com',
    descripcion: 'Local en la zona sur',
    activo: false
  }
];

const LocalesPage = () => {
  const dispatch = useDispatch();
  
  // Obtener estados del Redux store con selectores optimizados
  const isDarkMode = useSelector(state => state.settings.darkMode);
  const locales = useSelector(state => state.locales.locales);
  const selectedLocal = useSelector(state => state.locales.selectedLocal);
  const localUsers = useSelector(state => state.locales.localUsers);
  const loading = useSelector(state => state.locales.loading);
  const error = useSelector(state => state.locales.error);
  const success = useSelector(state => state.locales.success);
  const message = useSelector(state => state.locales.message);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editingLocal, setEditingLocal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [useMockData, setUseMockData] = useState(false);
  const [mockLocales, setMockLocales] = useState(MOCK_LOCALES);
  
  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('nombre');
  const [filteredLocales, setFilteredLocales] = useState([]);
  
  // Estados para el modal de usuarios
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedLocalForUsers, setSelectedLocalForUsers] = useState(null);
  const [localUsersData, setLocalUsersData] = useState({ usuarios: [], stats: {} });
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [localesPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchLocales()).unwrap();
      } catch (err) {
        console.error("Error al cargar los locales:", err);
        setUseMockData(true);
        toast.error("No se pudieron cargar los datos reales. Mostrando datos de ejemplo.");
      }
    };
    
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(message);
      dispatch(resetLocalesState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetLocalesState());
    }
  }, [success, error, message, dispatch]);

  // Función para determinar qué datos mostrar, memoizada para evitar recreación
  const displayedLocales = useMemo(() => 
    useMockData ? mockLocales : locales, 
    [useMockData, mockLocales, locales]
  );
  
  // Efecto para filtrar los locales basados en el término de búsqueda
  useEffect(() => {
    if (!displayedLocales) {
      setFilteredLocales([]);
      return;
    }
    
    if (!searchTerm.trim()) {
      setFilteredLocales(displayedLocales);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    const filtered = displayedLocales.filter(local => {
      if (searchField === 'nombre' && local.nombre) {
        return local.nombre.toLowerCase().includes(lowerSearchTerm);
      } else if (searchField === 'direccion' && local.direccion) {
        return local.direccion.toLowerCase().includes(lowerSearchTerm);
      } else if (searchField === 'estado') {
        const estadoText = local.activo ? 'activo' : 'inactivo';
        return estadoText.includes(lowerSearchTerm);
      }
      return false;
    });
    
    setFilteredLocales(filtered);
    setCurrentPage(1); // Reset a la primera página cuando cambian los filtros
  }, [displayedLocales, searchTerm, searchField]);

  // Calcular locales para la página actual
  const indexOfLastLocal = currentPage * localesPerPage;
  const indexOfFirstLocal = indexOfLastLocal - localesPerPage;
  const localesForCurrentPage = filteredLocales?.slice(indexOfFirstLocal, indexOfLastLocal) || [];
  const totalPages = Math.ceil((filteredLocales?.length || 0) / localesPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Navegar a la página siguiente
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Navegar a la página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAddLocal = () => {
    setIsEditing(false);
    setShowForm(true);
    setShowDetails(false);
    setViewMode('create');
    setEditingLocal(null);
  };

  const handleEditLocal = (localId) => {
    if (useMockData) {
      const local = mockLocales.find(l => l._id === localId);
      setEditingLocal(local);
      setIsEditing(true);
      setShowForm(true);
      setShowDetails(false);
      setViewMode('edit');
    } else {
      dispatch(fetchLocalById(localId)).then(() => {
        setIsEditing(true);
        setShowForm(true);
        setShowDetails(false);
        setViewMode('edit');
        setEditingLocal(selectedLocal);
      });
    }
  };

  const handleViewDetails = (localId) => {
    if (useMockData) {
      const local = mockLocales.find(l => l._id === localId);
      setEditingLocal(local);
      setShowDetails(true);
      setShowForm(false);
      setViewMode('detail');
    } else {
      dispatch(fetchLocalById(localId));
      dispatch(fetchLocalUsers(localId)).then(() => {
        setShowDetails(true);
        setShowForm(false);
        setViewMode('detail');
      });
    }
  };

  const handleToggleStatus = (localId, currentStatus) => {
    if (useMockData) {
      setMockLocales(mockLocales.map(local => 
        local._id === localId ? {...local, activo: !currentStatus} : local
      ));
      toast.success(`Estado del local ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
    } else {
      dispatch(changeLocalStatus({ localId, isActive: !currentStatus }));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowDeleteConfirm(false);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setViewMode('list');
  };

  const handleFormSubmit = (formData) => {
    if (useMockData) {
      if (viewMode === 'create') {
        const newLocal = {
          _id: Date.now().toString(),
          ...formData,
          activo: true
        };
        setMockLocales([...mockLocales, newLocal]);
        toast.success('Local creado exitosamente');
      } else if (viewMode === 'edit' && editingLocal) {
        setMockLocales(mockLocales.map(local => 
          local._id === editingLocal._id ? {...local, ...formData} : local
        ));
        toast.success('Local actualizado exitosamente');
      }
    } else {
      if (viewMode === 'create') {
        dispatch(createLocal(formData));
      } else if (viewMode === 'edit' && editingLocal) {
        dispatch(updateLocal({ 
          localId: editingLocal._id, 
          localData: formData 
        }));
      }
    }
    setViewMode('list');
    setEditingLocal(null);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setEditingLocal(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este local?')) {
      if (useMockData) {
        setMockLocales(mockLocales.filter(local => local._id !== id));
        toast.success('Local eliminado exitosamente');
      } else {
        dispatch(deleteLocal(id));
      }
      setViewMode('list');
    }
  };

  const handleAddNew = () => {
    setEditingLocal(null);
    setShowForm(true);
    setViewMode('create');
  };

  const handleDeleteConfirm = (local) => {
    setEditingLocal(local);
    setShowDeleteConfirm(true);
  };

  const handleDeleteLocal = async () => {
    if (!editingLocal) return;
    
    setIsProcessing(true);
    
    if (useMockData) {
      // Simular eliminación con datos de prueba
      setTimeout(() => {
        setMockLocales(mockLocales.filter(local => local._id !== editingLocal._id));
        setAlert({
          show: true,
          type: 'success',
          message: 'Local eliminado con éxito'
        });
        setShowDeleteConfirm(false);
        setEditingLocal(null);
        setIsProcessing(false);
      }, 1000);
    } else {
      try {
        await dispatch(deleteLocal(editingLocal._id));
        setAlert({
          show: true,
          type: 'success',
          message: 'Local eliminado con éxito'
        });
        setShowDeleteConfirm(false);
        setEditingLocal(null);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error al eliminar local:', error);
        setAlert({
          show: true,
          type: 'error',
          message: 'Error al eliminar el local. Por favor, inténtelo de nuevo.'
        });
        setIsProcessing(false);
      }
    }
  };

  // Función para cargar usuarios de un local y mostrar el modal
  const handleShowUsersModal = (local) => {
    // Primero, resetear los datos de usuarios para evitar mostrar información del local anterior
    setLocalUsersData({ usuarios: [], stats: {} });
    // Luego, establecer el local seleccionado y mostrar el modal inmediatamente
    setSelectedLocalForUsers(local);
    setShowUsersModal(true);
    // Finalmente, cargar los datos
    loadLocalUsers(local._id);
  };
  
  // Función para cerrar modal de usuarios
  const handleCloseUsersModal = () => {
    setShowUsersModal(false);
    setSelectedLocalForUsers(null);
  };

  // Función para cargar usuarios de un local
  const loadLocalUsers = async (localId) => {
    if (!localId) return;
    
    setLoadingUsers(true);
    try {
      console.log(`Cargando usuarios del local ${localId}...`);
      const response = await getUsersByLocalId(localId);
      
      if (response && response.success && response.data) {
        console.log('Usuarios obtenidos:', response.data);
        setLocalUsersData({
          usuarios: response.data.usuarios || [],
          stats: response.data.stats || {}
        });
      } else {
        console.error('Error al obtener usuarios del local:', response);
        setLocalUsersData({ usuarios: [], stats: {} });
      }
    } catch (error) {
      console.error('Error al cargar usuarios del local:', error);
      setLocalUsersData({ usuarios: [], stats: {} });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Mostrar mensaje de depuración para confirmar datos
  console.log('Datos actuales de locales:', 
    useMockData ? 'Mock data' : 'Datos de API', 
    displayedLocales
  );

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="container mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Gestión de Locales
        </h1>
        
        {viewMode === 'list' && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                Listado de Locales {useMockData && <span className="text-xs font-normal text-yellow-500">(Datos de ejemplo)</span>}
              </h2>
              <button
                onClick={handleAddNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
              >
                <FaPlus className="mr-2" />
                Nuevo Local
              </button>
            </div>
            
            {/* Buscador de locales */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar locales..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="nombre">Buscar por Nombre</option>
                    <option value="direccion">Buscar por Dirección</option>
                    <option value="estado">Buscar por Estado</option>
                  </select>
                </div>
              </div>
              
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                  {filteredLocales.length === 0 ? 
                    'No se encontraron resultados' : 
                    `Mostrando ${filteredLocales.length} de ${displayedLocales?.length || 0} locales`}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Dirección
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {localesForCurrentPage?.length > 0 ? (
                      localesForCurrentPage.map((local) => (
                        <tr 
                          key={local._id} 
                          className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
                          onClick={() => handleShowUsersModal(local)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {local.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {local.direccion || 'No disponible'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {local.telefono || 'No disponible'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              local.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {local.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowUsersModal(local);
                              }}
                              className="text-purple-600 hover:text-purple-900 mx-1"
                              title="Ver usuarios"
                            >
                              <FaUsers />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(local._id);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 mx-1"
                              title="Ver detalles"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLocal(local._id);
                              }}
                              className="text-blue-600 hover:text-blue-900 mx-1"
                              title="Editar"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConfirm(local);
                              }}
                              className="text-red-600 hover:text-red-900 mx-1"
                              title="Eliminar"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center">
                          {loading ? 'Cargando locales...' : 'No hay locales registrados.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación */}
              {filteredLocales?.length > localesPerPage && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstLocal + 1}</span> a{' '}
                        <span className="font-medium">
                          {indexOfLastLocal > filteredLocales.length ? filteredLocales.length : indexOfLastLocal}
                        </span>{' '}
                        de <span className="font-medium">{filteredLocales.length}</span> locales
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Botones de paginación */}
                        {Array.from({ length: totalPages }, (_, i) => {
                          // Mostrar siempre la primera y última página
                          // Mostrar 5 páginas alrededor de la página actual
                          const pageNumber = i + 1;
                          const isFirstPage = pageNumber === 1;
                          const isLastPage = pageNumber === totalPages;
                          const isCurrentPage = pageNumber === currentPage;
                          const isClosePage = 
                            pageNumber >= currentPage - 2 && 
                            pageNumber <= currentPage + 2;
                            
                          if (isFirstPage || isLastPage || isCurrentPage || isClosePage || totalPages <= 7) {
                            return (
                              <button
                                key={i}
                                onClick={() => paginate(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border ${
                                  isCurrentPage
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                } text-sm font-medium`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } 
                          // Mostrar puntos suspensivos
                          else if (
                            (i === 1 && currentPage > 3) || 
                            (i === totalPages - 2 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <span
                                key={i}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {viewMode === 'detail' && (editingLocal || selectedLocal) && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                Detalles del Local {useMockData && <span className="text-xs font-normal text-yellow-500">(Datos de ejemplo)</span>}
              </h2>
              <div>
                <button
                  onClick={() => handleEditLocal(useMockData ? editingLocal._id : selectedLocal._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center mr-2 inline-flex"
                >
                  <FaEdit className="mr-2" />
                  Editar
                </button>
                <button
                  onClick={handleCloseDetails}
                  className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-medium py-2 px-4 rounded-md inline-flex`}
                >
                  Volver
                </button>
              </div>
            </div>
            
            <LocalDetails 
              local={useMockData ? editingLocal : selectedLocal} 
              users={useMockData ? [] : localUsers} 
              onClose={handleCloseDetails} 
              onEdit={() => handleEditLocal(useMockData ? editingLocal._id : selectedLocal._id)} 
            />
          </div>
        )}
        
        {(viewMode === 'create' || viewMode === 'edit') && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                {viewMode === 'create' ? 'Crear Nuevo Local' : 'Editar Local'} {useMockData && <span className="text-xs font-normal text-yellow-500">(Datos de ejemplo)</span>}
              </h2>
              <button
                onClick={handleCancelForm}
                className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-medium py-2 px-4 rounded-md`}
              >
                Cancelar
              </button>
            </div>
            
            <LocalForm 
              local={editingLocal}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        )}
      </div>

      {/* Modal de usuarios del local */}
      <LocalUsersModal
        isOpen={showUsersModal}
        onClose={handleCloseUsersModal}
        localData={selectedLocalForUsers}
        usuarios={localUsersData.usuarios}
        stats={localUsersData.stats}
        loading={loadingUsers}
      />

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCloseForm}
        title="Confirmar Eliminación"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <ExclamationIcon className="h-12 w-12 text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-bold">¿Está seguro de eliminar este local?</h3>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Esta acción no se puede deshacer. Se eliminará permanentemente el local 
                <span className="font-semibold"> {editingLocal?.nombre}</span>.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={handleCloseForm}
              className={`px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteLocal}
              className={`px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Alerta para mostrar mensajes */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default LocalesPage; 