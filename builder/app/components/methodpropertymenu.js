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

class MethodPropertyMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Method);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var functionType = UIA.GetNodeProp(currentNode, NodeProperties.FunctionType);
        let functionObject = MethodFunctions[functionType];
        let methodparams = [];
        if (functionObject && functionObject.constraints) {
            methodparams = Object.values(functionObject.constraints).map(constraint => {
                let nodes = UIA.NodesByType(state, constraint.nodeTypes).filter(node => {
                    return !Object.keys(constraint).filter(x => x != 'key' && x !== 'nodeTypes')
                        .find(x => UIA.GetNodeProp(node, x) !== constraint[x])
                }).map(t => ({ title: UIA.GetNodeTitle(t), value: t.id }));
                return (<SelectInput
                    key={constraint.key}
                    label={constraint.key}
                    options={nodes}
                    onChange={(value) => {
                        var id = currentNode.id;
                        let methodProps = UIA.GetNodeProp(currentNode, NodeProperties.MethodProps) || {};
                        methodProps[constraint.key] = value;
                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                            target: currentNode.properties[UIA.NodeProperties.UIExtension],
                            source: id
                        })
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MethodProps,
                            id: currentNode.id,
                            value: methodProps
                        });
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: { ...UIA.LinkProperties.FunctionOperator }
                        });
                    }}
                    value={UIA.GetNodeProp(currentNode, NodeProperties.MethodProps) ? UIA.GetNodeProp(currentNode, NodeProperties.MethodProps)[constraint.key] : ''} />);
            })
        }
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    {methodparams}
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(MethodPropertyMenu)