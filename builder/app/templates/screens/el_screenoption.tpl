import * as React from 'react';
import { FlatList, Image } from '{{relative_depth}}html-components';
import { redConnect, titleService} from '{{relative_depth}}actions/util';
import { GetItems, navigate, GetScreenParam  } from '{{relative_depth}}actions/uiactions';
import * as DC from '{{relative_depth}}actions/data-chain';
import * as S from '{{relative_depth}}actions/selector';
import * as ScreenInstance from '{{relative_depth}}actions/screenInstances';
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
        {{screen_options}}
        return (
          {{elements}}
        );
    }
}

export default redConnect({{name}});
