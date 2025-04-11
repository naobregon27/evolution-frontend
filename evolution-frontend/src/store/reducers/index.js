import { combineReducers } from 'redux';
import counterReducer from './counterReducer';
import authReducer from './authReducer';
import settingsReducer from './settingsReducer';

const rootReducer = combineReducers({
  counter: counterReducer,
  auth: authReducer,
  settings: settingsReducer,
  // Aquí se pueden agregar más reducers según sea necesario
});

export default rootReducer; 