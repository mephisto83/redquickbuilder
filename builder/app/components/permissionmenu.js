// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import NodeList from './nodelist';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import { getNodesLinkedTo, getNodesByLinkType, SOURCE, GetManyToManyNodes, getPropertyNodes } from '../methods/graph_methods';
import { NodeTypes, LinkType, NodeProperties, Methods } from '../constants/nodetypes';

class PermissionMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Permission);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var is_agent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsAgent);
        var permissions = currentNode ? { ...Methods, ...(currentNode.properties[UIA.NodeProperties.UIPermissions] || {}) } : null;
        var model_nodes = UIA.NodesByType(state, UIA.NodeTypes.Model).toNodeSelect();

        var graph = UIA.GetCurrentGraph(state);
        var targetNodeId = graph && currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.PermissionTarget] : '';

        var requestorNodeId = graph && currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.PermissionRequester] : '';
        var propertyNodes = null;
        if (targetNodeId) {
            propertyNodes = getNodesByLinkType(graph, { id: targetNodeId, direction: SOURCE, type: LinkType.PropertyLink });
            if (propertyNodes)
                propertyNodes = propertyNodes.toNodeSelect()
        }
        var requestorPropertyNodes = null;
        if (requestorNodeId) {
            requestorPropertyNodes = getNodesByLinkType(graph, { id: requestorNodeId, direction: SOURCE, type: LinkType.PropertyLink });
            requestorPropertyNodes = (requestorPropertyNodes || []).toNodeSelect();
        }
        let method_nodes = UIA.NodesByType(state, NodeTypes.Method).map(t => ({ title: UIA.GetNodeTitle(t), value: t.id }));
        let currentRequester = UIA.GetNodeProp(currentNode, UIA.NodeProperties.PermissionRequester);
        let currentTarget = UIA.GetNodeProp(currentNode, UIA.NodeProperties.PermissionTarget);
        let manyToManyNodes = [];
        if (currentRequester && currentTarget) {
            manyToManyNodes = GetManyToManyNodes(graph, [currentRequester, currentTarget]);
        }

        let manyToManyNodeId = UIA.GetNodeProp(currentNode, UIA.NodeProperties.PermissionManyToMany);
        let manyToManyProperties = [];
        if (manyToManyNodeId) {
            manyToManyProperties = getPropertyNodes(graph, manyToManyNodeId).toNodeSelect();
        }
        return (
            <TabPane active={active} >
                <ControlSideBarMenuHeader title={Titles.ModelActions} />
                <CheckBox label={Titles.MatchIds}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.MatchIds)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchIds,
                            id: currentNode.id,
                            value
                        });
                    }} />
                <CheckBox label={Titles.ConnectionExists}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ConnectionExists)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.ConnectionExists,
                            id: currentNode.id,
                            value
                        });
                    }} />
                {
                    currentNode ? (<SelectInput
                        label={Titles.ManyToManyNexus}
                        options={manyToManyNodes.toNodeSelect()}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.PermissionManyToMany],
                                source: id,
                                linkType: UIA.LinkProperties.ManyToManyPermissionLink.type
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.PermissionManyToMany,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ManyToManyPermissionLink }
                            });
                        }}
                        value={manyToManyNodeId} />) : null
                }
                {
                    manyToManyProperties && manyToManyProperties.length ? (<SelectInput
                        label={Titles.PermissionDependsOnProperties}
                        options={manyToManyProperties}
                        onChange={(value) => {

                            this.props.graphOperation(UIA.NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE, {
                                parent: UIA.Visual(state, UIA.SELECTED_NODE),
                                links: [{
                                    target: value,
                                    linkProperties: {
                                        mergeProperties: true,
                                        properties: {
                                            ...UIA.LinkProperties.ExistLink,
                                            ...UIA.LinkProperties.PermissionDependencyPropertyManyToManyLink
                                        }
                                    }
                                }],
                                properties: {
                                    [NodeProperties.UIText]: UIA.GetNodeProp(graph.nodeLib[value], NodeProperties.UIText),
                                },
                                groupProperties: {
                                },
                                linkProperties: {
                                    mergeProperties: true,
                                    properties: {
                                        ...UIA.LinkProperties.PermissionPropertyDependencyManyToManyLink
                                    }
                                }
                            });
                        }}
                        value={''} />) : null
                }
                {
                    currentNode ? (<SelectInput
                        label={Titles.AgentName}
                        options={model_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.PermissionRequester],
                                source: id,
                                linkType: UIA.LinkProperties.RequestorPermissionLink.type
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.PermissionRequester,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.RequestorPermissionLink }
                            });
                        }}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.PermissionRequester)} />) : null
                }

                {
                    currentNode ? (<SelectInput
                        label={Titles.TargetModel}
                        options={model_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.PermissionTarget],
                                source: id,
                                linkType: UIA.LinkProperties.AppliedPermissionLink.type
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.PermissionTarget,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.AppliedPermissionLink }
                            });
                        }}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.PermissionTarget)} />) : null
                }
                {
                    currentNode ? <NodeList
                        node={currentNode}
                        removeLink={false}
                        removeNode={true}
                        linkType={UIA.LinkProperties.ManyToManyPermissionLink}
                        nodeProperty={UIA.NodeProperties.PermissionManyToMany}
                        items={getNodesByLinkType(graph, {
                            id: currentNode.id,
                            type: LinkType.PermissionPropertyDependency
                        }).toNodeSelect()} /> : null
                }
            </TabPane >
        );
    }
}

export default UIConnect(PermissionMenu)