export const BATCH = "BATCH";
export const UI_UPDATE = "UI_UPDATE";
export const UISI_UPDATE = "UISI_UPDATE";
export const UISMI_UPDATE = "UISMI_UPDATE";
export const UISMI_UPDATE_OBJECT = "UISMI_UPDATE_OBJECT";
export const UISP_UPDATE = "UISP_UPDATE";
export const UIMI_UPDATE = "UIMI_UPDATE";
export const UI_MODELS = "UI_MODELS";
export const RESET_ALL = "RESET_ALL";

export const SCREEN_PROPERTIES = "SCREEN_PROPERTIES";

export const MODEL_INSTANCE = "MODEL_INSTANCE";
export const MODEL_INSTANCE_DIRTY = "MODEL_INSTANCE_DIRTY";
export const MODEL_INSTANCE_ON_BLUR = "MODEL_INSTANCE_ON_BLUR";
export const MODEL_INSTANCE_FOCUSED = "MODEL_INSTANCE_FOCUSED";
export const MODEL_INSTANCE_ON_FOCUS = "MODEL_INSTANCE_ON_FOCUS";

export const APP_STATE = "APP_STATE";

export const SCREEN_INSTANCE = "SCREEN_INSTANCE";
export const SCREEN_MODEL_INSTANCE = "SCREEN_MODEL_INSTANCE";
export const SCREEN_MODEL_INSTANCE_OBJECT = "SCREEN_MODEL_INSTANCE_OBJECT";
export const SCREEN_INSTANCE_DIRTY = "SCREEN_INSTANCE_DIRTY";
export const SCREEN_INSTANCE_ON_BLUR = "SCREEN_INSTANCE_ON_BLUR";
export const SCREEN_INSTANCE_FOCUSED = "SCREEN_INSTANCE_FOCUSED";
export const SCREEN_INSTANCE_ON_FOCUS = "SCREEN_INSTANCE_ON_FOCUS";

export const VISUAL = "VISUAL";
let _getState;
let _dispatch;
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

export function GetScreenProperties(screen) {
  if (_getState) {
    let state = _getState();
    let modelDic = GetC(state, SCREEN_PROPERTIES, screen);
    if (modelDic) {
      return modelDic;
    }
  }
  return null;
}

export function UISP(screen, property, value) {
  return {
    type: UISP_UPDATE,
    key: SCREEN_PROPERTIES,
    screen,
    property,
    value
  };
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
    _dispatch = dispatch;
  };
}

export function GetDispatch() {
  if (_dispatch) {
    return _dispatch;
  }
}
export function GetState() {
  if (_getState) {
    return _getState;
  }
}

export function setTestGetState(func) {
  _getState = func;
}

export function setDispatch(func) {
  _dispatch = func;
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
  };
}
export function UIModels(model, value) {
  return {
    type: UI_MODELS,
    model,
    value
  };
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
  };
}
export function UISMI(form, model, instance, item, value) {
  return {
    type: UISMI_UPDATE,
    key: SCREEN_INSTANCE,
    form,
    model,
    instance,
    item,
    value
  };
}
export function UISMIO(form, model, instance, value) {
  return {
    type: UISMI_UPDATE_OBJECT,
    key: SCREEN_INSTANCE,
    form,
    model,
    instance,
    value
  };
}
export function UIMI(form, model, instance, item, value) {
  return {
    type: UIMI_UPDATE,
    key: MODEL_INSTANCE,
    form,
    model,
    instance,
    item,
    value
  };
}
export function Batch(a, b, c, d, e, f, g, h, i) {
  return {
    type: BATCH,
    batch: [a, b, c, d, e, f, g, h, i].filter(x => x)
  };
}
export function Visual(state, key) {
  let _state = Get(state, VISUAL);
  if (_state) {
    return _state[key];
  }
  return null;
}
export function GetC(state, key, id) {
  if (state) {
    if (state.uiReducer && state.uiReducer[key])
      return state.uiReducer[key][id];
  }
  return null;
}

export function GetK(state, key, id, instance) {
  if (state) {
    if (state.uiReducer && state.uiReducer[key]) {
      if (state.uiReducer[key][id]) return state.uiReducer[key][id][instance];
    }
  }
  return null;
}

export function Get(state, key) {
  if (state) if (state.uiReducer[key]) return state.uiReducer[key];
  return null;
}

let _navigation = null;
export function setNavigate(navigation) {
  _navigation = navigation;
}
export function navigate(a, b, c) {
  if (_navigation) return _navigation.navigate(a, b, c);
}
export function GetScreenParam(param) {
  if (_navigation) return _navigation.getParam(param, undefined);
  return undefined;
}
export function GetScreenInstance(key, id) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInst(state);

    if (screenInstance && screenInstance[key]) {
      return screenInstance[key][id] || null;
    }
  }
  return null;
}

export function GetModelInstance(key, instance, id) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInst(state);

    if (modelInstance && modelInstance[key] && modelInstance[key][instance]) {
      return modelInstance[key][instance][id] || null;
    }
  }
  return null;
}

export function GetScreenInst(state) {
  return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE);
}

export function GetScreenModelInst(state, instance, id) {
  let item = GetK(state, SCREEN_INSTANCE, SCREEN_INSTANCE, instance, id);
  if (item) {
    return item[id] || null;
  }
  return null;
}
export function GetScreenModelDirtyInst(state, instance, id) {
  let item = GetK(state, SCREEN_INSTANCE, SCREEN_INSTANCE_DIRTY, instance, id);
  if (item) {
    return item[id] || null;
  }
  return null;
}
export function GetScreenModelFocusedInst(state, instance, id) {
  let item = GetK(
    state,
    SCREEN_INSTANCE,
    SCREEN_INSTANCE_FOCUSED,
    instance,
    id
  );
  if (item) {
    return item[id] || null;
  }
  return null;
}
export function GetScreenModelBlurInst(state, instance, id) {
  let item = GetK(
    state,
    SCREEN_INSTANCE,
    SCREEN_INSTANCE_ON_BLUR,
    instance,
    id
  );
  if (item) {
    return item[id] || null;
  }
  return null;
}
export function GetScreenModelFocusInst(state, instance, id) {
  let item = GetK(
    state,
    SCREEN_INSTANCE_ON_FOCUS,
    SCREEN_INSTANCE_ON_FOCUS,
    instance,
    id
  );
  if (item) {
    return item[id] || null;
  }
  return null;
}

export function GetAppState(state) {
  return GetC(state, APP_STATE, APP_STATE);
}
export function GetModelInst(state, instance, id) {
  return GetK(state, UI_MODELS, instance, id);
}

export function GetScreenInstanceBlur(key, id) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstBlur(state);

    if (screenInstance && screenInstance[key]) {
      return screenInstance[key][id] || null;
    }
  }
  return null;
}
export function GetModelInstanceBlur(key, instance, id) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstBlur(state, instance);

    if (modelInstance && modelInstance[key]) {
      return modelInstance[key][id] || null;
    }
  }
  return null;
}

export function GetScreenInstanceBlurObject(key) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstBlur(state);

    if (screenInstance) {
      return screenInstance[key] || null;
    }
  }
  return null;
}

export function GetModelInstanceBlurObject(key, instance) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstBlur(state, instance);

    if (modelInstance) {
      return modelInstance[key] || null;
    }
  }
  return null;
}

export function GetScreenInstBlur(state) {
  return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_ON_BLUR);
}
export function GetModelInstBlur(state, instance) {
  return GetC(state, MODEL_INSTANCE, MODEL_INSTANCE_ON_BLUR, instance);
}

export function GetScreenInstanceFocus(key, id) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstFocus(state);

    if (screenInstance && screenInstance[key]) {
      return screenInstance[key][id] || null;
    }
  }
  return null;
}
export function GetModelInstanceFocus(key, instance, id) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstFocus(state, instance);

    if (modelInstance && modelInstance[key]) {
      return modelInstance[key][id] || null;
    }
  }
  return null;
}

export function GetScreenInstanceFocusObject(key) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstFocus(state);

    if (screenInstance) {
      return screenInstance[key] || null;
    }
  }
  return null;
}
export function GetModelInstanceFocusObject(key, instance) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstFocus(state, instance);

    if (modelInstance) {
      return modelInstance[key] || null;
    }
  }
  return null;
}

export function GetScreenInstFocus(state) {
  return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_ON_FOCUS);
}

export function GetModelInstFocus(state, instance) {
  return GetK(state, MODEL_INSTANCE, MODEL_INSTANCE_ON_FOCUS, instance);
}

export function GetScreenInstanceDirty(key, id) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstDirty(state);

    if (screenInstance && screenInstance[key]) {
      return screenInstance[key][id] || null;
    }
  }
  return null;
}

export function GetModelInstanceDirty(key, instance, id) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstDirty(state, instance);

    if (modelInstance && modelInstance[key]) {
      return modelInstance[key][id] || null;
    }
  }
  return null;
}

export function GetScreenInstanceDirtyObject(key) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstDirty(state);

    if (screenInstance) {
      return screenInstance[key] || null;
    }
  }
  return null;
}

export function GetModelInstanceDirtyObject(key, instance) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstDirty(state, instance);

    if (modelInstance) {
      return modelInstance[key] || null;
    }
  }
  return null;
}

export function GetScreenInstDirty(state) {
  return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_DIRTY);
}

export function GetModelInstDirty(state, instance) {
  return GetK(state, MODEL_INSTANCE, MODEL_INSTANCE_DIRTY, instance);
}

export function GetScreenInstanceFocused(key, id) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstFocused(state);

    if (screenInstance && screenInstance[key]) {
      return screenInstance[key][id] || null;
    }
  }
  return null;
}

export function GetModelInstanceFocused(key, instance, id) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstFocused(state, instance);

    if (modelInstance && modelInstance[key]) {
      return modelInstance[key][id] || null;
    }
  }
  return null;
}

export function GetScreenInstanceFocusedObject(key) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInstFocused(state);

    if (screenInstance) {
      return screenInstance[key] || null;
    }
  }
  return null;
}

export function GetModelInstanceFocusedObject(key, instance) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInstFocused(state, instance);

    if (modelInstance) {
      return modelInstance[key] || null;
    }
  }
  return null;
}

export function GetScreenInstFocused(state) {
  return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_FOCUSED);
}

export function GetModelInstFocused(state, instance) {
  return GetK(state, MODEL_INSTANCE, MODEL_INSTANCE_FOCUSED, instance);
}

export function GetScreenInstanceObject(key) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenInst(state);
    if (screenInstance) {
      return screenInstance[key];
    }
  }
  return null;
}
export function GetScreenModelInstance(key, viewModel) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenModelInst(state, viewModel, key);
    if (screenInstance) {
      return screenInstance;
    }
  }
  return null;
}
export function GetScreenModelBlurInstance(key, viewModel) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenModelBlurInst(state, viewModel, key);
    if (screenInstance) {
      return screenInstance;
    }
  }
  return null;
}
export function GetScreenModelDirtyInstance(key, viewModel) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenModelDirtyInst(state, viewModel, key);
    if (screenInstance) {
      return screenInstance;
    }
  }
  return null;
}
export function GetScreenModelFocusInstance(key, viewModel) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenModelFocusInst(state, viewModel, key);
    if (screenInstance) {
      return screenInstance;
    }
  }
  return null;
}
export function GetScreenModelFocusedInstance(key, viewModel) {
  if (_getState) {
    let state = _getState();
    let screenInstance = GetScreenModelFocusedInst(state, viewModel, key);
    if (screenInstance) {
      return screenInstance;
    }
  }
  return null;
}
export function GetAppStateObject(key) {
  if (_getState) {
    let state = _getState();
    let appState = GetAppState(state);
    if (appState) {
      return appState[key];
    }
  }
}

export function GetModelInstanceObject(key, instance) {
  if (_getState) {
    let state = _getState();
    let modelInstance = GetModelInst(state, instance, key);
    if (modelInstance) {
      return modelInstance;
    }
  }
  return null;
}

export function updateScreenInstance(model, id, value, options = {}) {
  return (dispatch, getState) => {
    if (options && options.update) {
      dispatch(
        Batch(
          UISMI(SCREEN_INSTANCE, model, options.value, id, value),
          UISMI(SCREEN_INSTANCE_DIRTY, model, options.value, id, true)
        )
      );
    } else {
      dispatch(
        Batch(
          UISI(SCREEN_INSTANCE, model, id, value),
          UISI(SCREEN_INSTANCE_DIRTY, model, id, true)
        )
      );
    }
  };
}

export function updateScreenInstanceObject(model, instance,  value) {
  return (dispatch, getState) => {
    dispatch(Batch(UISMIO(SCREEN_INSTANCE, model, instance, value)));
  };
}

export function clearScreenInstance(model, id, options = {}) {
  return (dispatch, getState) => {
    if (options && options.update) {
      dispatch(
        Batch(
          UISMI(SCREEN_INSTANCE, model, options.value, id, null),
          UISMI(SCREEN_INSTANCE_ON_BLUR, model, options.value, id, false),
          UISMI(SCREEN_INSTANCE_ON_FOCUS, model, options.value, id, false),
          UISMI(SCREEN_INSTANCE_DIRTY, model, options.value, id, false),
          UISMI(SCREEN_INSTANCE_FOCUSED, model, options.value, id, false),
          UISMI(SCREEN_INSTANCE_FOCUSED, model, options.value, id, false)
        )
      );
    } else {
      dispatch(
        Batch(
          UISI(SCREEN_INSTANCE, model, id, null),
          UISI(SCREEN_INSTANCE_ON_BLUR, model, id, false),
          UISI(SCREEN_INSTANCE_ON_FOCUS, model, id, false),
          UISI(SCREEN_INSTANCE_DIRTY, model, id, false),
          UISI(SCREEN_INSTANCE_FOCUSED, model, id, false),
          UISI(SCREEN_INSTANCE_FOCUSED, model, id, false)
        )
      );
    }
  };
}

export function updateScreenInstanceBlur(model, id, options = {}) {
  return (dispatch, getState) => {
    if (options && options.update) {
      dispatch(
        Batch(
          UISMI(SCREEN_INSTANCE_ON_BLUR, model, options.value, id, true),
          UISMI(SCREEN_INSTANCE_FOCUSED, model, options.value, id, false)
        )
      );
    } else {
      dispatch(
        Batch(
          UISI(SCREEN_INSTANCE_ON_BLUR, model, id, true),
          UISI(SCREEN_INSTANCE_FOCUSED, model, id, false)
        )
      );
    }
  };
}

export function updateScreenInstanceFocus(model, id, options = {}) {
  return (dispatch, getState) => {
    if (options && options.update) {
      dispatch(
        Batch(
          UISMI(SCREEN_INSTANCE_ON_FOCUS, model, options.value, id, true),
          UISMI(SCREEN_INSTANCE_FOCUSED, model, options.value, id, true)
        )
      );
    } else {
      dispatch(
        Batch(
          UISI(SCREEN_INSTANCE_ON_FOCUS, model, id, true),
          UISI(SCREEN_INSTANCE_FOCUSED, model, id, true)
        )
      );
    }
  };
}

export function updateModelInstance(model, instance, id, value) {
  return (dispatch, getState) => {
    dispatch(
      Batch(
        UISI(MODEL_INSTANCE, model, instance, id, value),
        UISI(MODEL_INSTANCE_DIRTY, model, instance, id, true)
      )
    );
  };
}

export function clearModelInstance(model, instance, id) {
  return (dispatch, getState) => {
    dispatch(
      Batch(
        UISI(MODEL_INSTANCE_ON_BLUR, model, instance, id, false),
        UISI(MODEL_INSTANCE_ON_FOCUS, model, instance, id, false),
        UISI(MODEL_INSTANCE_DIRTY, model, instance, id, false),
        UISI(MODEL_INSTANCE_FOCUSED, model, instance, id, false),
        UISI(MODEL_INSTANCE_FOCUSED, model, instance, id, false)
      )
    );
  };
}

export function updateModelInstanceBlur(model, instance, id) {
  return (dispatch, getState) => {
    dispatch(
      Batch(
        UISI(MODEL_INSTANCE_ON_BLUR, model, instance, id, true),
        UISI(MODEL_INSTANCE_FOCUSED, model, instance, id, false)
      )
    );
  };
}

export function updateModelInstanceFocus(model, instance, id) {
  return (dispatch, getState) => {
    dispatch(
      Batch(
        UISI(MODEL_INSTANCE_ON_FOCUS, model, instance, id, true),
        UISI(MODEL_INSTANCE_FOCUSED, model, instance, id, true)
      )
    );
  };
}
