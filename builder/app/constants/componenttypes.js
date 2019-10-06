import { NodeTypes } from "./nodetypes";
import { NodeProperties, GetRootGraph, GetNodeProp, GetState, GetCodeName } from "../actions/uiactions";
import { GetNodesLinkedTo } from "../methods/graph_methods";
import { bindTemplate } from "./functiontypes";

export const NAVIGATION = '-NAVIGATION';
export const APP_METHOD = '-APP_METHOD';
const ARE_HANDLERS = ['onBlur', 'onFocus', 'onChangeText'];
const INPUT_DEFAULT_API = ['value', 'onBlur', 'onFocus', 'onChangeText', 'inlineLabel', 'floatingLabel', 'stackedLabel', 'fixedLabel', 'success', 'error'].map(x => ({ property: x }));
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
            template: './app/templates/components/form.tpl'
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
        InputGroup: {},
        Item: {},
        Label: {},
        Left: {},
        List: {
            library: 'react-native',
            layout: true,
            specialLayout: true,
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
    Focus: 'focus',
    Property: 'property'
}
export const InstanceTypes = {
    ScreenInstance: 'ScreenInstance',
    Instance: 'Instance',
    AppState: 'AppState',
    PropInstance: 'PropInstance',
    ApiProperty: 'ApiProperty',
    ScreenParam: 'ScreenParam',
    AddAnotherIfTheseDontMakeSense: 'add another if these dont make sense'
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
