// @flow
import * as UIA from '../actions/uiActions';
export function updateUI(state, action) {
	var newstate = { ...state };
	newstate[action.section] = { ...newstate[action.section] || {} };
	newstate[action.section][action.item] = action.value;
	return newstate;
}
export function makeDefaultState() {
	return {};
}
export default function uiReducer(state, action) {
	state = state || makeDefaultState();
	let actions: any[] = action.batch;
	if (action.type !== UIA.BATCH) {
		actions = [ action ];
	}
	actions.forEach((action) => {
		switch (action.type) {
			case UIA.UI_UPDATE:
				state = updateUI(state, action);
				break;
			default:
				break;
		}
	});
	return state;
}
