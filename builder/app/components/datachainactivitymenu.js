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
import { NodeProperties, NodeTypes, LinkEvents, LinkType, LinkProperties, SelectorPropertyKeys } from '../constants/nodetypes';
import { addValidatator, TARGET, createEventProp, GetNode, GetLinkChain, GetLinkChainItem, createExecutor } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';
import { DataChainFunctions, DataChainContextMethods } from '../constants/datachain';

class DataChainActvityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.DataChain);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let dataChainFuncType = UIA.GetNodeProp(currentNode, NodeProperties.DataChainFunctionType);
        let showModel = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.model : false;
        let showDataChainRef = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.dataref : false;
        let showNumber = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.number : false;
        let showProperty = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.property : false;
        let showNode1 = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.node_1 : false;
        let showValue = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.value : false;
        let showSelector = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.selector : false;
        let showSelectorProperty = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.selectorProperty : false;
        let showNode2 = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.node_2 : false;
        let stateKey = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.stateKey : false;
        let data_chain_entry = UIA.GetDataChainEntryNodes().toNodeSelect();
        let selector_nodes = UIA.NodesByType(state, NodeTypes.Selector).toNodeSelect();
        let selector_node_properties = Object.keys(SelectorPropertyKeys).map(v => ({ title: v, value: SelectorPropertyKeys[v] }))
        let node_inputs = UIA.NodesByType(state, NodeTypes.DataChain).filter(x => {
            return UIA.GetNodeProp(x, NodeProperties.GroupParent) === UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) && x !== currentNode;
        }).toNodeSelect();
        let all_inputs = UIA.NodesByType(state, NodeTypes.DataChain).toNodeSelect();

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
                    <CheckBox
                        label={Titles.AsOutput}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.AsOutput)}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.AsOutput,
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
                    {showNumber ? <TextInput
                        onChange={(value) => {
                            var id = currentNode.id;
                            if (!isNaN(value)) {
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: UIA.NodeProperties.NumberParameter,
                                    id,
                                    value
                                });
                            }
                        }}
                        label={Titles.Number}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.NumberParameter)}
                    /> : null}
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
                                target: UIA.GetNodeProp(currentNode, UIA.NodeProperties.Property),
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Property,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.PropertyLink }
                            })
                        }}
                        label={Titles.Property}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.Property)}
                        options={UIA.GetModelPropertyChildren(UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIModelType)).toNodeSelect()}
                    /> : null}
                    {stateKey ? (<SelectInput
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: UIA.GetNodeProp(currentNode, UIA.NodeProperties.StateKey),
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.StateKey,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.StateKey }
                            })
                        }}
                        label={Titles.StateKey}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.StateKey)}
                        options={UIA.NodesByType(state, [NodeTypes.StateKey]).toNodeSelect()}
                    />) : null}
                    {showDataChainRef ? <SelectInput
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                source: currentNode.properties[UIA.NodeProperties.DataChainReference],
                                target: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.DataChainReference,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                source: value,
                                target: id,
                                properties: { ...UIA.LinkProperties.DataChainLink }
                            })
                        }}
                        label={`${Titles.DataChain}`}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.DataChainReference)}
                        options={data_chain_entry}
                    /> : null}
                    {showSelector ? <SelectInput
                        onChange={DataChainContextMethods.Selector.bind(this, currentNode)}
                        label={`${Titles.Selector}`}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.Selector)}
                        options={selector_nodes}
                    /> : null}
                    {showSelectorProperty ? <SelectInput
                        onChange={DataChainContextMethods.SelectorProperty.bind(this, currentNode)}
                        label={`${Titles.SelectorProperty}`}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.SelectorProperty)}
                        options={selector_node_properties}
                    /> : null}
                    {showNode1 ? <SelectInput
                        onChange={DataChainContextMethods.Input1.bind(this, currentNode)}
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
                    {showValue ? <SelectInput
                        onChange={DataChainContextMethods.Value.bind(this, currentNode)}
                        label={`${Titles.Value}`}
                        disabled={true}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.Value)}
                        options={all_inputs}
                    /> : null}
                </FormControl>
            </TabPane>
        );
    }
}

export default UIConnect(DataChainActvityMenu)