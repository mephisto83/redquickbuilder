import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from './array';
import * as UIA from '../actions/uiActions';
import * as IPCEvents from '../actions/ipcActions';
import * as RemoteActions from '../actions/remoteActions';
export function mapStateToProps(state: any) {
	return {
		state
	};
}

export function mapDispatchToProps(dispatch: any) {
	let actionCreate: any = {
		...UIA,
		...IPCEvents,
		...RemoteActions
	};
	return bindActionCreators(actionCreate, dispatch);
}

export function UIConnect(component: any): any {
	return connect(mapStateToProps, mapDispatchToProps)(component);
}
declare global {
	export interface String {
		padding: Function;
		unCamelCase: Function;
	}
}
String.prototype.padding = function(n: any, c: any) {
	var val = this.valueOf();
	if (Math.abs(n) <= val.length) {
		return val;
	}
	var m = Math.max(Math.abs(n) - this.length || 0, 0);
	var pad = Array(m + 1).join(String(c || ' ').charAt(0));
	//      var pad = String(c || ' ').charAt(0).repeat(Math.abs(n) - this.length);
	return n < 0 ? pad + val : val + pad;
	//      return (n < 0) ? val + pad : pad + val;
};

String.prototype.unCamelCase = function() {
	var str = this || '';
	return (
		str
			// insert a space between lower & upper
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			// space before last upper in a sequence followed by lower
			.replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
			// uppercase the first character
			.replace(/^./, function(str) {
				return str.toUpperCase();
			})
			.trim()
	);
};
export function enumerate(vects: any, j = 0) {
	var results = [];

	if (j < vects.length)
		for (var i = 0; i < vects[j]; i++) {
			var rest = enumerate(vects, j + 1);
			var temp = [ i ];
			if (rest.length) {
				rest.map((r) => {
					results.push([ ...temp, ...r ]);
				});
			} else {
				results.push(temp);
			}
		}
	return results;
}
