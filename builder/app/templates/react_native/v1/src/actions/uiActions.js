export const UI_UPDATE = 'UI_UPDATE';
export const UISI_UPDATE = 'UISI_UPDATE';
export const RESET_ALL = 'RESET_ALL';
export const SCREEN_INSTANCE = 'SCREEN_INSTANCE';
export const VISUAL = 'VISUAL';
let _getState;

export function setGetState() {
    return (dispatch, getState) => {
        _getState = getState;
    }
}
export function UIV(item, value) {
    return UIC(VISUAL, item, value);
}
export function UIC(section, item, value) {
    return {
        type: UI_UPDATE,
        item,
        value,
        section
    }
}
export function UISI(form, model, item, value) {
    return {
        type: UISI_UPDATE,
        key: SCREEN_INSTANCE,
        form,
        model,
        item,
        value
    }
}
export function Visual(state, key) {
    let _state = Get(state, VISUAL);
    if (_state) {
        return _state[key];
    }
    return null;
}
export function GetC(state, key, id) {
    if (state)
        if (state.uiReducer[key])
            return state.uiReducer[key][id];
    return null;
}

export function GetScreenInstance(state, key, id) {
    let screenInstance = GetC(state, SCREEN_INSTANCE, key);

    if (screenInstance) {
        return screenInstance[id] || null;
    }

    return null;
}

export function updateScreenInstance(form, model, id, value) {
    return (dispatch, getState) => {
        dispatch(UISI(form, model, id, value));
    }
}

