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
        Form: {},
        H1: {},
        H2: {},
        H3: {},
        Header: {},
        Icon: {},
        Image: {
            library: 'react-native'
        },
        Input: {},
        InputGroup: {},
        Item: {},
        Label: {},
        Left: {},
        List: {},
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
})