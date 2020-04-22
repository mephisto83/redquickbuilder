// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import uiReducer from './uiReducer';
export default function createRootReducer(history: any) {
	return combineReducers({
		router: connectRouter(history),
		uiReducer
	});
}
