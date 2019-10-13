export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
    if (!array.flatten) {
        //non recursive flatten deep using a stack

        Object.defineProperty(array, 'flatten', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function () {
                let input = this;
                const stack = [...input];
                const res = [];
                while (stack.length) {
                    // pop value from stack
                    const next = stack.pop();
                    if (Array.isArray(next)) {
                        // push back array items, won't modify the original input
                        stack.push(...next);
                    } else {
                        res.push(next);
                    }
                }
                //reverse to restore input order
                return res.reverse();
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


String.prototype.toJavascriptName = function () {
    var str = this || '';
    if (str[0]) {
        return str[0].toLowerCase() + str.split('').subset(1).join('');
    }
    return str;
}
const NEW_LINE = `
`;
Array.prototype.tightenPs = function () {
    var str = this || '';

    return (str.join(NEW_LINE)).split(NEW_LINE).filter(x => x.trim()).join(NEW_LINE);
}



export function addNewLine(str, count) {
    let spaces = [].interpolate(0, count || 1, () => `    `).join('');
    return ((str ? (NEW_LINE + spaces) : '') + (str || '')).split(NEW_LINE).filter(x => x.trim()).join(NEW_LINE + spaces)
}