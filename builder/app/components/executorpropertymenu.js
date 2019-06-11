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
import { getNodesByLinkType, SOURCE, createValidator, addValidatator, TARGET, createEventProp, GetNode, createExecutor } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';

class ExecutorPropertyMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Executor);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var executor;
        if (currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel)) {
            var propertyNodes = getNodesByLinkType(graph, {
                id: UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel),
                direction: SOURCE,
                type: LinkType.PropertyLink
            }).map(t => {
                return {
                    title: UIA.GetNodeTitle(t),
                    value: t.id
                }
            });
            executor = UIA.GetNodeProp(currentNode, NodeProperties.Executor);
        }
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <SelectInput
                        options={propertyNodes}
                        defaultSelectText={Titles.SelectProperty}
                        label={Titles.Property}
                        onChange={(value) => {
                            var id = currentNode.id;
                            let executor = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createExecutor();
                            executor = addValidatator(executor, { id: value });
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                id,
                                prop: NodeProperties.Executor,
                                value: executor
                            })
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: {
                                    ...UIA.LinkProperties.ExecutorModelLink,
                                    ...createEventProp(LinkEvents.Remove, {
                                        function: 'OnRemoveExecutorPropConnection'
                                    })
                                }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.ExecutorModel] : ''} />
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ExecutorPropertyMenu)