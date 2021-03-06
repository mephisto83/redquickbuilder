import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { redConnect, titleService } from '../actions/util';
import * as DC from '../actions/data-chain';
import * as S from '../actions/selector';
import { GetItems, GetScreenParam, setNavigate, GetItem, SITE, GetC, StoreInLake,GetMenuDataSource, NavigateToScreen, GetModelProperty, LoadModel, StoreModelArray  } from '../actions/uiActions';
import getTheme from '../../native-base-theme/components';
import Models from '../model_keys';
import StateKeys from '../state_keys';
import RedGraph from '../actions/redgraph';
import routes from '../constants/routes';
import {
  GetMenuSource
} from '../actions/menuSource';
import * as ScreenInstance from '../actions/screenInstances';
import * as navigate from '../actions/navigationActions';
import material from '../../native-base-theme/variables/variables';
import { fetchModel, retrieveParameters } from '../actions/redutils';
import { DrawerActions } from 'react-navigation-drawer';
import { Content, StyleProvider } from 'native-base';
import { ViewModelKeys } from '../viewmodel_keys';
import {
  Dropdown, Container, ListItem, Header, Title, Footer, FooterTab,H3,H1, H2, Button, Left, Right, Body, Icon, Text, View } from 'native-base';
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
