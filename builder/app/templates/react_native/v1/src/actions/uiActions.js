export const UI_UPDATE = 'UI_UPDATE';
export const RESET_ALL = 'RESET_ALL';

export function UIC(section, item, value) {
    return {
        type: UI_UPDATE,
        item,
        value,
        section
    }
}
export function Get(state, key) {
    if (state)
        return state.uiReducer[key];
    return null;
}
export function Get(state, key, id) {
    if (state)
        if (state.uiReducer[key])
            return state.uiReducer[key][id];
    return null;
}