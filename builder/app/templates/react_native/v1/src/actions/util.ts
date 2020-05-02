import { bindActionCreators } from 'redux';
import * as UIActions from './uiactions';
import { Visual } from './uiactions';
import * as ControllerActions from '../actions/controllerActions';
import { TitleService } from './titles';
import { connect } from 'react-redux';
var ReactNative = require('react-native');
var {
  AsyncStorage
} = ReactNative;

export function GUID() {
  var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x'  r: (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return guid;
}


export const mapDispatchToProps = (dispatch) => {
  var actionBlob = Object.assign({},
    UIActions,
    ControllerActions
  );

  var result = bindActionCreators(actionBlob, dispatch);
  result.dispatch = dispatch;
  return result;
}

export const mapStateToProps = (state) => {
  return {
    state: state
  };
};
export function redConnect(component) {
  return connect(mapStateToProps, mapDispatchToProps)(component);

}
export const asyncStorage = store => next => action => {
  var result = next(action);
  if (action.store)
    debouncedStoreAsync(store, action);
  return result;
}

export const titleService = TitleService;

// Gets the function key parameters,
// That means that a function has parameters, and we can use
// those paramters to set the Visual to loading on a specific key
export function getVisualFunctionKey(func, param, defaultKey) {
  let key = defaultKey;
  if (func && func.requirements) {
    key = func.requirements(param);
  }

  return key || defaultKey;
}
//Checks if the function should fire based on the parameters
export function shouldExecuteBasedOnParams(func, param) {
  if (func && func.canSend) {
    return func.canSend(param);
  }
  return true;
}

///Lots of stuff to add here,
// better error handling
export function simple(func, param, states, callback, error, precall) {
  return (dispatch, getState) => {
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
        .then((res) => {
          if (callback) {
            callback(res, dispatch, getState);
          }
          return res;
        })
        .catch((e) => {
          if (error) {
            error(e, dispatch, getState);
          }
        })
        .then((res) => {
          dispatch(UIActions.UIV(visualKey, false));
          return res;
        });
    }
    return Promise.resolve();
  };
}
export const _catch = (e) => {
  return Promise.resolve().then(() => {
    if (e && e.message && e.message.json) {
      return e.message.json().then(c => { console.log(c); return c; });
    }
    return Promise.reject(e);
  }).catch(() => {
    console.log(e)
    return e;
  })
}

export const catchAnd = (then) => {
  then = then || (() => { });
  return (e) => _catch(e).then(then).catch(() => { });
}

(function (array) {
  if (!array.subset) {
    Object.defineProperty(array, 'subset', {
      enumerable: false,
      writable: true,
      configurable: true,
      value: function (start, stop) {
        var collection = this;
        stop = Math.min(collection.length, stop === undefined || stop === null  collection.length : stop);
        start = Math.min(collection.length, start === undefined || start === null  collection.length : start);
        start = start < 0  0 : start;
        stop = stop < 0  0 : stop;
        var result = this instanceof Float32Array  new Float32Array(stop - start) : [];
        for (var i = start; i < stop; i++) {
          if (this instanceof Float32Array) {
            result[i - start] = collection[i];
          }
          else {
            result.push(collection[i]);
          }

        }
        return [(result)]
      }
    });
  }
})(Array.prototype);
