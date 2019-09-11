import { NodeTypes } from "./nodetypes";
import { NodeProperties } from "../actions/uiactions";


export const ComponentTypes = {
    ReactNative: {
        Badge: {},
        Body: {},
        Button: {
            template: './app/templates/components/button.tpl',
            properties: {
                full: {
                    nodeProperty: 'ButtonDefault',
                    template: '{{value}}',
                    options: ['transparent', 'bordered', 'rounded', 'block', 'full'],
                    ui: true
                },
                color: {
                    nodeProperty: 'ButtonColor',
                    template: '{{value}}',
                    options: ['primary', 'light', 'dark'],
                    ui: true
                }
            }
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
            library: 'react-native'
        },
        Input: {
            template: './app/templates/components/input.tpl',
            properties: {
                item_attributes: {
                    nodeProperty: NodeProperties.TextType,
                    template: '{{value}}',
                    options: ['fixedLabel', 'inlineLabel', 'floatingLabel', 'stackedLabel', 'regular', 'rounded', 'success', 'error', 'disabled'],
                    ui: true
                },
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
            layout: true,
            template: './app/templates/components/list.tpl',
        },
        ListItem: {
            layout: true,
            ui: true
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
        Text: {},
        Textarea: {},
        Thumbnail: {},
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


export const InstanceTypes = {
    ScreenInstance: 'ScreenInstance',
    Instance: 'Instance',
    AppState: 'AppState',
    AddAnotherIfTheseDontMakeSense: 'add another if these dont make sense'
}