import * as React from 'react';
import { FlatList, Image } from '{{relative_depth}}html-components';
import { redConnect, titleService} from '{{relative_depth}}actions/util';
import { GetItems, navigate, GetScreenParam, GetItem, SITE, GetC, StoreInLake, GetModelProperty, GetMenuDataSource, LoadModel, StoreModelArray } from '{{relative_depth}}actions/uiactions';
import Models from '{{relative_depth}}model_keys';
import StateKeys from '{{relative_depth}}state_keys';
import RedGraph from '{{relative_depth}}actions/redgraph';
import {
  GetMenuSource
} from '{{relative_depth}}actions/menuSource';
import { ViewModelKeys } from '{{relative_depth}}viewmodel_keys';
import * as navigate from '{{relative_depth}}actions/navigationActions';
import * as DC from '{{relative_depth}}actions/data-chain';
import * as S from '{{relative_depth}}actions/selector';
import { fetchModel, retrieveParameters } from '{{relative_depth}}actions/redutils';
import { GetScreenInstance, GetScreenInstanceObject, GetAppStateObject, GetModelInstance, GetModelInstanceObject } from '{{relative_depth}}actions/uiactions';
import { Content, StyleProvider } from '{{relative_depth}}html-components';
import {
  MultiSelectList, MultiViewList,
  Container, ListItem, Header, Title,
  H3, H1, H2, Footer, FooterTab,
  Button, Left, Right, Body, Icon,
  SingleSelect,
  Text, View, Form, Item,
  CheckBox,
  Dropdown,
  PasswordField,
  Input, Label,
  Menu
}  from '{{relative_depth}}html-components';

{{imports}}
// {{name}}
let navigationInstance;
class {{name}} extends React.Component<{ [index: string]: any }, { [index: string]: any }> {
    constructor(props: any){
        super(props);

        this.state = {
          value: null,
          viewModel: null
        };
    }
{{component_did_update}}
    render() {
        let { state } = this.props;
        let props = {...this.props};
        delete props.children;
        {{screen_options}}
        return (
          {{elements}}
        );
    }
}

export default redConnect({{name}});
