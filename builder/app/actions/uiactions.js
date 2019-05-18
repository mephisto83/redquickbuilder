export const VISUAL = 'VISUAL';
export const DASHBOARD_MENU = 'DASHBOARD_MENU';

export const UI_UPDATE = 'UI_UPDATE';
export function GetC(state, section, item) {
    if (state && state.uiReducer && state.uiReducer[section]) {
        return state.uiReducer[section][item];
    }
    return null;
}
export function Visual(state, key) {
    return GetC(state, VISUAL, key);
}

export function UIC(section, item, value) {
    return {
        type: UI_UPDATE,
        item,
        value,
        section
    }
}
export function toggleVisual(key) {
    return (dispatch, getState) => {
        var state = getState();
        console.log(state);
        dispatch(UIC(VISUAL, key, !!!GetC(state, VISUAL, key)))
    }

}
export function toggleDashboardMinMax() {
    return toggleVisual(DASHBOARD_MENU);
}