// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties, NodeTypes, LinkEvents, LinkType, LinkProperties } from '../constants/nodetypes';
import { addValidatator, TARGET, createEventProp, GetNode, GetLinkChain, GetLinkChainItem, createExecutor } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';

class DataSourceActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.DataSource);
       
        return (
            <TabPane active={active}>
                <button type="submit" className="btn btn-primary" onClick={() => {
                    this.props.graphOperation(UIA.NEW_CONDITION_NODE, {
                        parent: UIA.Visual(state, UIA.SELECTED_NODE),
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ConditionLink }
                        }
                    });
                }}>{Titles.AddCondition}</button>
            </TabPane>
        );
    }
}

export default UIConnect(DataSourceActivityMenu)