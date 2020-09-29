// @flow
import * as UIA from '../actions/uiactions';
export function updateUI(state: any, action: any) {
	var newstate = { ...state };
	newstate[action.section] = { ...newstate[action.section] || {} };
	newstate[action.section][action.item] = action.value;
	return newstate;
}
export function updateUISI(state: any, action: any) {
	var newstate = { ...state };
	let { key, form, model, item, value } = action;

	newstate[key] = newstate[key] || {};
	newstate[key][form] = newstate[key][form] || {};
	newstate[key][form][model] = newstate[key][form][model] || {};
	newstate[key][form][model][item] = newstate[key][form][model][item] || {};
	newstate[key][form][model][item] = value;

	return newstate;
}

export function updateUISMIO(state: any, action: any) {
	var newstate = { ...state };
	let { key, form, model, instance, value } = action;

	newstate[key] = newstate[key] || {};
	newstate[key][form] = newstate[key][form] || {};
	newstate[key][form][model] = newstate[key][form][model] || {};
	newstate[key][form][model][instance] = newstate[key][form][model][instance] || {};
	newstate[key][form][model][instance] = typeof value === 'object' ? { ...value } : value;

	return newstate;
}
export function updateUISMI(state: any, action: any) {
	return updateUIMI(state, action);
}
export function updateUIMI(state: any, action: any) {
	var newstate = { ...state };
	let { key, form, model, instance, item, value } = action;

	newstate[key] = newstate[key] || {};
	newstate[key][form] = newstate[key][form] || {};
	newstate[key][form][model] = newstate[key][form][model] || {};
	newstate[key][form][model][instance] = newstate[key][form][model][instance] || {};
	newstate[key][form][model][instance][item] = newstate[key][form][model][instance][item] || {};
	newstate[key][form][model][instance][item] = value;

	return newstate;
}

export function updateModels(state: any, action: any) {
	var { type, model, value } = action;
	let newstate = { ...state };
	newstate[type] = newstate[type] || {};
	newstate[type][model] = newstate[type][model] || {};
	if (!Array.isArray(value)) {
		value = [ value ];
	}
	(value || []).map((val: { id: string | number; version: number }) => {
		if (
			newstate[type][model][val.id] &&
			newstate[type][model][val.id].hasOwnProperty('version') &&
			newstate[type][model][val.id].version <= val.version
		) {
			newstate[type][model][val.id] = val;
		} else if (!newstate[type][model][val.id]) {
			newstate[type][model][val.id] = val;
		}
	});
	return newstate;
}

export function updateScreenProperties(state: any, action: any) {
	let { key, screen, property, value } = action;
	let newstate: any = {};
	newstate[key] = newstate[key] || {};
	newstate[key] = newstate[key] || {};
	newstate[key][screen] = newstate[key][screen] || {};
	newstate[key][screen][property] = value;

	return newstate;
}

export function makeDefaultState() {
	return {};
}
export default function uiReducer(state: {}, action: any) {
	state = state || makeDefaultState();
	let actions = action.batch;
	if (action.type !== UIA.BATCH) {
		actions = [ action ];
	}
	actions.map((action: { type: any }) => {
		switch (action.type) {
			case UIA.UI_UPDATE:
				state = updateUI(state, action) || state;
				break;
			case UIA.UISI_UPDATE:
				state = updateUISI(state, action) || state;
				break;
			case UIA.UIMI_UPDATE:
				state = updateUIMI(state, action) || state;
				break;
			case UIA.UISMI_UPDATE:
				state = updateUISMI(state, action) || state;
				break;
			case UIA.UISMI_UPDATE_OBJECT:
				state = updateUISMIO(state, action) || state;
				break;
			case UIA.UI_MODELS:
				state = updateModels(state, action) || state;
				break;
			case UIA.UISP_UPDATE:
				state = updateScreenProperties(state, action) || state;
				break;
		}
	});
	return state;
}
