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
        headerStyle: {
            backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
        header: (<StyleProvider style={getTheme(material)}>
            
            <Header>
                <Left>
                    <Button transparent onPress={() => {
                        navigationInstance.dispatch(DrawerActions.toggleDrawer())
                    }}>
                        <Icon name='menu' />
                    </Button>
                </Left>
                <Body>
                    <Title>{titleService.get("Login")}</Title>
                </Body>
                <Right />
            </Header>
        </StyleProvider>)
    };

    render() {
        navigationInstance = this.props.navigation;
        return (
            <StyleProvider style={getTheme(material)}>  
                 <Container>                   
                    <Content>
                        <Text>{{title}}</Text>
                    </Content>
                    <Footer>
                        <FooterTab>
                            <Button full>
                                <Text>Footer</Text>
                            </Button>
                        </FooterTab>
                    </Footer>
                </Container> 
            </StyleProvider> 
        );
    }
}

export default redConnect({{name}});