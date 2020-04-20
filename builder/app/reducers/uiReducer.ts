// @flow
import * as UIA from '../actions/uiactions';
export function updateUI(state, action) {
    var newstate = { ...state };
    newstate[action.section] = { ...newstate[action.section] || {} }
    newstate[action.section][action.item] = action.value;
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
        default:
            return state;
    }
}
