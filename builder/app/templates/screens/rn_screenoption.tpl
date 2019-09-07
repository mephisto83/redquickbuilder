import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { redConnect, titleService } from '../actions/util';
import getTheme from '../../native-base-theme/components'
import material from '../../native-base-theme/variables/variables';
import { DrawerActions } from 'react-navigation-drawer';
import { Content, StyleProvider } from 'native-base';
import { Container, ListItem, Header, Title, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, View } from 'native-base';
import { NavigationActions } from 'react-navigation';
import MenuItem from '../components/menuitem';
{{imports}}
// {{name}}
let navigationInstance;
class {{name}} extends React.Component {
    render() {
        return (
            <StyleProvider style={getTheme(material)}>               
                    {{elements}}
            </StyleProvider> 
        );
    }
}

export default redConnect({{name}});