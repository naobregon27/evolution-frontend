import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import './tailwind.css'
import './index.css'
import App from './App.jsx'
import { initializeSettings } from './store/reducers/settingsReducer'

// Inicializar configuraciones (tema, idioma, etc.)
store.dispatch(initializeSettings())

// Aplicar el modo oscuro al inicio según las configuraciones guardadas
const storedSettings = localStorage.getItem('app_settings');
if (storedSettings) {
  try {
    const settings = JSON.parse(storedSettings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (error) {
    console.error('Error al aplicar el modo oscuro inicial:', error);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
