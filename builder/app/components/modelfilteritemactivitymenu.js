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
import { getNodesByLinkType, SOURCE, createValidator, addValidatator, TARGET, createEventProp, GetNode, GetLinkChain, GetLinkChainItem, createExecutor } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { Functions, MethodFunctions, FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';

class ModelFilterItemActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ModelItemFilter);
        var propertyNodes = [];
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (currentNode) {
            var methodNode = GetLinkChainItem(state, {
                id: currentNode.id,
                links: [{
                    direction: TARGET,
                    type: LinkType.ModelItemFilter
                }]
            });
            var node = null;
            var methodProps = UIA.GetMethodProps(methodNode);
            if (methodProps) {
                switch (UIA.GetFunctionType(methodNode)) {
                    case FunctionTypes.Create_Object_Agent_Value__IListObject:
                    case FunctionTypes.Get_Parent$Child_Agent_Value__IListChild:
                    case FunctionTypes.Create_Parent$Child_Agent_Value__IListChild:
                    case FunctionTypes.Create_Parent_Child_Agent_Value__Child:
                        node = GetNode(graph, methodProps[FunctionTemplateKeys.Model]);
                        break;
                    case FunctionTypes.Get_ManyToMany_Agent_Value__IListChild:
                        node = GetNode(graph, methodProps[FunctionTemplateKeys.ManyToManyModel]);
                        break;
                }
            }
            if (node) {
                propertyNodes = GetLinkChain(state, {
                    id: node.id,
                    links: [{
                        direction: SOURCE,
                        type: LinkType.PropertyLink
                    }]
                }).toNodeSelect();
            }
        }
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <TextInput
                        label={Titles.NodeLabel}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.UIText)}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_TEXT, { id: currentNode.id, value })
                        }} />
                    <TextInput
                        label={Titles.NodeType}
                        value={UIA.GetNodeProp(currentNode, NodeProperties.NODEType)} disabled={true} />
                    <SelectInput
                        options={propertyNodes}
                        defaultSelectText={Titles.SelectProperty}
                        label={Titles.Property}
                        onChange={(value) => {
                            var id = currentNode.id;
                            let filterModel = UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) || createExecutor();
                            filterModel = addValidatator(filterModel, { id: value });
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY,
                                options: {
                                    id,
                                    prop: NodeProperties.FilterModel,
                                    value: filterModel
                                }
                            }, {
                                operation: UIA.CHANGE_NODE_PROPERTY,
                                options: {
                                    id,
                                    prop: NodeProperties.ModelItemFilter,
                                    value: node.id
                                }
                            }])

                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: {
                                    ...UIA.LinkProperties.ModelItemFilter,
                                    ...createEventProp(LinkEvents.Remove, {
                                        function: 'OnRemoveModelFilterPropConnection'
                                    })
                                }
                            });
                        }}
                        value={''} />
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ModelFilterItemActivityMenu)