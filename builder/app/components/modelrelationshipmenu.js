// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import ButtonList from './buttonlist';
import TextBox from './textinput';
import { NodeTypes } from '../constants/nodetypes';
import { GetNode } from '../methods/graph_methods';

class ModelRelationshipMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Model);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var hasLogicalChildren = UIA.GetNodeProp(currentNode, UIA.NodeProperties.HasLogicalChildren);
        var hasLogicalNieces = UIA.GetNodeProp(currentNode, UIA.NodeProperties.HasLogicalNieces);

        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <CheckBox
                        label={Titles.HasLogicalChildren}
                        title={Titles.HasLogicalChildrenDescription}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.HasLogicalChildren)}
                        onChange={(value) => {
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY, options: {
                                    prop: UIA.NodeProperties.HasLogicalChildren,
                                    id: currentNode.id,
                                    value
                                }
                            }]);
                        }} />
                    {hasLogicalChildren ? (<SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).map(x => {
                            return {
                                value: x.id,
                                title: UIA.GetNodeTitle(x)
                            }
                        })}
                        label={Titles.LogicalChildrenTypes}
                        onChange={(value) => {
                            let id = currentNode.id;
                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalChildrenTypes) || [];
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY,
                                options: {
                                    prop: UIA.NodeProperties.LogicalChildrenTypes,
                                    id: currentNode.id,
                                    value: [...types, value].unique(x => x)
                                }
                            }, {
                                operation: UIA.ADD_LINK_BETWEEN_NODES,
                                options: {
                                    target: value,
                                    source: id,
                                    properties: { ...UIA.LinkProperties.LogicalChildren }
                                }
                            }]);
                        }}
                        value={''} />) : null}
                    {hasLogicalChildren ? <ButtonList active={true} isSelected={(item) => {
                        var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalChildrenTypes) || [];
                        return item && types.some(x => x === item.id);
                    }}
                        items={(UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalChildrenTypes) || []).map(t => {
                            let node = GetNode(UIA.GetCurrentGraph(state), t);
                            if (node) {
                                return {
                                    title: UIA.GetNodeTitle(node),
                                    id: node.id
                                }
                            }
                        })}
                        onClick={(item) => {
                            let id = currentNode.id;
                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalChildrenTypes) || [];
                            var ids = types;
                            if (types.some(t => item.id === t)) {
                                ids = [...ids.filter(t => t !== item.id)].unique(x => x)
                            }
                            else {
                                ids = [...ids, item.id].unique(x => x)
                            }
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY,
                                options: {
                                    prop: UIA.NodeProperties.LogicalChildrenTypes,
                                    id: currentNode.id,
                                    value: ids
                                }
                            }, {
                                operation: UIA.REMOVE_LINK_BETWEEN_NODES,
                                options: {
                                    target: item.id,
                                    source: id,
                                    properties: { ...UIA.LinkProperties.LogicalChildren }
                                }
                            }]);
                        }} /> : null}













                    <CheckBox
                        label={Titles.HasLogicalNieces}
                        title={Titles.HasLogicalNiecesDescription}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.HasLogicalNieces)}
                        onChange={(value) => {
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY, options: {
                                    prop: UIA.NodeProperties.HasLogicalNieces,
                                    id: currentNode.id,
                                    value
                                }
                            }]);
                        }} />
                    {hasLogicalNieces ? (<SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).map(x => {
                            return {
                                value: x.id,
                                title: UIA.GetNodeTitle(x)
                            }
                        })}
                        label={Titles.LogicalNieceTypes}
                        onChange={(value) => {
                            let id = currentNode.id;
                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalNieceTypes) || [];
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY,
                                options: {
                                    prop: UIA.NodeProperties.LogicalNieceTypes,
                                    id: currentNode.id,
                                    value: [...types, value].unique(x => x)
                                }
                            }, {
                                operation: UIA.ADD_LINK_BETWEEN_NODES,
                                options: {
                                    target: value,
                                    source: id,
                                    properties: { ...UIA.LinkProperties.LogicalNieces }
                                }
                            }]);
                        }}
                        value={''} />) : null}
                    {hasLogicalNieces ? <ButtonList active={true} isSelected={(item) => {
                        var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalNieceTypes) || [];
                        return item && types.some(x => x === item.id);
                    }}
                        items={(UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalNieceTypes) || []).map(t => {
                            let node = GetNode(UIA.GetCurrentGraph(state), t);
                            if (node) {
                                return {
                                    title: UIA.GetNodeTitle(node),
                                    id: node.id
                                }
                            }
                        })}
                        onClick={(item) => {
                            let id = currentNode.id;
                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.LogicalNieceTypes) || [];
                            var ids = types;
                            if (types.some(t => item.id === t)) {
                                ids = [...ids.filter(t => t !== item.id)].unique(x => x)
                            }
                            else {
                                ids = [...ids, item.id].unique(x => x)
                            }
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY,
                                options: {
                                    prop: UIA.NodeProperties.LogicalNieceTypes,
                                    id: currentNode.id,
                                    value: ids
                                }
                            }, {
                                operation: UIA.REMOVE_LINK_BETWEEN_NODES,
                                options: {
                                    target: item.id,
                                    source: id,
                                    properties: { ...UIA.LinkProperties.LogicalNieces }
                                }
                            }]);
                        }} /> : null}
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ModelRelationshipMenu)