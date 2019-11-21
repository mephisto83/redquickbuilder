import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { redConnect, titleService, fetchModelInstance, fetchModelInstanceChildren } from '../actions/util';
import * as DC from '../actions/data-chain';
import * as S from '../actions/selector';
import { GetItems, navigate, GetScreenParam, setNavigate  } from '../actions/uiActions';
import getTheme from '../../native-base-theme/components'
import * as ScreenInstance from '../actions/screenInstances';
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
    static drawerContent = props => (
        <StyleProvider style={getTheme(material)}>
            <Container>
                <MenuItem icon={'arrow-back'} 
                    onPress={() => {
                        const backAction = NavigationActions.back({});
                        props.navigation.dispatch(backAction);
                    }} 
                    title={titleService.get("Back")}/>
            </Container>
        </StyleProvider>)
    
    static navigationOptions = {
        title: titleService.get({{title}}),
        header: null
    };
{{component_did_update}}
{{component_did_mount}}
    render() {
        navigationInstance = this.props.navigation;
        setNavigate(navigationInstance);
        return (
            <StyleProvider style={getTheme(material)}>  
                 <Container>                   
                     {{elements}}
                </Container> 
            </StyleProvider> 
        );
    }
}

export default redConnect({{name}});