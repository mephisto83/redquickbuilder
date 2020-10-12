import * as React from 'react';
import { redConnect, titleService } from '../actions/util';
import * as DC from '../actions/data-chain';
import StateKeys from '../state_keys';
import * as S from '../actions/selector';
import { setParameters } from '../actions/redutils';
import Models from '../model_keys';
import { GetItems, GetScreenParam, setNavigate, GetItem, GetC,GetMenuDataSource, GetModelProperty, NavigateToScreen, StoreInLake, LoadModel, StoreModelArray } from '../actions/uiactions';
import * as ScreenInstance from '../actions/screenInstances';
import { fetchModel, retrieveParameters } from '../actions/redutils';
import StateKeys from '../state_keys';
import routes from '{{relative_depth}}constants/routes';
import RedGraph from '../actions/redgraph';
import * as navigate from '../actions/navigationActions';
import {
  GetMenuSource
} from '../actions/menuSource';
import { Content, StyleProvider } from '../html-components';
import { ViewModelKeys } from '../viewmodel_keys';
import {
  MultiSelectList, MultiViewList, Container,
  Dropdown,
  ListItem, H3, H1, H2, Header, Title,
  Footer, FooterTab, Button, Left, Right,
  Body, Icon, Text, View, Menu
} from '../html-components';
{{imports}}
// {{name}}
let navigationInstance: any;
class {{name}} extends React.Component<{ [index: string]: any }, { [index: string]: any }> {
    constructor(props: any) {
        super(props);

        this.state = {};
    }
{{component_did_update}}
{{component_did_mount}}
    render() {
        setNavigate(navigationInstance);
        return (
            <Container>
                {{elements}}
          </Container>
        );
    }
}

export default redConnect({{name}});
