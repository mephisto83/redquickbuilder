import { bindActionCreators } from 'redux';
import * as UIActions from '../actions/uiActions';
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

export const asyncStorage = store => next => action => {
  var result = next(action);
  if (action.store)
    debouncedStoreAsync(store, action);
  return result;
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