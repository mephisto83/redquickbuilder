// reducers/index.js

import { combineReducers } from 'redux';
import uiReducer from './uiReducer';
// ... other reducers


export function buildReducers() {
  return combineReducers({
    uiReducer,
    // ... other reducers
  });
}