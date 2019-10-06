export const BATCH = 'BATCH';
export const UI_UPDATE = 'UI_UPDATE';
export const UISI_UPDATE = 'UISI_UPDATE';
export const UI_MODELS = 'UI_MODELS';
export const RESET_ALL = 'RESET_ALL';
export const SCREEN_INSTANCE = 'SCREEN_INSTANCE';
export const SCREEN_INSTANCE_ON_BLUR = 'SCREEN_INSTANCE_ON_BLUR';
export const SCREEN_INSTANCE_FOCUSED = 'SCREEN_INSTANCE_FOCUSED';
export const SCREEN_INSTANCE_ON_FOCUS = 'SCREEN_INSTANCE_ON_FOCUS';
export const VISUAL = 'VISUAL';
let _getState;
export function GetItems(modelType) {
    if (_getState) {
        let state = _getState();
        let modelDic = GetC(state, UI_MODELS, modelType);
        if (modelDic) {
            return Object.values(modelDic);
        }
    }

    return [];
}
export function GetItem(modelType, id) {
    if (_getState) {
        let state = _getState();
        let modelDic = GetC(state, UI_MODELS, modelType);
        if (modelDic) {
            return modelDic[id];
        }
    }

    return null;
}
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
export function UIModels(model, value) {
    return {
        type: UI_MODELS,
        model,
        value
    }
}
export function Chain(id, funcs) {
    let res = id;

    funcs.map(func => {
        res = func(res);
    });

    return res;
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
export function Batch(a, b, c, d, e, f, g, h, i) {
    return {
        type: BATCH,
        batch: [a, b, c, d, e, f, g, h, i].filter(x => x)
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

export function Get(state, key) {
    if (state)
        if (state.uiReducer[key])
            return state.uiReducer[key];
    return null;
}

let _navigation = null;
export function setNavigate(navigation) {
    _navigation = navigation;
}
export function navigate(a, b, c) {
    if (_navigation)
        return _navigation.navigate(a, b, c);
}
export function GetScreenParam(param) {
    if (_navigation)
        return _navigation.getParam(param, undefined);
    return undefined;
}
export function GetScreenInstance(key, id) {
    if (_getState) {
        let state = _getState();
        let screenInstance = GetC(state, SCREEN_INSTANCE, key);

        if (screenInstance) {
            return screenInstance[id] || null;
        }
    }
    return null;
}

export function updateScreenInstance(model, id, value) {
    return (dispatch, getState) => {
        dispatch(Batch(
            UISI(SCREEN_INSTANCE, model, id, value)
        ));
    }
}

export function updateScreenInstanceBlur(model, id) {
    return (dispatch, getState) => {
        dispatch(Batch(
            UISI(SCREEN_INSTANCE_ON_BLUR, model, id, true),
            UISI(SCREEN_INSTANCE_FOCUSED, model, id, false)
        ));
    }
}

export function updateScreenInstanceFocus(model, id) {
    return (dispatch, getState) => {
        dispatch(Batch(
            UISI(SCREEN_INSTANCE_ON_FOCUS, model, id, true),
            UISI(SCREEN_INSTANCE_FOCUSED, model, id, true)
        ));
    }
}

