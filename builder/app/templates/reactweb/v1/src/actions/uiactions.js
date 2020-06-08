"use strict";
exports.__esModule = true;
exports.BATCH = 'BATCH';
exports.UI_UPDATE = 'UI_UPDATE';
exports.UISI_UPDATE = 'UISI_UPDATE';
exports.UISMI_UPDATE = 'UISMI_UPDATE';
exports.UISMI_UPDATE_OBJECT = 'UISMI_UPDATE_OBJECT';
exports.UISP_UPDATE = 'UISP_UPDATE';
exports.UIMI_UPDATE = 'UIMI_UPDATE';
exports.UI_MODELS = 'UI_MODELS';
exports.RESET_ALL = 'RESET_ALL';
exports.SCREEN_PROPERTIES = 'SCREEN_PROPERTIES';
exports.MODEL_INSTANCE = 'MODEL_INSTANCE';
exports.MODEL_INSTANCE_DIRTY = 'MODEL_INSTANCE_DIRTY';
exports.MODEL_INSTANCE_ON_BLUR = 'MODEL_INSTANCE_ON_BLUR';
exports.MODEL_INSTANCE_FOCUSED = 'MODEL_INSTANCE_FOCUSED';
exports.MODEL_INSTANCE_ON_FOCUS = 'MODEL_INSTANCE_ON_FOCUS';
exports.APP_STATE = 'APP_STATE';
exports.SCREEN_INSTANCE = 'SCREEN_INSTANCE';
exports.SCREEN_MODEL_INSTANCE = 'SCREEN_MODEL_INSTANCE';
exports.SCREEN_MODEL_INSTANCE_OBJECT = 'SCREEN_MODEL_INSTANCE_OBJECT';
exports.SCREEN_INSTANCE_DIRTY = 'SCREEN_INSTANCE_DIRTY';
exports.SCREEN_INSTANCE_ON_BLUR = 'SCREEN_INSTANCE_ON_BLUR';
exports.SCREEN_INSTANCE_FOCUSED = 'SCREEN_INSTANCE_FOCUSED';
exports.SCREEN_INSTANCE_ON_FOCUS = 'SCREEN_INSTANCE_ON_FOCUS';
exports.VISUAL = 'VISUAL';
exports.UIKeys = {
    HAS_CREDENTIALS: 'HAS_CREDENTIALS',
    CREDENTIALS: 'CREDENTIALS',
    USER_ID: 'USER_ID'
};
var _getState;
var _dispatch;
function GetItems(modelType) {
    if (_getState) {
        var state = _getState();
        var modelDic = GetC(state, exports.UI_MODELS, modelType);
        if (modelDic) {
            return Object.values(modelDic);
        }
    }
    return [];
}
exports.GetItems = GetItems;
function GetScreenProperties(screen) {
    if (_getState) {
        var state = _getState();
        var modelDic = GetC(state, exports.SCREEN_PROPERTIES, screen);
        if (modelDic) {
            return modelDic;
        }
    }
    return null;
}
exports.GetScreenProperties = GetScreenProperties;
function UISP(screen, property, value) {
    return {
        type: exports.UISP_UPDATE,
        key: exports.SCREEN_PROPERTIES,
        screen: screen,
        property: property,
        value: value
    };
}
exports.UISP = UISP;
function GetItem(modelType, id) {
    if (_getState) {
        var state = _getState();
        var modelDic = GetC(state, exports.UI_MODELS, modelType);
        if (modelDic) {
            return modelDic[id];
        }
    }
    return null;
}
exports.GetItem = GetItem;
function setGetState() {
    return function (dispatch, getState) {
        _getState = getState;
        _dispatch = dispatch;
    };
}
exports.setGetState = setGetState;
function GetDispatch() {
    if (_dispatch) {
        return _dispatch;
    }
}
exports.GetDispatch = GetDispatch;
function GetState() {
    if (_getState) {
        return _getState;
    }
}
exports.GetState = GetState;
function setTestGetState(func) {
    _getState = func;
}
exports.setTestGetState = setTestGetState;
function setDispatch(func) {
    _dispatch = func;
}
exports.setDispatch = setDispatch;
function UIV(item, value) {
    return UIC(exports.VISUAL, item, value);
}
exports.UIV = UIV;
function UIC(section, item, value) {
    return {
        type: exports.UI_UPDATE,
        item: item,
        value: value,
        section: section
    };
}
exports.UIC = UIC;
function UIModels(model, value) {
    return {
        type: exports.UI_MODELS,
        model: model,
        value: value
    };
}
exports.UIModels = UIModels;
function Chain(id, funcs) {
    var res = id;
    funcs.map(function (func) {
        res = func(res);
    });
    return res;
}
exports.Chain = Chain;
function UISI(form, model, item, value) {
    return {
        type: exports.UISI_UPDATE,
        key: exports.SCREEN_INSTANCE,
        form: form,
        model: model,
        item: item,
        value: value
    };
}
exports.UISI = UISI;
function UISMI(form, model, instance, item, value) {
    return {
        type: exports.UISMI_UPDATE,
        key: exports.SCREEN_MODEL_INSTANCE,
        form: form,
        model: model,
        instance: instance,
        item: item,
        value: value
    };
}
exports.UISMI = UISMI;
function UISMIO(form, model, instance, value) {
    return {
        type: exports.UISMI_UPDATE_OBJECT,
        key: exports.SCREEN_MODEL_INSTANCE,
        form: form,
        model: model,
        instance: instance,
        value: value
    };
}
exports.UISMIO = UISMIO;
function UIMI(form, model, instance, item, value) {
    return {
        type: exports.UIMI_UPDATE,
        key: exports.MODEL_INSTANCE,
        form: form,
        model: model,
        instance: instance,
        item: item,
        value: value
    };
}
exports.UIMI = UIMI;
function Batch(a, b, c, d, e, f, g, h, i) {
    return {
        type: exports.BATCH,
        batch: [a, b, c, d, e, f, g, h, i].filter(function (x) { return x; })
    };
}
exports.Batch = Batch;
function Visual(state, key) {
    var _state = Get(state, exports.VISUAL);
    if (_state) {
        return _state[key];
    }
    return null;
}
exports.Visual = Visual;
function GetC(state, key, id) {
    if (state) {
        if (state.uiReducer && state.uiReducer[key])
            return state.uiReducer[key][id];
    }
    return null;
}
exports.GetC = GetC;
function GetK(state, key, id, instance) {
    if (state) {
        if (state.uiReducer && state.uiReducer[key]) {
            if (state.uiReducer[key][id])
                return state.uiReducer[key][id][instance];
        }
    }
    return null;
}
exports.GetK = GetK;
function Get(state, key) {
    if (state)
        if (state.uiReducer[key])
            return state.uiReducer[key];
    return null;
}
exports.Get = Get;
var _navigation = null;
function setNavigate(navigation) {
    _navigation = navigation;
}
exports.setNavigate = setNavigate;
function navigate(a, b, c) {
    if (_navigation)
        return _navigation.navigate(a, b, c);
}
exports.navigate = navigate;
function GetScreenParam(param) {
    if (_navigation)
        return _navigation.getParam(param, undefined);
    return undefined;
}
exports.GetScreenParam = GetScreenParam;
function GetScreenInstance(key, id) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInst(state);
        if (screenInstance && screenInstance[key]) {
            return screenInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetScreenInstance = GetScreenInstance;
function GetModelInstance(key, instance, id) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInst(state);
        if (modelInstance && modelInstance[key] && modelInstance[key][instance]) {
            return modelInstance[key][instance][id] || null;
        }
    }
    return null;
}
exports.GetModelInstance = GetModelInstance;
function GetScreenInst(state) {
    return GetC(state, exports.SCREEN_INSTANCE, exports.SCREEN_INSTANCE);
}
exports.GetScreenInst = GetScreenInst;
function GetScreenModelInst(state, instance, id) {
    var item = GetK(state, exports.SCREEN_MODEL_INSTANCE, exports.SCREEN_INSTANCE, instance);
    if (item) {
        return item[id] || null;
    }
    return null;
}
exports.GetScreenModelInst = GetScreenModelInst;
function GetScreenModelDirtyInst(state, instance, id) {
    var item = GetK(state, exports.SCREEN_MODEL_INSTANCE, exports.SCREEN_INSTANCE_DIRTY, instance);
    if (item) {
        return item[id] || null;
    }
    return null;
}
exports.GetScreenModelDirtyInst = GetScreenModelDirtyInst;
function GetScreenModelFocusedInst(state, instance, id) {
    var item = GetK(state, exports.SCREEN_MODEL_INSTANCE, exports.SCREEN_INSTANCE_FOCUSED, instance);
    if (item) {
        return item[id] || null;
    }
    return null;
}
exports.GetScreenModelFocusedInst = GetScreenModelFocusedInst;
function GetScreenModelBlurInst(state, instance, id) {
    var item = GetK(state, exports.SCREEN_MODEL_INSTANCE, exports.SCREEN_INSTANCE_ON_BLUR, instance);
    if (item) {
        return item[id] || null;
    }
    return null;
}
exports.GetScreenModelBlurInst = GetScreenModelBlurInst;
function GetScreenModelFocusInst(state, instance, id) {
    var item = GetK(state, exports.SCREEN_MODEL_INSTANCE, exports.SCREEN_INSTANCE_ON_FOCUS, instance);
    if (item) {
        return item[id] || null;
    }
    return null;
}
exports.GetScreenModelFocusInst = GetScreenModelFocusInst;
function GetAppState(state) {
    return GetC(state, exports.APP_STATE, exports.APP_STATE);
}
exports.GetAppState = GetAppState;
function GetModelInst(state, instance, id) {
    return GetK(state, exports.UI_MODELS, instance, id);
}
exports.GetModelInst = GetModelInst;
function GetScreenInstanceBlur(key, id) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstBlur(state);
        if (screenInstance && screenInstance[key]) {
            return screenInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceBlur = GetScreenInstanceBlur;
function GetModelInstanceBlur(key, instance, id) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstBlur(state, instance);
        if (modelInstance && modelInstance[key]) {
            return modelInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetModelInstanceBlur = GetModelInstanceBlur;
function GetScreenInstanceBlurObject(key) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstBlur(state);
        if (screenInstance) {
            return screenInstance[key] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceBlurObject = GetScreenInstanceBlurObject;
function GetModelInstanceBlurObject(key, instance) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstBlur(state, instance);
        if (modelInstance) {
            return modelInstance[key] || null;
        }
    }
    return null;
}
exports.GetModelInstanceBlurObject = GetModelInstanceBlurObject;
function GetScreenInstBlur(state) {
    return GetC(state, exports.SCREEN_INSTANCE, exports.SCREEN_INSTANCE_ON_BLUR);
}
exports.GetScreenInstBlur = GetScreenInstBlur;
function GetModelInstBlur(state, instance) {
    return GetK(state, exports.MODEL_INSTANCE, exports.MODEL_INSTANCE_ON_BLUR, instance);
}
exports.GetModelInstBlur = GetModelInstBlur;
function GetScreenInstanceFocus(key, id) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstFocus(state);
        if (screenInstance && screenInstance[key]) {
            return screenInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceFocus = GetScreenInstanceFocus;
function GetModelInstanceFocus(key, instance, id) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstFocus(state, instance);
        if (modelInstance && modelInstance[key]) {
            return modelInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetModelInstanceFocus = GetModelInstanceFocus;
function GetScreenInstanceFocusObject(key) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstFocus(state);
        if (screenInstance) {
            return screenInstance[key] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceFocusObject = GetScreenInstanceFocusObject;
function GetModelInstanceFocusObject(key, instance) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstFocus(state, instance);
        if (modelInstance) {
            return modelInstance[key] || null;
        }
    }
    return null;
}
exports.GetModelInstanceFocusObject = GetModelInstanceFocusObject;
function GetScreenInstFocus(state) {
    return GetC(state, exports.SCREEN_INSTANCE, exports.SCREEN_INSTANCE_ON_FOCUS);
}
exports.GetScreenInstFocus = GetScreenInstFocus;
function GetModelInstFocus(state, instance) {
    return GetK(state, exports.MODEL_INSTANCE, exports.MODEL_INSTANCE_ON_FOCUS, instance);
}
exports.GetModelInstFocus = GetModelInstFocus;
function GetScreenInstanceDirty(key, id) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstDirty(state);
        if (screenInstance && screenInstance[key]) {
            return screenInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceDirty = GetScreenInstanceDirty;
function GetModelInstanceDirty(key, instance, id) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstDirty(state, instance);
        if (modelInstance && modelInstance[key]) {
            return modelInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetModelInstanceDirty = GetModelInstanceDirty;
function GetScreenInstanceDirtyObject(key) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstDirty(state);
        if (screenInstance) {
            return screenInstance[key] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceDirtyObject = GetScreenInstanceDirtyObject;
function GetModelInstanceDirtyObject(key, instance) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstDirty(state, instance);
        if (modelInstance) {
            return modelInstance[key] || null;
        }
    }
    return null;
}
exports.GetModelInstanceDirtyObject = GetModelInstanceDirtyObject;
function GetScreenInstDirty(state) {
    return GetC(state, exports.SCREEN_INSTANCE, exports.SCREEN_INSTANCE_DIRTY);
}
exports.GetScreenInstDirty = GetScreenInstDirty;
function GetModelInstDirty(state, instance) {
    return GetK(state, exports.MODEL_INSTANCE, exports.MODEL_INSTANCE_DIRTY, instance);
}
exports.GetModelInstDirty = GetModelInstDirty;
function GetScreenInstanceFocused(key, id) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstFocused(state);
        if (screenInstance && screenInstance[key]) {
            return screenInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceFocused = GetScreenInstanceFocused;
function GetModelInstanceFocused(key, instance, id) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstFocused(state, instance);
        if (modelInstance && modelInstance[key]) {
            return modelInstance[key][id] || null;
        }
    }
    return null;
}
exports.GetModelInstanceFocused = GetModelInstanceFocused;
function GetScreenInstanceFocusedObject(key) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInstFocused(state);
        if (screenInstance) {
            return screenInstance[key] || null;
        }
    }
    return null;
}
exports.GetScreenInstanceFocusedObject = GetScreenInstanceFocusedObject;
function GetModelInstanceFocusedObject(key, instance) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInstFocused(state, instance);
        if (modelInstance) {
            return modelInstance[key] || null;
        }
    }
    return null;
}
exports.GetModelInstanceFocusedObject = GetModelInstanceFocusedObject;
function GetScreenInstFocused(state) {
    return GetC(state, exports.SCREEN_INSTANCE, exports.SCREEN_INSTANCE_FOCUSED);
}
exports.GetScreenInstFocused = GetScreenInstFocused;
function GetModelInstFocused(state, instance) {
    return GetK(state, exports.MODEL_INSTANCE, exports.MODEL_INSTANCE_FOCUSED, instance);
}
exports.GetModelInstFocused = GetModelInstFocused;
function GetScreenInstanceObject(key) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenInst(state);
        if (screenInstance) {
            return screenInstance[key];
        }
    }
    return null;
}
exports.GetScreenInstanceObject = GetScreenInstanceObject;
function GetScreenModelInstance(key, viewModel) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenModelInst(state, viewModel, key);
        if (screenInstance) {
            return screenInstance;
        }
    }
    return null;
}
exports.GetScreenModelInstance = GetScreenModelInstance;
function GetScreenModelBlurInstance(key, viewModel) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenModelBlurInst(state, viewModel, key);
        if (screenInstance) {
            return screenInstance;
        }
    }
    return null;
}
exports.GetScreenModelBlurInstance = GetScreenModelBlurInstance;
function GetScreenModelDirtyInstance(key, viewModel) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenModelDirtyInst(state, viewModel, key);
        if (screenInstance) {
            return screenInstance;
        }
    }
    return null;
}
exports.GetScreenModelDirtyInstance = GetScreenModelDirtyInstance;
function GetScreenModelFocusInstance(key, viewModel) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenModelFocusInst(state, viewModel, key);
        if (screenInstance) {
            return screenInstance;
        }
    }
    return null;
}
exports.GetScreenModelFocusInstance = GetScreenModelFocusInstance;
function GetScreenModelFocusedInstance(key, viewModel) {
    if (_getState) {
        var state = _getState();
        var screenInstance = GetScreenModelFocusedInst(state, viewModel, key);
        if (screenInstance) {
            return screenInstance;
        }
    }
    return null;
}
exports.GetScreenModelFocusedInstance = GetScreenModelFocusedInstance;
function GetAppStateObject(key) {
    if (_getState) {
        var state = _getState();
        var appState = GetAppState(state);
        if (appState) {
            return appState[key];
        }
    }
}
exports.GetAppStateObject = GetAppStateObject;
function GetModelInstanceObject(key, instance) {
    if (_getState) {
        var state = _getState();
        var modelInstance = GetModelInst(state, instance, key);
        if (modelInstance) {
            return modelInstance;
        }
    }
    return null;
}
exports.GetModelInstanceObject = GetModelInstanceObject;
function updateScreenInstance(model, id, value, options) {
    if (options === void 0) { options = {}; }
    return function (dispatch, getState) {
        if (options && options.update) {
            dispatch(Batch(UISMI(exports.SCREEN_INSTANCE, model, options.value, id, value), UISMI(exports.SCREEN_INSTANCE_DIRTY, model, options.value, id, true)));
        }
        else {
            dispatch(Batch(UISI(exports.SCREEN_INSTANCE, model, id, value), UISI(exports.SCREEN_INSTANCE_DIRTY, model, id, true)));
        }
    };
}
exports.updateScreenInstance = updateScreenInstance;
function updateScreenInstanceObject(model, instance, value) {
    return function (dispatch, getState) {
        dispatch(Batch(UISMIO(exports.SCREEN_INSTANCE, model, instance, value)));
    };
}
exports.updateScreenInstanceObject = updateScreenInstanceObject;
function clearScreenInstance(model, id, options) {
    if (options === void 0) { options = {}; }
    return function (dispatch) {
        if (options && options.update) {
            dispatch(Batch(UISMI(exports.SCREEN_INSTANCE, model, options.value, id, null), UISMI(exports.SCREEN_INSTANCE_ON_BLUR, model, options.value, id, false), UISMI(exports.SCREEN_INSTANCE_ON_FOCUS, model, options.value, id, false), UISMI(exports.SCREEN_INSTANCE_DIRTY, model, options.value, id, false), UISMI(exports.SCREEN_INSTANCE_FOCUSED, model, options.value, id, false), UISMI(exports.SCREEN_INSTANCE_FOCUSED, model, options.value, id, false)));
        }
        else {
            dispatch(Batch(UISI(exports.SCREEN_INSTANCE, model, id, null), UISI(exports.SCREEN_INSTANCE_ON_BLUR, model, id, false), UISI(exports.SCREEN_INSTANCE_ON_FOCUS, model, id, false), UISI(exports.SCREEN_INSTANCE_DIRTY, model, id, false), UISI(exports.SCREEN_INSTANCE_FOCUSED, model, id, false), UISI(exports.SCREEN_INSTANCE_FOCUSED, model, id, false)));
        }
    };
}
exports.clearScreenInstance = clearScreenInstance;
function updateScreenInstanceBlur(model, id, options) {
    if (options === void 0) { options = {}; }
    return function (dispatch, getState) {
        if (options && options.update) {
            dispatch(Batch(UISMI(exports.SCREEN_INSTANCE_ON_BLUR, model, options.value, id, true), UISMI(exports.SCREEN_INSTANCE_FOCUSED, model, options.value, id, false)));
        }
        else {
            dispatch(Batch(UISI(exports.SCREEN_INSTANCE_ON_BLUR, model, id, true), UISI(exports.SCREEN_INSTANCE_FOCUSED, model, id, false)));
        }
    };
}
exports.updateScreenInstanceBlur = updateScreenInstanceBlur;
function updateScreenInstanceFocus(model, id, options) {
    if (options === void 0) { options = {}; }
    return function (dispatch, getState) {
        if (options && options.update) {
            dispatch(Batch(UISMI(exports.SCREEN_INSTANCE_ON_FOCUS, model, options.value, id, true), UISMI(exports.SCREEN_INSTANCE_FOCUSED, model, options.value, id, true)));
        }
        else {
            dispatch(Batch(UISI(exports.SCREEN_INSTANCE_ON_FOCUS, model, id, true), UISI(exports.SCREEN_INSTANCE_FOCUSED, model, id, true)));
        }
    };
}
exports.updateScreenInstanceFocus = updateScreenInstanceFocus;
function updateModelInstance(model, instance, id, value) {
    return function (dispatch, getState) {
        dispatch(Batch(UISI(exports.MODEL_INSTANCE, model, instance, id /*, value*/), UISI(exports.MODEL_INSTANCE_DIRTY, model, instance, id /*, true*/)));
    };
}
exports.updateModelInstance = updateModelInstance;
function clearModelInstance(model, instance, id) {
    return function (dispatch, getState) {
        dispatch(Batch(UISI(exports.MODEL_INSTANCE_ON_BLUR, model, instance, id /*, false*/), UISI(exports.MODEL_INSTANCE_ON_FOCUS, model, instance, id /*, false*/), UISI(exports.MODEL_INSTANCE_DIRTY, model, instance, id /*, false*/), UISI(exports.MODEL_INSTANCE_FOCUSED, model, instance, id /*, false*/), UISI(exports.MODEL_INSTANCE_FOCUSED, model, instance, id /*, false*/)));
    };
}
exports.clearModelInstance = clearModelInstance;
function updateModelInstanceBlur(model, instance, id) {
    return function (dispatch, getState) {
        dispatch(Batch(UISI(exports.MODEL_INSTANCE_ON_BLUR, model, instance, id /*, true*/), UISI(exports.MODEL_INSTANCE_FOCUSED, model, instance, id /*, false*/)));
    };
}
exports.updateModelInstanceBlur = updateModelInstanceBlur;
function updateModelInstanceFocus(model, instance, id) {
    return function (dispatch, getState) {
        dispatch(Batch(UISI(exports.MODEL_INSTANCE_ON_FOCUS, model, instance, id /*, true*/), UISI(exports.MODEL_INSTANCE_FOCUSED, model, instance, id /*, true*/)));
    };
}
exports.updateModelInstanceFocus = updateModelInstanceFocus;
