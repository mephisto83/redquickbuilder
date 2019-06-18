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

class ModelFilterMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ModelFilter);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let nodes = UIA.NodesByType(state, NodeTypes.Model).map(t => ({ title: UIA.GetNodeTitle(t), value: t.id }));
        var graph = UIA.GetCurrentGraph(state);
        let properties = [];
        if (currentNode) {
            let model = UIA.GetNodeProp(currentNode, NodeProperties.FilterModel);
            properties = (getNodesByLinkType(graph, {
                id: model,
                direction: SOURCE,
                type: LinkType.PropertyLink
            }) || []).map(t => {
                return (<CheckBox
                    key={`checkbox-${t.id}`}
                    label={UIA.GetNodeTitle(t)}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.FilterPropreties) ? UIA.GetNodeProp(currentNode, UIA.NodeProperties.FilterPropreties)[t.id] : ''}
                    onChange={(value) => {
                        let fprops = UIA.GetNodeProp(currentNode, UIA.NodeProperties.FilterPropreties) || {};
                        fprops[t.id] = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.FilterPropreties,
                            id: currentNode.id,
                            value: fprops
                        });
                    }} />)
            });
        }
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    {properties}
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ModelFilterMenu)