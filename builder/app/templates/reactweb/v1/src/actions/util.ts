import { bindActionCreators } from 'redux';
import * as UIActions from '../actions/uiActions';
import * as NavigationActions from '../actions/navigationActions';
import { Visual } from '../actions/uiActions';
import * as ControllerActions from '../actions/controllerActions';
import { TitleService } from './titles';
import { connect } from 'react-redux';

export function GUID() {
	var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
	return guid;
}

export const mapDispatchToProps = (dispatch: any) => {
	var actionBlob = Object.assign({}, UIActions, NavigationActions, ControllerActions);

	var result = bindActionCreators(actionBlob as any, dispatch);
	result.dispatch = dispatch;
	return result;
};

export const mapStateToProps = (state: any) => {
	return {
		state: state
	};
};
export function redConnect(component: any): any {
	return connect(mapStateToProps, mapDispatchToProps)(component);
}

export const titleService = TitleService;

// Gets the function key parameters,
// That means that a function has parameters, and we can use
// those paramters to set the Visual to loading on a specific key
export function getVisualFunctionKey(func?: any, param?: any, defaultKey?: any) {
	let key = defaultKey;
	if (func && func.requirements) {
		key = func.requirements(param);
	}

	return key || defaultKey;
}
//Checks if the function should fire based on the parameters
export function shouldExecuteBasedOnParams(func?: any, param?: any) {
	if (func && func.canSend) {
		return func.canSend(param);
	}
	return true;
}

///Lots of stuff to add here,
// better error handling
export function simple(func?: any, param?: any, states?: any, callback?: any, error?: any, precall?: any) {
	return (dispatch: any, getState: any) => {
		if (!shouldExecuteBasedOnParams(func, param)) {
			return Promise.resolve();
    }

		var state = getState();
		var loading = states.loading;
		var objectType = states.objectType;
		let visualKey = getVisualFunctionKey(func, param, loading);
		if (!Visual(state, visualKey)) {
			dispatch(UIActions.UIV(visualKey, true));
			if (precall) {
				precall(param, dispatch, getState);
			}
			return func(param)
				.then((res: any) => {
					if (callback) {
						callback(res, dispatch, getState);
					}
					return res;
				})
				.catch((e: any) => {
					if (error) {
						error(e, dispatch, getState);
					}
				})
				.then((res: any) => {
					dispatch(UIActions.UIV(visualKey, false));
					return res;
				});
		}
		return Promise.resolve();
	};
}

export const _catch = (e: any) => {
	return Promise.resolve()
		.then(() => {
			if (e && e.message && e.message.json) {
				return e.message.json().then((c: any) => {
					console.log(c);
					return c;
				});
			}
			return Promise.reject(e);
		})
		.catch(() => {
			console.log(e);
			return e;
		});
};

export const catchAnd = (then: any) => {
	then = then || (() => {});
	return (e: any) => _catch(e).then(then).catch(() => {});
};

(function(array: any) {
	if (!array.subset) {
		Object.defineProperty(array, 'subset', {
			enumerable: false,
			writable: true,
			configurable: true,
			value: function(start: any, stop: any) {
				var collection = this;
				stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
				start = Math.min(collection.length, start === undefined || start === null ? collection.length : start);
				start = start < 0 ? 0 : start;
				stop = stop < 0 ? 0 : stop;
				var result = [];
				for (var i = start; i < stop; i++) {
					if (this instanceof Float32Array) {
						result[i - start] = collection[i];
					} else {
						result.push(collection[i]);
					}
				}
				return [ result ];
			}
		});
	}
})(Array.prototype);
