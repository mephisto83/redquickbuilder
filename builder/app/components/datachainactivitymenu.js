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

class DataChainActvityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.DataChain);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

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
                    />
                    <SelectInput
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
                    />
                </FormControl>
                <button type="submit" className="btn btn-primary" onClick={() => {
                    this.props.graphOperation(UIA.ADD_NEW_NODE, {
                        parent: UIA.Visual(state, UIA.SELECTED_NODE),
                        nodeType: NodeTypes.DataChain,
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.DataChainLink }
                        }
                    });
                }}>{Titles.AddDataChain}</button>
            </TabPane>
        );
    }
}

export default UIConnect(DataChainActvityMenu)