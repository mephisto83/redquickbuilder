// reducers/index.js

import { combineReducers } from 'redux';
import uiReducer from './uiReducer';
// ... other reducers


export default buildReducers = () => combineReducers({
  uiReducer,
  // ... other reducers
});