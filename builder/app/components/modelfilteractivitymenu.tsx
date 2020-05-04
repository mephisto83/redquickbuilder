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
import { NodeProperties, NodeTypes, LinkEvents, LinkType } from '../constants/nodetypes';
import { getNodesByLinkType, SOURCE, createValidator, addValidatator, TARGET, createEventProp, GetNode } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { Functions, MethodFunctions } from '../constants/functiontypes';

class ModelFilterActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ModelFilter);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let nodes = UIA.NodesByType(state, NodeTypes.Model)
            .map(t => ({ title: UIA.GetNodeTitle(t), value: t.id }));
        let agents = UIA.NodesByType(state, NodeTypes.Model)
            .filter(x => UIA.GetNodeProp(x, NodeProperties.IsAgent))
            .map(t => ({ title: UIA.GetNodeTitle(t), value: t.id }));

        var input = currentNode ? (<SelectInput
            label={Titles.Models}
            options={nodes}
            onChange={(value) => {
                var id = currentNode.id;

                this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                    target: UIA.GetNodeProp(currentNode, NodeProperties.FilterModel),
                    source: id
                });

                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: NodeProperties.FilterModel,
                    id: currentNode.id,
                    value: value
                });

                this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                    target: value,
                    source: id,
                    properties: { ...UIA.LinkProperties.ModelTypeLink }
                });
            }}
            value={UIA.GetNodeProp(currentNode, NodeProperties.FilterModel)} />) : null;
        var agentinput = currentNode ? (<SelectInput
            label={Titles.Agents}
            options={agents}
            onChange={(value) => {
                var id = currentNode.id;

                this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                    target: UIA.GetNodeProp(currentNode, NodeProperties.FilterAgent),
                    source: id
                });

                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: NodeProperties.FilterAgent,
                    id: currentNode.id,
                    value: value
                });

                this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                    target: value,
                    source: id,
                    properties: { ...UIA.LinkProperties.AgentTypeLink }
                });
            }}
            value={UIA.GetNodeProp(currentNode, NodeProperties.FilterAgent)} />) : null;
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    {input}
                    {agentinput}
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ModelFilterActivityMenu)
