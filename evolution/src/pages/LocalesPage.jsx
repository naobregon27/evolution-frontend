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
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { PlusIcon, ExclamationIcon } from '@heroicons/react/outline';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import LocalesList from '../components/locales/LocalesList';

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
                    {displayedLocales?.length > 0 ? (
                      displayedLocales.map((local) => (
                        <tr key={local._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
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
                              onClick={() => handleViewDetails(local._id)}
                              className="text-indigo-600 hover:text-indigo-900 mx-1"
                              title="Ver detalles"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditLocal(local._id)}
                              className="text-blue-600 hover:text-blue-900 mx-1"
                              title="Editar"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(local)}
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
                  onClick={() => setViewMode('list')}
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