import * as React from 'react';
import { redConnect, titleService } from '../actions/util';
import getTheme from '../../native-base-theme/components'
import material from '../../native-base-theme/variables/variables';
import { Content, StyleProvider } from 'native-base';
import { Container, Header, Title, Footer, FooterTab, Button, Left, Right, Body, Icon, Text } from 'native-base';

// {{name}}
class {{name}} extends React.Component {
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
                                <Button transparent>
                                    <Icon name='menu' />
                                </Button>
                            </Left>
                            <Body>
                                <Title>{ titleService.get({{title}}) }</Title>
                            </Body>
                            <Right />
                        </Header>
                    </StyleProvider>)
    };

    render() {
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