import * as React from 'react';
import { redConnect, titleService, fetchModelInstance, fetchModelInstanceChildren } from '../actions/util';
import * as DC from '../actions/data-chain';
import * as S from '../actions/selector';
import { GetItems, navigate, GetScreenParam, setNavigate  } from '../actions/uiActions';
import * as ScreenInstance from '../actions/screenInstances';
import { Content, StyleProvider } from '../html-components';
import * as ViewModelKeys from '../viewmodel_keys';
import { MultiSelectList, MultiViewList, Container, ListItem, Header, Title, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, View } from '../html-components';
import MenuItem from '../components/menuitem';
{{imports}}
// {{name}}
let navigationInstance;
class {{name}} extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }
{{component_did_update}}
{{component_did_mount}}
    render() {
        setNavigate(navigationInstance);
        return (
            <StyleProvider>
                 <Container>
                     {{elements}}
                </Container>
            </StyleProvider>
        );
    }
}

export default redConnect({{name}});
