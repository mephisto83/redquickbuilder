import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { redConnect, titleService, GetItems } from '{{relative_depth}}actions/util';
import * as ScreenInstance from '{{relative_depth}}actions/screenInstances';
import getTheme from '{{relative_depth}}../native-base-theme/components'
import material from '{{relative_depth}}../native-base-theme/variables/variables';
import { GetScreenInstance } from '{{relative_depth}}actions/uiActions';
import { DrawerActions } from 'react-navigation-drawer';
import { Content, StyleProvider } from 'native-base';
import { Container, ListItem, Header, Title, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, View, Form, Item, Input, Label, List, Thumbnail } from 'native-base';
import { NavigationActions } from 'react-navigation';
{{imports}}
// {{name}}
let navigationInstance;
class {{name}} extends React.Component {
    render() {
        let { state } = this.props;
        let componentProperties = {};
{{screen_options}}
        return (
            <StyleProvider style={getTheme(material)}>               
                    {{elements}}
            </StyleProvider> 
        );
    }
}

export default redConnect({{name}});