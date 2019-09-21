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
import { DataChainFunctions } from '../constants/datachain';

class DataChainActvityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.DataChain);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let dataChainFuncType = UIA.GetNodeProp(currentNode, NodeProperties.DataChainFunctionType);
        let showModel = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.model : false;
        let showProperty = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.property : false;
        let showNode1 = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.node_1 : false;
        let showNode2 = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.node_2 : false;
        let node_inputs = UIA.NodesByType(state, NodeTypes.DataChain).filter(x => {
            return UIA.GetNodeProp(x, NodeProperties.GroupParent) === UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) && x !== currentNode;
        }).toNodeSelect();
        return (
            <TabPane active={active}>
                <FormControl>
                    <CheckBox
                        label={Titles.EntryPoint}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.EntryPoint)}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.EntryPoint,
                                id: currentNode.id,
                                value: value
                            });
                        }} />
                    <SelectInput
                        onChange={(value) => {
                            let id = currentNode.id;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.DataChainFunctionType,
                                id,
                                value
                            });
                        }}
                        label={Titles.FunctionTypes}
                        value={dataChainFuncType}
                        options={Object.keys(DataChainFunctions).map(key => ({ title: key, value: key }))}
                    />
                    {showModel ? <SelectInput
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIModelType],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIModelType,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ModelTypeLink }
                            })
                        }}
                        label={Titles.Models}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.UIModelType)}
                        options={UIA.GetModelNodes().toNodeSelect()}
                    /> : null}
                    {showProperty ? <SelectInput
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                source: UIA.GetNodeProp(currentNode, UIA.NodeProperties.Property),
                                target: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Property,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                source: value,
                                target: id,
                                properties: { ...UIA.LinkProperties.PropertyLink }
                            })
                        }}
                        label={Titles.Property}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.Property)}
                        options={UIA.GetModelPropertyChildren(UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIModelType)).toNodeSelect()}
                    /> : null}
                    {showNode1 ? <SelectInput
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                source: currentNode.properties[UIA.NodeProperties.ChainNodeInput1],
                                target: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ChainNodeInput1,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                source: value,
                                target: id,
                                properties: { ...UIA.LinkProperties.DataChainLink }
                            })
                        }}
                        label={`${Titles.Input} 1`}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.ChainNodeInput1)}
                        options={node_inputs}
                    /> : null}
                    {showNode2 ? <SelectInput
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                source: currentNode.properties[UIA.NodeProperties.ChainNodeInput2],
                                target: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ChainNodeInput2,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                source: value,
                                target: id,
                                properties: { ...UIA.LinkProperties.DataChainLink }
                            })
                        }}
                        label={`${Titles.Input} 2`}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.ChainNodeInput2)}
                        options={node_inputs}
                    /> : null}
                </FormControl>
            </TabPane>
        );
    }
}

export default UIConnect(DataChainActvityMenu)