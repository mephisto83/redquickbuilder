// @flow
import * as UIA from '../actions/uiActions';
export function updateUI(state, action) {
    var newstate = { ...state };
    newstate[action.section] = { ...newstate[action.section] || {} }
    newstate[action.section][action.item] = action.value;
    return newstate;
}
export function updateUISI(state, action) {
    var newstate = { ...state };
    let { key,
        form,
        model,
        item,
        value } = action;

    newstate[key] = newstate[key] || {};
    newstate[key][form] = newstate[key][form] || {};
    newstate[key][form][model] = newstate[key][form][model] || {};
    newstate[key][form][model][item] = newstate[key][form][model][item] || {};
    newstate[key][form][model][item] = value;

    return newstate;
}

export function makeDefaultState() {
    return {};
}
export default function uiReducer(state, action) {
    state = state || makeDefaultState();
    switch (action.type) {
        case UIA.UI_UPDATE:
            return updateUI(state, action);
        case UIA.UISI_UPDATE:
            return updateUISI(state, action);
        default:
            return state;
    }
}
