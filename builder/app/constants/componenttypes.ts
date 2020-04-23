import { NodeTypes, UITypes, LinkType, LinkPropertyKeys } from './nodetypes';
import {
	NodeProperties,
	GetRootGraph,
	GetNodeProp,
	GetState,
	GetCodeName,
	ComponentApiKeys
} from '../actions/uiactions';
import { GetNodesLinkedTo } from '../methods/graph_methods';
import { bindTemplate } from './functiontypes';

export const StyleTags = {
	style: 'style',
	style_input: ' style_input',
	style_label: 'style_label',
	style_item: 'style_item',
	style_button: 'style_button'
};

export const ComponentTags = {
	Self: 'Self',
	'main-screen': 'main-screen',
	'main-screen-container': 'main-screen-container',
	Container: 'Container',
	MainMenu: 'MainMenu',
	MainSection: 'MainSection',
	SideContainer: 'SideContainer',
	MainHeader: 'MainHeader',
	TopMenu: 'TopMenu',
	Field: 'Field',
	LeftContainer: 'LeftContainer',
	Screen: 'Screen',
	List: 'List',
	MainContent: 'MainContent',
	SecondaryContent: 'SecondaryContent',
	RightContainer: 'RightContainer',
	Form: 'Form',
	SecondaryMain: 'SecondaryMain',
	MainButton: 'MainButton',
	CancelButton: 'CancelButton',
	SecondaryButton: 'SecondaryButton',
	Bottom: 'Bottom',
	ListItem: 'ListItem',
	Footer: 'Footer'
};

export const NAVIGATION = '-NAVIGATION';
export const APP_METHOD = '-APP_METHOD';
export const ON_BLUR = 'onBlur';
export const ON_FOCUS = 'onFocus';
export const ON_CHANGE = 'onChange';
export const ON_CHANGE_TEXT = 'onChangeText';
export const ARE_HANDLERS = [ ON_BLUR, ON_FOCUS, ON_CHANGE_TEXT, ON_CHANGE ];
export const ARE_BOOLEANS = [];
export const ARE_TEXT_CHANGE = [ ON_CHANGE_TEXT ];
export const VALUE = 'value';
export const SHARED_COMPONENT_API = [ VALUE ].map((x) => ({ property: x }));
export const GENERAL_COMPONENT_API = [ VALUE ].map((x) => ({ property: x }));
export const ComponentApiTypes = {
	ViewModel: 'viewModel',
	Value: 'value'
};
export const ComponentLifeCycleEvents = {
	ComponentDidMount: 'componentDidMount',
	ComponentWillUnmount: 'componentWillUnmount'
};
export const ComponentEvents: any = {
	onPress: 'onPress',
	onClick: 'onClick',
	onFocus: 'onFocus',
	onBlur: 'onBlur',
	onChange: 'onChange',
	onChangeText: 'onChangeText'
};
export const ComponentEventStandardHandler: any = {
	[ComponentEvents.onChange]: `onChange={(evt)=>{
    if(this.props.onChange) {
      this.props.onChange(evt);
    }
  }}`
};
export const SCREEN_COMPONENT_EVENTS = [
	ComponentLifeCycleEvents.ComponentDidMount,
	ComponentLifeCycleEvents.ComponentWillUnmount
];
export const PropertyApiList = [ 'error', 'success', VALUE ].map((v) => ({
	value: v
}));
export const ApiProperty = {
	Error: 'error',
	Success: 'success',
	Value: 'value'
};
const INPUT_DEFAULT_API = [
	VALUE,
	ON_BLUR,
	ON_FOCUS,
	ON_CHANGE_TEXT,
	'inlineLabel',
	'floatingLabel',
	'stackedLabel',
	'fixedLabel',
	'success',
	'error'
].map((x) => ({ property: x }));
const BUTTON_DEFAULT_API = [
	'block',
	'primary',
	'transparent',
	'success',
	'danger',
	'warning',
	'info',
	'bordered',
	'disabled',
	'rounded',
	'large',
	'small',
	'active'
].map((x) => ({ property: x }));
const LOCAL_STATE_PROPERTY = [ 'error' ].map((x) => ({ property: x }));
const LABEL_DEFAULT_API = [ 'data' ].map((x) => ({ property: x }));
const DEFAULT_INPUT_API_PROPERTIES: any = {};
const DEFAULT_BUTTON_API_PROPERTIES: any = {};

BUTTON_DEFAULT_API.forEach((x) => {
	DEFAULT_BUTTON_API_PROPERTIES[x.property] = {
		nodeProperty: x.property,
		parameterConfig: true,
		isHandler: false,
		ui: true
	};
});
LOCAL_STATE_PROPERTY.forEach((x) => {
	DEFAULT_BUTTON_API_PROPERTIES[x.property] = {
		nodeProperty: x.property,
		parameterConfig: true,
		isHandler: false,
		ui: true,
		localStateProperty: true
	};
});
DEFAULT_BUTTON_API_PROPERTIES.style_button = {
	style: 'style'
};
DEFAULT_BUTTON_API_PROPERTIES.style = {
	style: 'style'
};

INPUT_DEFAULT_API.forEach((x) => {
	DEFAULT_INPUT_API_PROPERTIES[x.property] = {
		nodeProperty: x.property,
		parameterConfig: true,
		isHandler: ARE_HANDLERS.indexOf(x.property) !== -1,
		ui: true
	};
});
[ 'style_label', 'style_item', 'style_input' ].map((x) => ({ property: x })).forEach((x) => {
	DEFAULT_INPUT_API_PROPERTIES[x.property] = {
		style: 'style'
	};
});
export const ComponentTypeKeys = {
	SingleSelect: 'SingleSelect',
	List: 'List',
	Button: 'Button',
	ListItem: 'ListItem',
	Password: 'Password',
	MultiSelectList: 'MultiSelectList',
	CheckBox: 'CheckBox',
	Menu: 'Menu',
	Input: 'Input',
	Text: 'Text',
	H1: 'H1',
	InfiniteList: 'InfiniteList' // a list of items which maybe of unbounded length, create items and add to list, and remove and delete items, and update items
};
export const ComponentTypes: any = {
	ReactNative: {
		Badge: {},
		Body: {},
		[ComponentTypeKeys.Button]: {
			template: './app/templates/components/button.tpl',
			defaultApi: BUTTON_DEFAULT_API,
			eventApi: [ ComponentEvents.onPress ],
			properties: {
				onPress: {
					nodeProperty: 'onPress',
					template: '() => { {{value}} }',
					method: true,
					nowrap: true,
					options: [ NAVIGATION, APP_METHOD ],
					ui: true
				},
				...DEFAULT_BUTTON_API_PROPERTIES
			}
		},
		Card: {},
		CardItem: {},
		[ComponentTypeKeys.CheckBox]: {
			template: './app/templates/components/checkbox.tpl',
			defaultApi: INPUT_DEFAULT_API,
			eventApi: [ ComponentEvents.onBlur, ComponentEvents.onFocus, ComponentEvents.onChangeText ],
			properties: {
				item_attributes: {
					nodeProperty: NodeProperties.TextType,
					template: '{{value}}',
					options: [
						'fixedLabel',
						'inlineLabel',
						'floatingLabel',
						'stackedLabel',
						'regular',
						'rounded',
						'success',
						'error',
						'disabled'
					],
					ui: true
				},
				...DEFAULT_INPUT_API_PROPERTIES,
				value: {
					nodeProperty: NodeProperties.value,
					template: true
				},
				label: {
					nodeProperty: NodeProperties.Label,
					template: true
				},
				placeholder: {
					nodeProperty: NodeProperties.Placeholder,
					template: true
				},
				error: {
					nodeProperty: NodeProperties.Error,
					template: true
				},
				success: {
					nodeProperty: NodeProperties.Success,
					template: true
				}
			}
		},
		Container: {},
		Content: {},
		Fab: {},
		Footer: {},
		FooterTab: {},
		Form: {
			layout: true,
			template: './app/templates/components/form.tpl',
			properties: {
				value: {
					nodeProperty: NodeProperties.value,
					parameterConfig: true,
					ui: true
				}
			}
		},
		[ComponentTypeKeys.H1]: {
			template: './app/templates/components/h1.tpl',
			properties: {
				value: {
					nodeProperty: NodeProperties.value,
					template: true
				},
				label: {
					nodeProperty: NodeProperties.Label,
					template: true
				}
			}
		},
		H2: {
			template: './app/templates/components/h2.tpl',
			properties: {
				value: {
					nodeProperty: NodeProperties.value,
					template: true
				},
				label: {
					nodeProperty: NodeProperties.Label,
					template: true
				}
			}
		},
		H3: {
			template: './app/templates/components/h3.tpl',
			properties: {
				value: {
					nodeProperty: NodeProperties.value,
					template: true
				},
				label: {
					nodeProperty: NodeProperties.Label,
					template: true
				}
			}
		},
		Header: {
			template: './app/templates/components/header.tpl',
			properties: {
				left: {
					nodeProperty: 'HeaderLeft',
					template: '{{value}}',
					options: [ true, false ],
					ui: true
				},
				right: {
					nodeProperty: 'HeaderRight',
					template: '{{value}}',
					options: [ true, false ],
					ui: true
				},
				title: {
					nodeProperty: 'HeaderTitle',
					template: '{{value}}',
					options: [ true, false ],
					ui: true
				}
			}
		},
		Icon: {},
		Image: {
			library: 'react-native',
			template: './app/templates/components/image.tpl',
			properties: {
				data: {
					ui: true,
					nodeProperty: 'data',
					nodeTypes: [ NodeTypes.DataChain ],
					nodeFilter: (item: any) => GetNodeProp(item, NodeProperties.EntryPoint),
					template: (node: any) => {
						const func = GetCodeName(GetNodeProp(node, 'data'), {
							includeNameSpace: true
						});
						if (func) {
							return bindTemplate(`DC.{{function}}({{value}})`, {
								function: func,
								value: `this.props.data`
							});
						}
						return `this.props.data`;
					}
				}
			}
		},
		[ComponentTypeKeys.Input]: {
			template: './app/templates/components/input.tpl',
			defaultApi: INPUT_DEFAULT_API,
			eventApi: [ ComponentEvents.onBlur, ComponentEvents.onFocus, ComponentEvents.onChangeText ],
			properties: {
				item_attributes: {
					nodeProperty: NodeProperties.TextType,
					template: '{{value}}',
					options: [
						'fixedLabel',
						'inlineLabel',
						'floatingLabel',
						'stackedLabel',
						'regular',
						'rounded',
						'success',
						'error',
						'disabled'
					],
					ui: true
				},
				...DEFAULT_INPUT_API_PROPERTIES,
				value: {
					nodeProperty: NodeProperties.value,
					template: true
				},
				label: {
					nodeProperty: NodeProperties.Label,
					template: true
				},
				placeholder: {
					nodeProperty: NodeProperties.Placeholder,
					template: true
				},
				error: {
					nodeProperty: NodeProperties.Error,
					template: true
				},
				success: {
					nodeProperty: NodeProperties.Success,
					template: true
				}
			}
		},
		Generic: {
			properties: {
				value: {
					nodeProperty: NodeProperties.value,
					parameterConfig: true,
					ui: true
				}
			}
		},
		InputGroup: {},
		Item: {},
		Label: {},
		Left: {},
		[ComponentTypeKeys.List]: {
			library: 'react-native',
			layout: true,
			specialLayout: true,
			eventApi: [ 'onEndReachedThreshold', 'onEndReached' ],
			template: './app/templates/components/list.tpl',
			datasource: true,
			properties: {
				item_attributes: {
					nodeProperty: NodeProperties.TextType,
					template: '{{value}}',
					component_options: [ NodeTypes.ComponentNode ],
					ui: true
				}
			},
			ui: true
		},
		Menu: {
			template: './app/templates/components/menu.tpl',
			eventApi: [ ComponentEvents.onPress ],
			properties: {
				value: {
					nodeProperty: NodeProperties.value,
					template: true
				},
				label: {
					nodeProperty: NodeProperties.Label,
					template: true
				}
			}
		},
		MultiViewList: {
			layout: true,
			specialLayout: true,
			eventApi: [ 'onEndReachedThreshold', 'onEndReached' ],
			template: './app/templates/components/multiviewlist.tpl',
			datasource: true,
			properties: {
				item_attributes: {
					nodeProperty: NodeProperties.TextType,
					template: '{{value}}',
					component_options: [ NodeTypes.ComponentNode ],
					ui: true
				}
			},
			ui: true
		},
		[ComponentTypeKeys.MultiSelectList]: {
			layout: true,
			specialLayout: true,
			eventApi: [ 'onEndReachedThreshold', 'onEndReached' ],
			events: {
				[ComponentEvents.onChange]: true
			},
			template: './app/templates/components/multiselectlist.tpl',
			datasource: true,
			properties: {
				item_attributes: {
					nodeProperty: NodeProperties.TextType,
					template: '{{value}}',
					component_options: [ NodeTypes.ComponentNode ],
					ui: true
				}
			},
			ui: true
		},
		[ComponentTypeKeys.InfiniteList]: {
			layout: true,
			specialLayout: true,
			eventApi: [ 'onEndReachedThreshold', 'onEndReached' ],
			template: './app/templates/components/infinitelist.tpl',
			datasource: true,
			properties: {
				item_attributes: {
					nodeProperty: NodeProperties.TextType,
					template: '{{value}}',
					component_options: [ NodeTypes.ComponentNode ],
					ui: true
				}
			},
			ui: true
		},
		[ComponentTypeKeys.SingleSelect]: {
			layout: true,
			specialLayout: true,
			eventApi: [ 'onEndReachedThreshold', 'onEndReached' ],
			events: {
				[ComponentEvents.onChange]: true
			},
			template: './app/templates/components/singleselect.tpl',
			datasource: true,
			properties: {
				item_attributes: {
					nodeProperty: NodeProperties.TextType,
					template: '{{value}}',
					component_options: [ NodeTypes.ComponentNode ],
					ui: true
				}
			},
			ui: true
		},
		[ComponentTypeKeys.ListItem]: {
			layout: true,
			ui: true,
			[NAVIGATION]: true,
			[APP_METHOD]: true,
			properties: {
				onPress: {
					nodeProperty: 'onPress',
					template: '() => { {{value}} }',
					method: true,
					options: [ NAVIGATION, APP_METHOD ],
					ui: true
				}
			}
		},
		Picker: {},
		Radio: {},
		Right: {},
		Segment: {},
		Separator: {},
		Spinner: {},
		Subtitle: {},
		SwipeRow: {},
		Switch: {},
		Tab: {},
		TabBar: {},
		TabContainer: {},
		TabHeader: {},
		[ComponentTypeKeys.Text]: {
			template: './app/templates/components/text.tpl',
			defaultApi: LABEL_DEFAULT_API,
			internalApiNode: ComponentApiKeys.DATA,
			externalApiNode: ComponentApiKeys.DATA,
			properties: {
				value: {
					nodeProperty: NodeProperties.value,
					template: true
				},
				data: {
					ui: true,
					nodeProperty: ComponentApiKeys.DATA,
					nodeTypes: [ NodeTypes.DataChain ],
					nodeFilter: (item: any) => GetNodeProp(item, NodeProperties.EntryPoint),
					template: (node: any) => {
						const func = GetCodeName(GetNodeProp(node, ComponentApiKeys.DATA), {
							includeNameSpace: true
						});
						if (GetNodeProp(node, 'component-as-label')) {
							return `titleService.get('${GetNodeProp(node, NodeProperties.Label)}')`;
						}
						if (func) {
							return bindTemplate(`DC.{{function}}({{value}})`, {
								function: func,
								value: `this.props.${ComponentApiKeys.DATA}`
							});
						}
						return `this.props.${ComponentApiKeys.DATA}`;
					}
				}
			}
		},
		Textarea: {},
		Thumbnail: {
			template: './app/templates/components/thumbnail.tpl',
			properties: {
				data: {
					ui: true,
					nodeProperty: 'data',
					nodeTypes: [ NodeTypes.DataChain ],
					nodeFilter: (item: any) => GetNodeProp(item, NodeProperties.EntryPoint),
					template: (node: any) => {
						const func = GetCodeName(GetNodeProp(node, 'data'), {
							includeNameSpace: true
						});
						if (func) {
							return bindTemplate(`DC.{{function}}({{value}})`, {
								function: func,
								value: `this.props.data`
							});
						}
						return `this.props.data`;
					}
				}
			}
		},
		Title: {},
		Toast: {},
		View: {
			eventApi: [ 'componentDidMount' ],
			layout: true
		},
		LoginSelector: {
			template: './app/templates/components/loginselector.tpl',
			library: './login-selector'
		}
	}
};
ComponentTypes[UITypes.ReactNative][ComponentTypeKeys.Password] = { ...ComponentTypes[UITypes.ReactNative].Input };

ComponentTypes[UITypes.ReactNative][ComponentTypeKeys.Password].template = './app/templates/components/password.tpl';

ComponentTypes[UITypes.ElectronIO] = { ...ComponentTypes.ReactNative };
Object.keys(ComponentTypes.ReactNative).map((key) => {
	if (ComponentTypes.ReactNative[key]) {
		ComponentTypes.ReactNative[key].library = ComponentTypes.ReactNative[key].library || 'native-base';
		ComponentTypes.ReactNative[key].key = key;
		ComponentTypes.ReactNative[key].properties = ComponentTypes.ReactNative[key].properties || {};
		ComponentTypes.ReactNative[key].properties.label = ComponentTypes.ReactNative[key].properties.label || {
			nodeProperty: NodeProperties.Label,
			template: `{titleService.get('{{value}}')}`,
			ui: true
		};
	}
});

ComponentTypes[UITypes.ElectronIO][ComponentTypeKeys.Button] = {
	...ComponentTypes[UITypes.ElectronIO][ComponentTypeKeys.Button],
	eventApi: [ ComponentEvents.onClick ],
	properties: {
		...ComponentTypes[UITypes.ElectronIO][ComponentTypeKeys.Button].properties,
		onClick: {
			nodeProperty: 'onClick',
			template: '() => { {{value}} }',
			method: true,
			nowrap: true,
			options: [ NAVIGATION, APP_METHOD ],
			ui: true
		}
	}
};
ComponentTypes[UITypes.ElectronIO].Menu = {
	...ComponentTypes[UITypes.ElectronIO].Menu,
	eventApi: [ ComponentEvents.onClick ],
	properties: {
		...ComponentTypes[UITypes.ElectronIO].Menu.properties,
		onClick: {
			nodeProperty: 'onClick',
			template: '() => { {{value}} }',
			method: true,
			nowrap: true,
			options: [ NAVIGATION, APP_METHOD ],
			ui: true
		}
	}
};
ComponentTypes[UITypes.ReactWeb] = { ...ComponentTypes.ElectronIO };

export const HandlerTypes = {
	Blur: 'blur',
	Change: 'change',
	ChangeText: 'changeText',
	Focus: 'focus',
	Property: 'property'
};
export const InstanceTypes = {
	ScreenInstance: 'ScreenInstance',
	ScreenInstanceBlur: 'ScreenInstanceBlur',
	ScreenInstanceFocus: 'ScreenInstanceFocus',
	ScreenInstanceFocused: 'ScreenInstanceFocused',
	ScreenInstanceDirty: 'ScreenInstanceDirty',

	ModelInstance: 'ModelInstance',
	ModelInstanceBlur: 'ModelInstanceBlur',
	ModelInstanceFocus: 'ModelInstanceFocus',
	ModelInstanceFocused: 'ModelInstanceFocused',
	ModelInstanceDirty: 'ModelInstanceDirty',

	Instance: 'Instance',
	AppState: 'AppState',
	PropInstance: 'PropInstance',
	ApiProperty: 'ApiProperty',
	ScreenParam: 'ScreenParam',
	Selector: 'Selector',
	SelectorInstance: 'SelectorInstance',
	Boolean: 'Boolean',
	AddAnotherIfTheseDontMakeSense: 'add another if these dont make sense'
};
export const SelectorKeys = {
	screen: {
		object: InstanceTypes.ScreenInstance,
		blur: InstanceTypes.ScreenInstanceBlur,
		focus: InstanceTypes.ScreenInstanceFocus,
		focused: InstanceTypes.ScreenInstanceFocused,
		dirty: InstanceTypes.ScreenInstanceDirty
	},
	model: {
		object: InstanceTypes.ModelInstance,
		blur: InstanceTypes.ModelInstanceBlur,
		focus: InstanceTypes.ModelInstanceFocus,
		focused: InstanceTypes.ModelInstanceFocused,
		dirty: InstanceTypes.ModelInstanceDirty
	}
};

export const InstanceTypeSelectorFunction = {
	[InstanceTypes.ScreenInstance]: 'GetScreenInstanceObject',
	[InstanceTypes.ScreenInstanceBlur]: 'GetScreenInstanceBlurObject',
	[InstanceTypes.ScreenInstanceFocus]: 'GetScreenInstanceFocusObject',
	[InstanceTypes.ScreenInstanceFocused]: 'GetScreenInstanceFocusedObject',
	[InstanceTypes.ScreenInstanceDirty]: 'GetScreenInstanceDirtyObject',

	[InstanceTypes.AppState]: 'GetAppStateObject',

	[InstanceTypes.ModelInstance]: 'GetModelInstanceObject',
	[InstanceTypes.ModelInstanceBlur]: 'GetModelInstanceBlurObject',
	[InstanceTypes.ModelInstanceFocus]: 'GetModelInstanceFocusObject',
	[InstanceTypes.ModelInstanceFocused]: 'GetModelInstanceFocusedObject',
	[InstanceTypes.ModelInstanceDirty]: 'GetModelInstanceDirtyObject'
};

export function GetListItemNode(id: any) {
	const state = GetState();
	const graph = GetRootGraph(state);
	const nodes = GetNodesLinkedTo(graph, {
		id
	}).filter(
		(x: any) =>
			GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode &&
			GetNodeProp(x, NodeProperties.ComponentType) === ComponentTypes.ReactNative.ListItem.key
	);
	if (nodes && nodes.length) {
		return nodes[0];
	}
	return null;
}

export function GetFormItemNode(id: any) {
	const state = GetState();
	const graph = GetRootGraph(state);
	const nodes = GetNodesLinkedTo(graph, {
		id,
		link: LinkType.Component,
		properties: { [LinkPropertyKeys.AsForm]: true }
	});
	if (nodes && nodes.length) {
		return nodes[0];
	}
	return null;
}