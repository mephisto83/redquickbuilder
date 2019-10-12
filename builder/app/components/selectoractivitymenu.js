// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextInput from './textinput';
import SelectInput from './selectinput';
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties, NodeProperties } from '../constants/nodetypes';
import { Iterator } from 'webcola';
import { ServiceTypes, ServiceTypeSetups } from '../constants/servicetypes';
import { InstanceTypes } from '../constants/componenttypes';
class SelectorActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Selector);
        var currentNode = active ? UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE)) : null;

        let componentNodeProperties = active ? UIA.GetComponentNodeProperties() : null;

        return (
            <TabPane active={active}>
            </TabPane>
        );
    }
}

export default UIConnect(SelectorActivityMenu)