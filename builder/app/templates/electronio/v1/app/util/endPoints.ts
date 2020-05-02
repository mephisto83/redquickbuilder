export function parameters() {
	var res = [];
	for (var i = 0; i < arguments.length; i++) {
		res.push(arguments[i]);
	}
	return res.length ? '/' + res.join('/') : '';
}

export const endPoints: any = {};
