import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, FlatList, Image } from '{{relative_depth}}html-components';;
import { redConnect, titleService} from '{{relative_depth}}actions/util';
import { GetItems, navigate, GetScreenParam, fetchModelInstance, fetchModelInstanceChildren  } from '{{relative_depth}}actions/uiActions';
import * as DC from '{{relative_depth}}actions/data-chain';
import * as S from '{{relative_depth}}actions/selector';
import * as ScreenInstance from '{{relative_depth}}actions/screenInstances';
import { GetScreenInstance, GetScreenInstanceObject, GetAppStateObject, GetModelInstance, GetModelInstanceObject } from '{{relative_depth}}actions/uiActions';
import { Content, StyleProvider } from '{{relative_depth}}html-components';
import { Container, ListItem, Header, Title, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, View, Form, Item,
Input, Label, List, Thumbnail }  from '{{relative_depth}}html-components';

{{imports}}
// {{name}}
let navigationInstance;
class {{name}} extends React.Component {
    constructor(props){
        super(props);

        this.state = {};
    }
{{component_did_update}}
    render() {
        let { state } = this.props;
        {{screen_options}}
        return (
            <StyleProvider>
                {{elements}}
            </StyleProvider>
        );
    }
}

export default redConnect({{name}});