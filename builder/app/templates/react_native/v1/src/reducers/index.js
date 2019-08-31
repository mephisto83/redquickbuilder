// reducers/index.js

import { combineReducers } from 'redux';
import routes from './routes';
import uiReducer from './uiReducer';
// ... other reducers


export default combineReducers({
  routes,
  uiReducer,
  // ... other reducers
});