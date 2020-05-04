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

class DataChainOperator extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.DataChain);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (!active) {
            return <div></div>
        }
        return (
            <MainSideBar active={active} relative={true}>
                <SideBar style={{ paddingTop: 0 }}>
                    <SideBarMenu>
                        <TreeViewMenu active={true} hideArrow={true} title={Titles.SplitDataChain} icon={'fa fa-share-alt'} onClick={() => {
                            DataChainContextMethods.SplitDataChain.bind(this)(currentNode);
                        }} />
                        {UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) ? <TreeViewMenu active={true} hideArrow={true} title={Titles.MergeChain} icon={'fa fa-code-fork '} onClick={() => {
                            let groupProperties = UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) ? {
                                id: UIA.getGroup(UIA.GetNodeProp(currentNode, NodeProperties.GroupParent)).id
                            } : null;
                            if (groupProperties)
                                this.props.graphOperation(UIA.ADD_NEW_NODE, {
                                    nodeType: NodeTypes.DataChain,
                                    properties: { [NodeProperties.MergeChain]: true },
                                    groupProperties,
                                    linkProperties: {
                                        properties: { ...LinkProperties.DataChainLink }
                                    }
                                });
                        }} /> : null}
                        {UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) ? <TreeViewMenu active={true} hideArrow={true} title={Titles.StitchEnd} icon={'fa fa-compress'} onClick={() => {
                            let groupProperties = UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) ? {
                                id: UIA.getGroup(UIA.GetNodeProp(currentNode, NodeProperties.GroupParent)).id
                            } : null;
                            if (groupProperties) {
                                let groupExitNode = UIA.GetGroupProp(groupProperties.id, GroupProperties.GroupExitNode);
                                let externalExitNode = UIA.GetGroupProp(groupProperties.id, GroupProperties.ExternalExitNode);
                                if (externalExitNode) {
                                    this.props.graphOperation([{
                                        operation: UIA.REMOVE_LINK_BETWEEN_NODES, options: {
                                            target: externalExitNode,
                                            source: groupExitNode
                                        }
                                    }, {
                                        operation: UIA.ADD_LINK_BETWEEN_NODES, options: {
                                            target: externalExitNode,
                                            source: currentNode.id
                                        }
                                    }, {
                                        operation: UIA.CHANGE_NODE_PROPERTY, options: {
                                            id: externalExitNode,
                                            prop: NodeProperties.ChainParent,
                                            value: externalExitNode
                                        }
                                    }, {
                                        operation: UIA.UPDATE_GROUP_PROPERTY, options: {
                                            id: groupProperties.id,
                                            prop: GroupProperties.GroupExitNode,
                                            value: currentNode.id
                                        }
                                    }]);
                                }
                            }
                        }} /> : null}
                        {currentNode ? (
                            <TreeViewMenu active={true} hideArrow={true} title={Titles.AddDataChain} icon={'fa fa-plus'} onClick={() => {
                                let groupProperties = UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) ? {
                                    id: UIA.getGroup(UIA.GetNodeProp(currentNode, NodeProperties.GroupParent)).id
                                } : null;
                                this.props.graphOperation(UIA.ADD_NEW_NODE, {
                                    parent: currentNode.id,
                                    nodeType: NodeTypes.DataChain,
                                    groupProperties,
                                    properties: {
                                        [NodeProperties.ChainParent]: currentNode.id
                                    },
                                    linkProperties: {
                                        properties: { ...LinkProperties.DataChainLink }
                                    }
                                });
                            }} />) : null}
                    </SideBarMenu>
                </SideBar>
            </MainSideBar>
        );
    }
}

export default UIConnect(DataChainOperator)
