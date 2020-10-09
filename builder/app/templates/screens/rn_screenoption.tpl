import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, FlatList,Image } from "react-native";
import { redConnect, titleService} from '{{relative_depth}}actions/util';
import { GetItems, navigate, GetScreenParam, fetchModelInstanceChildren, GetItem, GetItems, SITE, GetC, GetModelProperty  } from '{{relative_depth}}actions/uiactions';
import Models from '{{relative_depth}}model_keys';
import * as DC from '{{relative_depth}}actions/data-chain';
import * as S from '{{relative_depth}}actions/selector';
import * as ScreenInstance from '{{relative_depth}}actions/screenInstances';
import getTheme from '{{relative_depth}}../native-base-theme/components'
import material from '{{relative_depth}}../native-base-theme/variables/variables';
import { GetScreenInstance, GetScreenInstanceObject, GetAppStateObject, GetModelInstance, GetModelInstanceObject } from '{{relative_depth}}actions/uiactions';
import { DrawerActions } from 'react-navigation-drawer';
import { Content, StyleProvider } from 'native-base';
import { SingleSelect, Container, ListItem,
 Header, Title, Footer, FooterTab,
  H3, H1, H2, Button, Left,
  Right, Body, Icon, Text,
  View, Form, Item,
  Dropdown,
  CheckBox,
  PasswordField,
Input, Label, List, Thumbnail } from 'native-base';
import { NavigationActions } from 'react-navigation';
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
let props = {...this.props};
delete props.children;

{{screen_options}}
return (
<StyleProvider style={getTheme(material)}>
    {{elements}}
</StyleProvider>
);
}
}

export default redConnect({{name}});
