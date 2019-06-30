import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UIA from '../actions/uiactions';
import * as IPCEvents from '../actions/ipcActions';
export function mapStateToProps(state) {
    return {
        state
    };
}

export function mapDispatchToProps(dispatch) {
    return bindActionCreators({ ...UIA, ...IPCEvents }, dispatch);
}


export function UIConnect(component) {
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(component);
}
String.prototype.padding = function (n, c) {
    var val = this.valueOf();
    if (Math.abs(n) <= val.length) {
        return val;
    }
    var m = Math.max((Math.abs(n) - this.length) || 0, 0);
    var pad = Array(m + 1).join(String(c || ' ').charAt(0));
    //      var pad = String(c || ' ').charAt(0).repeat(Math.abs(n) - this.length);
    return (n < 0) ? pad + val : val + pad;
    //      return (n < 0) ? val + pad : pad + val;
};

String.prototype.unCamelCase = function () {
    var str = this || '';
    return str
        // insert a space between lower & upper
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // space before last upper in a sequence followed by lower
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        // uppercase the first character
        .replace(/^./, function (str) { return str.toUpperCase(); }).trim();
};
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

    if (!array.intersection) {
        Object.defineProperty(array, 'intersection', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (othercollection, func) {
                var collection = this;
                var result = [];
                func = func || function (x, y) { return x === y; };
                for (var i = collection.length; i--;/**/) {
                    for (var j = othercollection.length; j--;/**/) {
                        if ((func(othercollection[j], collection[i]))) {
                            result.push(collection[i]);
                            break;
                        }
                    }
                }
                return result;
            }
        });
    }
    if (!array.toNodeSelect) {
        Object.defineProperty(array, 'toNodeSelect', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function () {
                var collection = this;
                return collection.map(node => {
                    return {
                        value: node.id,
                        title: UIA.GetNodeTitle(node)
                    }
                })
            }
        })
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
    if (!array.interpolate) {
        Object.defineProperty(array, 'interpolate', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (start, stop, func) {
                var collection = this;
                func = func || function (x) { return x; };
                for (var i = start; i < stop; i++) {
                    if (collection instanceof Float32Array) {
                        collection[i - start] = (func(i));
                    }
                    else
                        collection.push(func(i, i - start));
                }
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

    if (!array.groupBy) {
        Object.defineProperty(array, 'groupBy', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                var result = {};
                for (var i = 0; i < collection.length; i++) {
                    var t = func(collection[i]);
                    result[t] = result[t] || [];
                    result[t].push(collection[i]);
                }
                return result;
            }
        });
    }

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
                return result;
            }
        });
    }
})(Array.prototype)


export function enumerate(vects, j = 0) {
    var results = [];

    if (j < vects.length)
        for (var i = 0; i < vects[j]; i++) {
            var rest = enumerate(vects, j + 1);
            var temp = [i];
            if (rest.length) {
                rest.map(r => {
                    results.push([...temp, ...r])
                });
            }
            else {
                results.push(temp);
            }
        }
    return results;
}