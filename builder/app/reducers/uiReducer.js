// @flow
import * as UIA from '../actions/uiactions';
function updateUI(state, action) {
    var newstate = { ...state };
    newstate[action.section] = { ...newstate[action.section] || {} }
    newstate[action.section][action.item] = action.value;
    return newstate;
}
function makeDefaultState() {
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
