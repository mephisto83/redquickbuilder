export const BATCH = 'BATCH';
export const UI_UPDATE = 'UI_UPDATE';
export const UISI_UPDATE = 'UISI_UPDATE';
export const UISMI_UPDATE = 'UISMI_UPDATE';
export const UISMI_UPDATE_OBJECT = 'UISMI_UPDATE_OBJECT';
export const UISP_UPDATE = 'UISP_UPDATE';
export const UIMI_UPDATE = 'UIMI_UPDATE';
export const UI_MODELS = 'UI_MODELS';
export const SITE = 'SITE';
export const RESET_ALL = 'RESET_ALL';

export const SCREEN_PROPERTIES = 'SCREEN_PROPERTIES';

export const MODEL_INSTANCE = 'MODEL_INSTANCE';
export const MODEL_INSTANCE_DIRTY = 'MODEL_INSTANCE_DIRTY';
export const MODEL_INSTANCE_ON_BLUR = 'MODEL_INSTANCE_ON_BLUR';
export const MODEL_INSTANCE_FOCUSED = 'MODEL_INSTANCE_FOCUSED';
export const MODEL_INSTANCE_ON_FOCUS = 'MODEL_INSTANCE_ON_FOCUS';

export const APP_STATE = 'APP_STATE';

export const SCREEN_INSTANCE = 'SCREEN_INSTANCE';
export const SCREEN_MODEL_INSTANCE = 'SCREEN_MODEL_INSTANCE';
export const SCREEN_MODEL_INSTANCE_OBJECT = 'SCREEN_MODEL_INSTANCE_OBJECT';
export const SCREEN_INSTANCE_DIRTY = 'SCREEN_INSTANCE_DIRTY';
export const SCREEN_INSTANCE_ON_BLUR = 'SCREEN_INSTANCE_ON_BLUR';
export const SCREEN_INSTANCE_FOCUSED = 'SCREEN_INSTANCE_FOCUSED';
export const SCREEN_INSTANCE_ON_FOCUS = 'SCREEN_INSTANCE_ON_FOCUS';

export const VISUAL = 'VISUAL';

export const UIKeys = {
	HAS_CREDENTIALS: 'HAS_CREDENTIALS',
	CREDENTIALS: 'CREDENTIALS',
	USER_ID: 'USER_ID'
};

let _getState: any;
let _dispatch: any;
export function GetItems(modelType: any) {
	if (_getState) {
		let state = _getState();
		let modelDic = GetC(state, UI_MODELS, modelType);
		if (modelDic) {
			return Object.values(modelDic);
		}
	}

	return [];
}

export function GetScreenProperties(screen: any) {
	if (_getState) {
		let state = _getState();
		let modelDic = GetC(state, SCREEN_PROPERTIES, screen);
		if (modelDic) {
			return modelDic;
		}
	}
	return null;
}

export function UISP(screen: any, property: any, value: any) {
	return {
		type: UISP_UPDATE,
		key: SCREEN_PROPERTIES,
		screen,
		property,
		value
	};
}

export function GetItem(modelType: any, id: any) {
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
	return (dispatch: any, getState: any) => {
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

export function setTestGetState(func: any) {
	_getState = func;
}

export function setDispatch(func: any) {
	_dispatch = func;
}

export function UIV(item: any, value: any) {
	return UIC(VISUAL, item, value);
}
export function UIC(section: any, item: any, value: any) {
	return {
		type: UI_UPDATE,
		item,
		value,
		section
	};
}
export function UIModels(model: any, value: any) {
	return {
		type: UI_MODELS,
		model,
		value
	};
}
export function Chain(id: any, funcs: any) {
	let res = id;

	funcs.map((func: any) => {
		res = func(res);
	});

	return res;
}
export function UISI(form: any, model: any, item: any, value: any) {
	return {
		type: UISI_UPDATE,
		key: SCREEN_INSTANCE,
		form,
		model,
		item,
		value
	};
}
export function UISMI(form: any, model: any, instance: any, item: any, value: any) {
	return {
		type: UISMI_UPDATE,
		key: SCREEN_MODEL_INSTANCE,
		form,
		model,
		instance,
		item,
		value
	};
}
export function UISMIO(form: any, model: any, instance: any, value: any) {
	return {
		type: UISMI_UPDATE_OBJECT,
		key: SCREEN_MODEL_INSTANCE,
		form,
		model,
		instance,
		value
	};
}
export function UIMI(form: any, model: any, instance: any, item: any, value: any) {
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
export function Batch(a: any, b?: any, c?: any, d?: any, e?: any, f?: any, g?: any, h?: any, i?: any) {
	return {
		type: BATCH,
		batch: [ a, b, c, d, e, f, g, h, i ].filter((x) => x)
	};
}
export function Visual(state: any, key: any) {
	let _state = Get(state, VISUAL);
	if (_state) {
		return _state[key];
	}
	return null;
}
export function GetC(state: any, key: any, id: any) {
	if (state) {
		if (state.uiReducer && state.uiReducer[key]) return state.uiReducer[key][id];
	}
	return null;
}

export function GetK(state: any, key: any, id: any, instance: any) {
	if (state) {
		if (state.uiReducer && state.uiReducer[key]) {
			if (state.uiReducer[key][id]) return state.uiReducer[key][id][instance];
		}
	}
	return null;
}

export function Get(state: any, key: any) {
	if (state) if (state.uiReducer[key]) return state.uiReducer[key];
	return null;
}

let _navigation: any = null;
export function setNavigate(navigation: any) {
	_navigation = navigation;
}
export function navigate(a: any, b: any, c: any) {
	if (_navigation) return _navigation.navigate(a, b, c);
}
export function GetScreenParam(param: any) {
	if (_navigation) return _navigation.getParam(param, undefined);
	return undefined;
}
export function GetScreenInstance(key: any, id: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInst(state);

		if (screenInstance && screenInstance[key]) {
			return screenInstance[key][id] || null;
		}
	}
	return null;
}

export function GetModelInstance(key: any, instance: any, id: any) {
	if (_getState) {
		let state: any = _getState();
		let modelInstance = GetModelInst(state);

		if (modelInstance && modelInstance[key] && modelInstance[key][instance]) {
			return modelInstance[key][instance][id] || null;
		}
	}
	return null;
}

export function GetScreenInst(state: any) {
	return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE);
}

export function GetScreenModelInst(state: any, instance: any, id: any) {
	let item = GetK(state, SCREEN_MODEL_INSTANCE, SCREEN_INSTANCE, instance);
	if (item) {
		return item[id] || null;
	}
	return null;
}
export function GetScreenModelDirtyInst(state: any, instance: any, id: any) {
	let item = GetK(state, SCREEN_MODEL_INSTANCE, SCREEN_INSTANCE_DIRTY, instance);
	if (item) {
		return item[id] || null;
	}
	return null;
}
export function GetScreenModelFocusedInst(state: any, instance: any, id: any) {
	let item = GetK(state, SCREEN_MODEL_INSTANCE, SCREEN_INSTANCE_FOCUSED, instance);
	if (item) {
		return item[id] || null;
	}
	return null;
}
export function GetScreenModelBlurInst(state: any, instance: any, id: any) {
	let item = GetK(state, SCREEN_MODEL_INSTANCE, SCREEN_INSTANCE_ON_BLUR, instance);
	if (item) {
		return item[id] || null;
	}
	return null;
}
export function GetScreenModelFocusInst(state: any, instance: any, id: any) {
	let item = GetK(state, SCREEN_MODEL_INSTANCE, SCREEN_INSTANCE_ON_FOCUS, instance);
	if (item) {
		return item[id] || null;
	}
	return null;
}

export function GetAppState(state: any) {
	return GetC(state, APP_STATE, APP_STATE);
}
export function GetModelInst(state: any, instance?: any, id?: any) {
	return GetK(state, UI_MODELS, instance, id);
}

export function GetScreenInstanceBlur(key: any, id: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstBlur(state);

		if (screenInstance && screenInstance[key]) {
			return screenInstance[key][id] || null;
		}
	}
	return null;
}
export function GetModelInstanceBlur(key: any, instance: any, id: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstBlur(state, instance);

		if (modelInstance && modelInstance[key]) {
			return modelInstance[key][id] || null;
		}
	}
	return null;
}

export function GetScreenInstanceBlurObject(key: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstBlur(state);

		if (screenInstance) {
			return screenInstance[key] || null;
		}
	}
	return null;
}

export function GetModelInstanceBlurObject(key: any, instance: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstBlur(state, instance);

		if (modelInstance) {
			return modelInstance[key] || null;
		}
	}
	return null;
}

export function GetScreenInstBlur(state: any) {
	return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_ON_BLUR);
}
export function GetModelInstBlur(state: any, instance: any) {
	return GetK(state, MODEL_INSTANCE, MODEL_INSTANCE_ON_BLUR, instance);
}

export function GetScreenInstanceFocus(key: any, id: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstFocus(state);

		if (screenInstance && screenInstance[key]) {
			return screenInstance[key][id] || null;
		}
	}
	return null;
}
export function GetModelInstanceFocus(key: any, instance: any, id: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstFocus(state, instance);

		if (modelInstance && modelInstance[key]) {
			return modelInstance[key][id] || null;
		}
	}
	return null;
}

export function GetScreenInstanceFocusObject(key: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstFocus(state);

		if (screenInstance) {
			return screenInstance[key] || null;
		}
	}
	return null;
}
export function GetModelInstanceFocusObject(key: any, instance: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstFocus(state, instance);

		if (modelInstance) {
			return modelInstance[key] || null;
		}
	}
	return null;
}

export function GetScreenInstFocus(state: any) {
	return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_ON_FOCUS);
}

export function GetModelInstFocus(state: any, instance: any) {
	return GetK(state, MODEL_INSTANCE, MODEL_INSTANCE_ON_FOCUS, instance);
}

export function GetScreenInstanceDirty(key: any, id: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstDirty(state);

		if (screenInstance && screenInstance[key]) {
			return screenInstance[key][id] || null;
		}
	}
	return null;
}

export function GetModelInstanceDirty(key: any, instance: any, id: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstDirty(state, instance);

		if (modelInstance && modelInstance[key]) {
			return modelInstance[key][id] || null;
		}
	}
	return null;
}

export function GetScreenInstanceDirtyObject(key: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstDirty(state);

		if (screenInstance) {
			return screenInstance[key] || null;
		}
	}
	return null;
}

export function GetModelInstanceDirtyObject(key: any, instance: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstDirty(state, instance);

		if (modelInstance) {
			return modelInstance[key] || null;
		}
	}
	return null;
}

export function GetScreenInstDirty(state: any) {
	return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_DIRTY);
}

export function GetModelInstDirty(state: any, instance: any) {
	return GetK(state, MODEL_INSTANCE, MODEL_INSTANCE_DIRTY, instance);
}

export function GetScreenInstanceFocused(key: any, id: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstFocused(state);

		if (screenInstance && screenInstance[key]) {
			return screenInstance[key][id] || null;
		}
	}
	return null;
}

export function GetModelInstanceFocused(key: any, instance: any, id: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstFocused(state, instance);

		if (modelInstance && modelInstance[key]) {
			return modelInstance[key][id] || null;
		}
	}
	return null;
}

export function GetScreenInstanceFocusedObject(key: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInstFocused(state);

		if (screenInstance) {
			return screenInstance[key] || null;
		}
	}
	return null;
}

export function GetModelInstanceFocusedObject(key: any, instance: any) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInstFocused(state, instance);

		if (modelInstance) {
			return modelInstance[key] || null;
		}
	}
	return null;
}

export function GetScreenInstFocused(state: any) {
	return GetC(state, SCREEN_INSTANCE, SCREEN_INSTANCE_FOCUSED);
}

export function GetModelInstFocused(state: any, instance: any) {
	return GetK(state, MODEL_INSTANCE, MODEL_INSTANCE_FOCUSED, instance);
}

export function GetScreenInstanceObject(key: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenInst(state);
		if (screenInstance) {
			return screenInstance[key];
		}
	}
	return null;
}
export function GetScreenModelInstance(key: any, viewModel: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenModelInst(state, viewModel, key);
		if (screenInstance) {
			return screenInstance;
		}
	}
	return null;
}
export function GetScreenModelBlurInstance(key: any, viewModel: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenModelBlurInst(state, viewModel, key);
		if (screenInstance) {
			return screenInstance;
		}
	}
	return null;
}
export function GetScreenModelDirtyInstance(key: any, viewModel: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenModelDirtyInst(state, viewModel, key);
		if (screenInstance) {
			return screenInstance;
		}
	}
	return null;
}
export function GetScreenModelFocusInstance(key: any, viewModel: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenModelFocusInst(state, viewModel, key);
		if (screenInstance) {
			return screenInstance;
		}
	}
	return null;
}
export function GetScreenModelFocusedInstance(key: any, viewModel: any) {
	if (_getState) {
		let state = _getState();
		let screenInstance = GetScreenModelFocusedInst(state, viewModel, key);
		if (screenInstance) {
			return screenInstance;
		}
	}
	return null;
}
export function GetAppStateObject(key: any) {
	if (_getState) {
		let state = _getState();
		let appState = GetAppState(state);
		if (appState) {
			return appState[key];
		}
	}
}

function isGuid(stringToTest: any) {
	var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
	return regexGuid.test(stringToTest);
}
export function GetModelInstanceObject(key: any, instance: any, fetchModel?: Function) {
	if (_getState) {
		let state = _getState();
		let modelInstance = GetModelInst(state, instance, key);
		if (modelInstance) {
			return modelInstance;
		}
		else if (fetchModel && instance && key && isGuid(key)) {
			fetchModel(instance, key);
		}
	}
	return null;
}

export function updateScreenInstance(model: any, id: any, value: any, options: any = {}) {
	return (dispatch: any, getState: any) => {
		if (options && options.update) {
			dispatch(
				Batch(
					UISMI(SCREEN_INSTANCE, model, options.value, id, value),
					UISMI(SCREEN_INSTANCE_DIRTY, model, options.value, id, true)
				)
			);
		} else {
			dispatch(Batch(UISI(SCREEN_INSTANCE, model, id, value), UISI(SCREEN_INSTANCE_DIRTY, model, id, true)));
		}
	};
}

export function updateScreenInstanceObject(model: any, instance: any, value: any) {
	return (dispatch: any, getState: any) => {
		dispatch(Batch(UISMIO(SCREEN_INSTANCE, model, instance, value)));
	};
}

export function clearScreenInstance(model: any, id: any, options: any = {}) {
	return (dispatch: any) => {
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

export function updateScreenInstanceBlur(model: any, id: any, options: any = {}) {
	return (dispatch: any, getState: any) => {
		if (options && options.update) {
			dispatch(
				Batch(
					UISMI(SCREEN_INSTANCE_ON_BLUR, model, options.value, id, true),
					UISMI(SCREEN_INSTANCE_FOCUSED, model, options.value, id, false)
				)
			);
		} else {
			dispatch(
				Batch(UISI(SCREEN_INSTANCE_ON_BLUR, model, id, true), UISI(SCREEN_INSTANCE_FOCUSED, model, id, false))
			);
		}
	};
}

export function updateScreenInstanceFocus(model: any, id: any, options: any = {}) {
	return (dispatch: any, getState: any) => {
		if (options && options.update) {
			dispatch(
				Batch(
					UISMI(SCREEN_INSTANCE_ON_FOCUS, model, options.value, id, true),
					UISMI(SCREEN_INSTANCE_FOCUSED, model, options.value, id, true)
				)
			);
		} else {
			dispatch(
				Batch(UISI(SCREEN_INSTANCE_ON_FOCUS, model, id, true), UISI(SCREEN_INSTANCE_FOCUSED, model, id, true))
			);
		}
	};
}

export function updateModelInstance(model: any, instance: any, id: any, value: any) {
	return (dispatch: any, getState: any) => {
		dispatch(
			Batch(
				UISI(MODEL_INSTANCE, model, instance, id /*, value*/),
				UISI(MODEL_INSTANCE_DIRTY, model, instance, id /*, true*/)
			)
		);
	};
}

export function clearModelInstance(model: any, instance: any, id: any) {
	return (dispatch: any, getState: any) => {
		dispatch(
			Batch(
				UISI(MODEL_INSTANCE_ON_BLUR, model, instance, id /*, false*/),
				UISI(MODEL_INSTANCE_ON_FOCUS, model, instance, id /*, false*/),
				UISI(MODEL_INSTANCE_DIRTY, model, instance, id /*, false*/),
				UISI(MODEL_INSTANCE_FOCUSED, model, instance, id /*, false*/),
				UISI(MODEL_INSTANCE_FOCUSED, model, instance, id /*, false*/)
			)
		);
	};
}

export function updateModelInstanceBlur(model: any, instance: any, id: any) {
	return (dispatch: any, getState: any) => {
		dispatch(
			Batch(
				UISI(MODEL_INSTANCE_ON_BLUR, model, instance, id /*, true*/),
				UISI(MODEL_INSTANCE_FOCUSED, model, instance, id /*, false*/)
			)
		);
	};
}

export function updateModelInstanceFocus(model: any, instance: any, id: any) {
	return (dispatch: any, getState: any) => {
		dispatch(
			Batch(
				UISI(MODEL_INSTANCE_ON_FOCUS, model, instance, id /*, true*/),
				UISI(MODEL_INSTANCE_FOCUSED, model, instance, id /*, true*/)
			)
		);
	};
}

export function GetModelProperty($id: any, modelType: string, propertyName: string, fetchModel: Function) {
	let x: any = $id ? $id.object : null;
	let id: any = x;

	let item = typeof id === 'object' ? id : GetItem(modelType, id);
	if (!item && id && typeof id === 'string') {
		fetchModel(modelType, id);
	}
	if (item && item.hasOwnProperty && item.hasOwnProperty(propertyName)) {
		return item[propertyName];
	}
	return null;
}
// TODO: Copy to other uiactions later. 10/10/2020
export function LoadModel(viewModelDefault: string, modelKey: string, retrieveParameters: Function) {
	let params = retrieveParameters();
	let { model, value, viewModel = viewModelDefault } = params;
	let dispatch = GetDispatch();
	let currentItem = GetItem(modelKey, model || value);
	if (currentItem) {
		dispatch(clearScreenInstance(viewModel, currentItem ? currentItem.id : null, currentItem));
		dispatch(updateScreenInstanceObject(viewModel, currentItem ? currentItem.id : null, { ...currentItem }));
	}

	return params;
}
// TODO: Copy to other uiactions later. 10/10/2020
export function StoreInLake(a: any, modelKey: string) {
	let dispatch = GetDispatch();

	dispatch(Batch(UIModels(modelKey, a)));

	return a;
}

// TODO: Copy to other uiactions later. 10/10/2020
export function StoreModelArray(a: any[], modelType: string, stateKey: string) {
	let dispatch = GetDispatch();

	dispatch(UIModels(modelType, a));

	let ids = (a || []).map((x: any) => (x ? x.id : null));

	dispatch(UIC('Data', stateKey, ids));

	return ids;
}
// TODO: Copy to other uiactions later. 10/10/2020
export function GetMenuDataSource(GetMenuSource: any, RedGraph: any) {
	let array = GetMenuSource({ getState: GetState(), dispatch: GetDispatch() });

	let graph = RedGraph.create();

	array
		.map((item: any) => {
			RedGraph.addNode(graph, item, null);
		})
		.forEach((item: any) => {
			if (item && item.parent) {
				RedGraph.addLink(graph, item.parent, item.id);
			}
		});
	return graph;
}

// TODO: Copy to other uiactions later. 10/10/2020
export function StoreResultInReducer(x: any, modelType: string, navigate: any) {
	x = x !== undefined || x !== null ? [ x ] : [];
	let dispatch = GetDispatch();
	dispatch(UIModels(modelType, x));
	navigate.GoBack()(dispatch, GetState());
}

// TODO: Copy to other uiactions later. 10/11/2020
export function NavigateToRoute(id: string, navigate: any, routes: any) {
	navigate.Go({ route: routes[id] })(GetDispatch(), GetState());
}

// TODO: Copy to other uiactions later. 10/11/2020
export function NavigateToScreen(
	$id?: any,
	$internalComponentState?: {
		[str: string]: any;
		label?: string | number | null;
		viewModel?: string | number | null;
		value?: string | number | null;
		model?: string | number | null;
	} | null,
	route?: string,
	navigate?: any
) {
	if (route) {
		let a = { value: $id };

		if (a && typeof a === 'object' && a.hasOwnProperty('success')) {
			return a;
		}
		if ($internalComponentState) {
			Object.keys($internalComponentState).forEach((v: any) => {
				let regex = new RegExp(`\:${v}`, 'gm');
				if (route) route = route.replace(regex, $internalComponentState[v]);
			});
		}

		let regex = new RegExp(`\:value`, 'gm');
		if (route) route = route.replace(regex, a.value);

		navigate.Go({ route })(GetDispatch(), GetState());
		return a;
	}
	return null;
}
