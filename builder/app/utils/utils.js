import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UIA from '../actions/uiactions';
export function mapStateToProps(state) {
    return {
        state
    };
}

export function mapDispatchToProps(dispatch) {
    return bindActionCreators({ ...UIA }, dispatch);
}


export function UIConnect(component) {
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(component);
}


((array) => {
    if (!array.relativeCompliment) {
        var extrasection_relativeCompliment = {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (othercollection, func, output) {
                var collection = this;
                var result = [];

                func = func || function (x, y) { return x === y; };
                for (var i = collection.length; i--;/**/) {//function (x) { return x == collection[i]; }
                    if (!othercollection.some(func.bind(null, collection[i]))) {
                        result.push(collection[i]);
                    }
                    else if (output) {
                        output.push(collection[i]);
                    }
                }
                return result;
            }
        }
        if (!array.relativeCompliment) {
            Object.defineProperty(array, 'relativeCompliment', extrasection_relativeCompliment);
        }
    }
    if (!array.unique) {
        Object.defineProperty(array, 'unique', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = [];
                var finalresult = [];
                func = func || function (x) { return x; };
                var collection = this;
                for (var i = 0; i < collection.length; i++) {
                    //if (func(collection[i])) {
                    if (result.indexOf(func(collection[i])) === -1) {
                        result.push(func(collection[i]));
                        finalresult.push(collection[i]);
                    }
                    //}
                }
                return finalresult;
                //return result;
            }
        });
    }
    if (!array.removeIndices) {
        //removeIndices
        Object.defineProperty(array, 'removeIndices', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (indices) {
                indices = indices.orderBy(function (x, y) { return y - x; });
                var collection = this;
                indices.map(function (index) {
                    collection.splice(index, 1);
                });

                return collection;
            }
        });
    }
    if (!array.orderBy) {
        Object.defineProperty(array, 'orderBy', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this.map(function (x) { return x; });
                return collection.sort(func);
            }
        });
    };
})(Array.prototype)