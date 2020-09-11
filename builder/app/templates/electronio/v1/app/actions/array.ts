export function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
declare global {
	export interface String {}
	export interface Array<T> {
		relativeCompliment: any;
		unique: any;
		intersection: any;
		forEachAsync: any;
		tightenPs: any;
		flatten: any;
		split: any;
		maxSelection: any;
		maximum: any;
		minimum: any;
		interpolate: any;
		removeIndices: any;
		orderBy: any;
		subset: any;
		summation: any;
		groupBy: any;
		startsWith: any;
		chunk: any;
		chunkView: any;
	}
}
export default function() {
	((array: Array<any>) => {
		if (!array.relativeCompliment) {
			const extrasection_relativeCompliment = {
				enumerable: false,
				writable: true,
				configurable: true,
				value(othercollection: [], func: Function, output: []): [] {
					const collection = <[]>(<unknown>this);
					const result: any = [];

					func =
						func ||
						function(x: any, y: any) {
							return x === y;
						};
					for (let i = collection.length; i-- /**/; ) {
						// function (x) { return x == collection[i]; }
						if (!othercollection.some(func.bind(null, collection[i]))) {
							result.push(collection[i]);
						} else if (output) {
							output.push(collection[i]);
						}
					}
					return result as [];
				}
			};
			if (!array.relativeCompliment) {
				Object.defineProperty(array, 'relativeCompliment', extrasection_relativeCompliment);
			}
		}

		if (!array.intersection) {
			Object.defineProperty(array, 'intersection', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(othercollection: [], func: Function) {
					const collection = this;
					const result = [];
					func =
						func ||
						function(x: any, y: any) {
							return x === y;
						};
					for (let i = collection.length; i-- /**/; ) {
						for (let j = othercollection.length; j-- /**/; ) {
							if (func(othercollection[j], collection[i])) {
								result.push(collection[i]);
								break;
							}
						}
					}
					return result;
				}
			});
		}

		if (!array.forEachAsync) {
			Object.defineProperty(array, 'forEachAsync', {
				enumerable: false,
				writable: true,
				configurable: true,
				value: async function(func: Function) {
					const collection = this;
					let promise = Promise.resolve();
					(<any>[]).interpolate(0, collection.length, (i: any) => {
						promise = promise.then(async () => func(collection[i], i, collection.length));
					});
					// }
					return promise;
					// return result;
				}
			});
		}

		if (!array.unique) {
			Object.defineProperty(array, 'unique', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(func: Function) {
					const result = [];
					const finalresult = [];
					func =
						func ||
						function(x: any) {
							return x;
						};
					const collection = this;
					for (let i = 0; i < collection.length; i++) {
						// if (func(collection[i])) {
						if (result.indexOf(func(collection[i])) === -1) {
							result.push(func(collection[i]));
							finalresult.push(collection[i]);
						}
						// }
					}
					return finalresult;
					// return result;
				}
			});
		}
		if (!array.removeIndices) {
			// removeIndices
			Object.defineProperty(array, 'removeIndices', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(indices: any) {
					indices = indices.orderBy((x: any, y: number) => y - x);
					const collection = this;
					indices.map((index: Number) => {
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
				value(
					start: number,
					stop: number,
					func: { (arg0: any, arg1: number | undefined): number; (x: any): any }
				) {
					const collection = this;
					func =
						func ||
						function(x: any) {
							return x;
						};
					for (let i = start; i < stop; i++) {
						if (collection instanceof Float32Array) {
							collection[i - start] = func(i);
						} else collection.push(func(i, i - start));
					}
					return collection;
				}
			});
		}
		if (!array.flatten) {
			// non recursive flatten deep using a stack

			Object.defineProperty(array, 'flatten', {
				enumerable: false,
				writable: true,
				configurable: true,
				value() {
					const input = this;
					const stack = [ ...input ];
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
					// reverse to restore input order
					return res.reverse();
				}
			});
		}
		if (!array.orderBy) {
			Object.defineProperty(array, 'orderBy', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(func: any) {
					const collection = this.map((x: any) => x);
					return collection.sort(func);
				}
			});
		}

		if (!array.groupBy) {
			Object.defineProperty(array, 'groupBy', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(func: (arg0: any) => any) {
					const collection = this;
					const result: { [a: string]: any } = {};
					for (let i = 0; i < collection.length; i++) {
						const t = func(collection[i]);
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
				value(start: number | null | undefined, stop: number | null | undefined) {
					const collection = this;
					stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
					start = Math.min(
						collection.length,
						start === undefined || start === null ? collection.length : start
					);
					start = start < 0 ? 0 : start;
					stop = stop < 0 ? 0 : stop;
					const result = this;
					for (let i = start; i < stop; i++) {
						if (this instanceof Float32Array) {
							result[i - start] = collection[i];
						} else {
							result.push(collection[i]);
						}
					}
					return result;
				}
			});
		}
		if (!array.maxSelection) {
			Object.defineProperty(array, 'maxSelection', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(func: (arg0: any) => any) {
					let result = null;
					let _result = null;
					const collection = this;
					for (let i = 0; i < collection.length; i++) {
						const temp = func(collection[i]);
						if (result == null || temp > result) {
							result = temp;
							_result = collection[i];
						}
					}
					return _result;
				}
			});
		}
		if (!array.maximum) {
			Object.defineProperty(array, 'maximum', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(func: { (arg0: any, arg1: number): any; (x: any): any }) {
					let result = null;
					let _result = null;
					const collection = this;
					func =
						func ||
						function(x: any) {
							return x;
						};
					for (let i = 0; i < collection.length; i++) {
						const temp = func(collection[i], i);
						if (result == null || temp > result) {
							result = temp;
							_result = collection[i];
						}
					}
					return result;
				}
			});
		}

		if (!array.minimum) {
			Object.defineProperty(array, 'minimum', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(func: { (arg0: any, arg1: number): any; (x: any): any }) {
					let result = null;
					let _result = null;
					const collection = this;
					let val;
					func =
						func ||
						function(x: any) {
							return x;
						};
					for (let i = 0; i < collection.length; i++) {
						val = func(collection[i], i);
						if (result == null || val < result) {
							result = val;
							_result = collection[i];
						}
					}
					return result;
				}
			});
		}

		if (!array.summation) {
			Object.defineProperty(array, 'summation', {
				enumerable: false,
				writable: true,
				configurable: true,
				value(func: (arg0: any, arg1: number, arg2: number, arg3: any) => number) {
					let result = 0;
					const collection = this;
					for (let i = 0; i < collection.length; i++) {
						result = func(collection[i], result, i, collection.length);
					}
					return result;
				}
			});
		}
		array.tightenPs = function() {
			const str = this || '';

			return str.join(NEW_LINE).split(NEW_LINE).filter((x: string) => x.trim()).join(NEW_LINE);
		};
	})(Array.prototype);
	console.log('defined array');
	(function(strPrototype: any) {
		strPrototype.toJavascriptName = function() {
			const str = this || '';
			if (str[0]) {
				try {
					return str[0].toLowerCase() + str.split('').subset(1).join('');
				} catch (e) {
					console.log(str);
					console.log(str.length);
				}
			}
			return str;
		};
	})(String.prototype);

  (function(objectPrototype: any) {
    if (!objectPrototype.entries) {
      Object.defineProperty(objectPrototype, 'entries', {
        enumerable: false,
        writable: true,
        configurable: true,
        value(obj: any) {
          var ownProps = Object.keys(obj),
            i = ownProps.length,
            resArray = new Array(i); // preallocate the Array
          while (i--) resArray[i] = [ ownProps[i], obj[ownProps[i]] ];

          return resArray;
        }
      });
    }
  })(Object.prototype);

}
const NEW_LINE = `
`;

export function addNewLine(str: any, count: any) {
	const spaces = (<any>[]).interpolate(0, count || 1, () => `    `).join('');
	return ((str ? NEW_LINE + spaces : '') + (str || ''))
		.split(NEW_LINE)
		.filter((x) => x.trim())
		.join(NEW_LINE + spaces);
}
