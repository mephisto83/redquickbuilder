// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from './counter';
import uiReducer from './uiReducer';
export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    counter,
    uiReducer
  });
}
