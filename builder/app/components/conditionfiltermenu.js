// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import { LinkType, NodeProperties, NodeTypes } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { TARGET, GetLinkChain, SOURCE, GetNode } from '../methods/graph_methods';
import { ConditionTypes, ConditionFunctionSetups, ConditionTypeOptions, ConditionTypeParameters } from '../constants/functiontypes';
import CheckBox from './checkbox';
import TextInput from './textinput';
class ConditionFilterMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Condition);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        return (
            <TabPane active={active}>
            </TabPane>
        );
    }
}

export default UIConnect(ConditionFilterMenu)