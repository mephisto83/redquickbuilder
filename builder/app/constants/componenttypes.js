import { NodeTypes } from "./nodetypes";


export const ComponentTypes = {
    ReactNative: {
        Badge: {},
        Body: {},
        Button: {},
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
        Header: {},
        Icon: {},
        Image: {
            library: 'react-native'
        },
        Input: {
            template: './app/templates/components/input.tpl',
            properties: {
                item_attributes: ['fixedLabel', 'inlineLabel', 'floatingLabel', 'stackedLabel', 'regular', 'rounded', 'success', 'error', 'disabled'],
                label: {}
            }
        },
        InputGroup: {},
        Item: {},
        Label: {},
        Left: {},
        List: {
            layout: true
        },
        ListItem: {},
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
        }
    }
}

Object.keys(ComponentTypes.ReactNative).map(key => {
    ComponentTypes.ReactNative.library = ComponentTypes.ReactNative.library || 'native-base';
    ComponentTypes.ReactNative[key].key = key;
});


export const InstanceTypes = {
    ScreenInstance: 'ScreenInstance',
    Instance: 'Instance',
    AddAnotherIfTheseDontMakeSense: 'add another if these dont make sense'
}