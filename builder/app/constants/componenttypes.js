import { NodeTypes } from "./nodetypes";
import { NodeProperties, GetRootGraph, GetNodeProp, GetState, GetCodeName } from "../actions/uiactions";
import { GetNodesLinkedTo } from "../methods/graph_methods";
import { bindTemplate } from "./functiontypes";

export const NAVIGATION = '-NAVIGATION';
export const APP_METHOD = '-APP_METHOD';
export const ON_BLUR = 'onBlur';
export const ON_FOCUS = 'onFocus';
export const ON_CHANGE = 'onChange';
export const ON_CHANGE_TEXT = 'onChangeText';
export const ARE_HANDLERS = [ON_BLUR, ON_FOCUS, ON_CHANGE_TEXT, ON_CHANGE];
export const ARE_BOOLEANS = [];
export const ARE_TEXT_CHANGE = [ON_CHANGE_TEXT];
export const VALUE = 'value';
export const SHARED_COMPONENT_API = [VALUE].map(x => ({ property: x }));
export const GENERAL_COMPONENT_API = [VALUE].map(x => ({ property: x }));

export const ComponentEvents = {
    ComponentDidMount: 'componentDidMount',
    ComponentWillUnmount: 'componentWillUnmount'
}
export const SCREEN_COMPONENT_EVENTS = [ComponentEvents.ComponentDidMount, ComponentEvents.ComponentWillUnmount];

const INPUT_DEFAULT_API = [VALUE, ON_BLUR, ON_FOCUS, ON_CHANGE_TEXT, 'inlineLabel', 'floatingLabel', 'stackedLabel', 'fixedLabel', 'success', 'error'].map(x => ({ property: x }));
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
    'active'].map(x => ({ property: x }));
const LABEL_DEFAULT_API = ['data'].map(x => ({ property: x }));
const DEFAULT_INPUT_API_PROPERTIES = {};
const DEFAULT_BUTTON_API_PROPERTIES = {};

BUTTON_DEFAULT_API.map(x => {
    DEFAULT_BUTTON_API_PROPERTIES[x.property] = {
        nodeProperty: x.property,
        parameterConfig: true,
        isHandler: false,
        ui: true
    }
})
INPUT_DEFAULT_API.map(x => {
    DEFAULT_INPUT_API_PROPERTIES[x.property] = {
        nodeProperty: x.property,
        parameterConfig: true,
        isHandler: ARE_HANDLERS.indexOf(x.property) !== -1,
        ui: true
    }
})
export const ComponentTypes = {
    ReactNative: {
        Badge: {},
        Body: {},
        Button: {
            template: './app/templates/components/button.tpl',
            defaultApi: BUTTON_DEFAULT_API,
            eventApi: ['onPress'],
            properties: {
                onPress: {
                    nodeProperty: 'onPress',
                    template: '() => { {{value}} }',
                    method: true,
                    nowrap: true,
                    options: [NAVIGATION, APP_METHOD],
                    ui: true
                },
                ...DEFAULT_BUTTON_API_PROPERTIES
            },
        },
        Card: {},
        CardItem: {},
        CheckBox: {},
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
        H1: {},
        H2: {},
        H3: {},
        Header: {
            template: './app/templates/components/header.tpl',
            properties: {
                left: {
                    nodeProperty: 'HeaderLeft',
                    template: '{{value}}',
                    options: ['true', 'false'],
                    ui: true
                },
                right: {
                    nodeProperty: 'HeaderRight',
                    template: '{{value}}',
                    options: ['true', 'false'],
                    ui: true
                },
                title: {
                    nodeProperty: 'HeaderTitle',
                    template: '{{value}}',
                    options: ['true', 'false'],
                    ui: true
                },
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
                    nodeTypes: [NodeTypes.DataChain],
                    nodeFilter: (item) => {
                        return GetNodeProp(item, NodeProperties.EntryPoint);
                    },
                    template: (node) => {
                        let func = GetCodeName(GetNodeProp(node, 'data'));
                        if (func)
                            return bindTemplate(`DC.{{function}}({{value}})`, {
                                function: func,
                                value: `this.props.data`
                            });
                        return `this.props.data`
                    }
                }
            }
        },
        Input: {
            template: './app/templates/components/input.tpl',
            defaultApi: INPUT_DEFAULT_API,
            properties: {
                item_attributes: {
                    nodeProperty: NodeProperties.TextType,
                    template: '{{value}}',
                    options: ['fixedLabel', 'inlineLabel', 'floatingLabel', 'stackedLabel', 'regular', 'rounded', 'success', 'error', 'disabled'],
                    ui: true
                },
                value: {
                    nodeProperty: NodeProperties.value,
                    parameterConfig: true,
                    ui: true
                },
                ...(DEFAULT_INPUT_API_PROPERTIES),
                label: {
                    nodeProperty: NodeProperties.Label,
                    template: `{titleService.get('{{value}}')}`
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
        List: {
            library: 'react-native',
            layout: true,
            specialLayout: true,
            eventApi: ['onEndReachedThreshold', 'onEndReached'],
            template: './app/templates/components/list.tpl',
            datasource: true,
            properties: {
                item_attributes: {
                    nodeProperty: NodeProperties.TextType,
                    template: '{{value}}',
                    component_options: [NodeTypes.ComponentNode],
                    ui: true
                },
            },
            ui: true
        },
        ListItem: {
            layout: true,
            ui: true,
            [NAVIGATION]: true,
            [APP_METHOD]: true,
            properties: {
                onPress: {
                    nodeProperty: 'onPress',
                    template: '() => { {{value}} }',
                    method: true,
                    options: [NAVIGATION, APP_METHOD],
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
        Text: {
            template: './app/templates/components/text.tpl',
            defaultApi: LABEL_DEFAULT_API,
            properties: {
                label: {
                    ui: true,
                    nodeProperty: 'component-as-label',
                    boolean: true
                },
                data: {
                    ui: true,
                    nodeProperty: 'data',
                    nodeTypes: [NodeTypes.DataChain],
                    nodeFilter: (item) => {
                        return GetNodeProp(item, NodeProperties.EntryPoint);
                    },
                    template: (node) => {
                        let func = GetCodeName(GetNodeProp(node, 'data'));
                        if (GetNodeProp(node, 'component-as-label')) {
                            return `titleService.get('${GetNodeProp(node, NodeProperties.Label)}')`
                        }
                        if (func)
                            return bindTemplate(`DC.{{function}}({{value}})`, {
                                function: func,
                                value: `this.props.data`
                            });
                        return `this.props.data`
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
                    nodeTypes: [NodeTypes.DataChain],
                    nodeFilter: (item) => {
                        return GetNodeProp(item, NodeProperties.EntryPoint);
                    },
                    template: (node) => {
                        let func = GetCodeName(GetNodeProp(node, 'data'));
                        if (func)
                            return bindTemplate(`DC.{{function}}({{value}})`, {
                                function: func,
                                value: `this.props.data`
                            });
                        return `this.props.data`
                    }
                }
            }
        },
        Title: {},
        Toast: {},
        View: {
            eventApi: ['componentDidMount'],
            layout: true
        },
        LoginSelector: {
            template: './app/templates/components/loginselector.tpl',
            library: './login-selector'
        }
    }
}

Object.keys(ComponentTypes.ReactNative).map(key => {
    if (ComponentTypes.ReactNative[key]) {
        ComponentTypes.ReactNative[key].library = ComponentTypes.ReactNative[key].library || 'native-base';
        ComponentTypes.ReactNative[key].key = key;
        ComponentTypes.ReactNative[key].properties = ComponentTypes.ReactNative[key].properties || {};
        ComponentTypes.ReactNative[key].properties.label = ComponentTypes.ReactNative[key].properties.label || {
            nodeProperty: NodeProperties.Label,
            template: `{titleService.get('{{value}}')}`,
            ui: true
        }
    }
});

export const HandlerTypes = {
    Blur: 'blur',
    Change: 'change',
    ChangeText: 'changeText',
    Focus: 'focus',
    Property: 'property'
}
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
}

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
}

export function GetListItemNode(id) {
    let state = GetState();
    let graph = GetRootGraph(state);
    let nodes = GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode && GetNodeProp(x, NodeProperties.ComponentType) === ComponentTypes.ReactNative.ListItem.key);
    if (nodes && nodes.length) {
        return nodes[0];
    }
    return null;
}
