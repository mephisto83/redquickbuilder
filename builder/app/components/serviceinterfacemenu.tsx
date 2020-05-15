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
import { NodeProperties, NodeTypes, LinkEvents, LinkType, LinkProperties, GroupProperties } from '../constants/nodetypes';
import { addValidatator, TARGET, createEventProp, GetNode, GetLinkChain, GetLinkChainItem, createExecutor } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';
import { DataChainContextMethods } from '../constants/datachain';

class ServiceInterfaceMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ServiceInterface);
        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        return (
            <MainSideBar active={active} relative={true}>
                <SideBar style={{ paddingTop: 0 }}>
                    <SideBarMenu>
                        {currentNode ? (
                            <TreeViewMenu active={true} hideArrow={true} title={Titles.AddServiceInterfaceMenu} icon={'fa fa-plus'} onClick={() => {
                                let groupProperties = {};
                                this.props.graphOperation(UIA.ADD_NEW_NODE, {
                                    parent: currentNode.id,
                                    nodeType: NodeTypes.ServiceInterfaceMethod,
                                    groupProperties,
                                    properties: {
                                    },
                                    linkProperties: {
                                        properties: { ...LinkProperties.ServiceInterfaceMethod }
                                    }
                                });
                            }} />) : null}
                    </SideBarMenu>
                </SideBar>
            </MainSideBar>
        );
    }
}

export default UIConnect(ServiceInterfaceMenu)
