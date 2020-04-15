import { bindActionCreators } from 'redux';
import * as UIActions from '../actions/uiActions';
import { Visual } from '../actions/uiActions';
import * as ControllerActions from '../actions/controllerActions';
import { TitleService } from './titles';
import { connect } from 'react-redux';
var ReactNative = require('react-native');
var {
  AsyncStorage
} = ReactNative;

export function GUID() {
  var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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

///Lots of stuff to add here,
// better error handling
export function simple(func, param, states, callback, error) {
  return (dispatch, getState) => {
    var state = getState();
    var loading = states.loading;
    var objectType = states.objectType;
    if (!Visual(state, loading)) {
      dispatch(UIActions.UIV(loading, true));
      return func(param).then(res => {
        if (callback) {
          callback(res, dispatch, getState);
        }
        return res;
      }).catch(catchAnd((e) => {
        if (error) {
          error(e, dispatch, getState);
        }
      })).then((res) => {
        dispatch(UIActions.UIV(loading, false));
        return res;
      });
    }
    return Promise.resolve();
  }
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
        stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
        start = Math.min(collection.length, start === undefined || start === null ? collection.length : start);
        start = start < 0 ? 0 : start;
        stop = stop < 0 ? 0 : stop;
        var result = this instanceof Float32Array ? new Float32Array(stop - start) : [];
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
