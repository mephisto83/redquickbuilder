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
import { getNodesLinkedTo, getNodesByLinkType, SOURCE } from '../methods/graph_methods';
import { NodeTypes, LinkType, NodeProperties, Methods } from '../constants/nodetypes';

class PermissionActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Permission);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var is_agent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsAgent);
        var permissions = currentNode ? { ...Methods, ...(currentNode.properties[UIA.NodeProperties.UIPermissions] || {}) } : null;
        var model_nodes = UIA.NodesByType(state, UIA.NodeTypes.Model).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        var graph = UIA.GetCurrentGraph(state);
        var targetNodeId = graph && currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.PermissionTarget] : '';

        var requestorNodeId = graph && currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.PermissionRequester] : '';
        var propertyNodes = null;
        if (targetNodeId) {
            propertyNodes = getNodesByLinkType(graph, { id: targetNodeId, direction: SOURCE, type: LinkType.PropertyLink });
            propertyNodes = propertyNodes.map(node => {
                return {
                    value: node.id,
                    title: UIA.GetNodeTitle(node)
                }
            })
        }
        var requestorPropertyNodes = null;
        if (requestorNodeId) {
            requestorPropertyNodes = getNodesByLinkType(graph, { id: requestorNodeId, direction: SOURCE, type: LinkType.PropertyLink });
            requestorPropertyNodes = requestorPropertyNodes.map(node => {
                return {
                    value: node.id,
                    title: UIA.GetNodeTitle(node)
                }
            })
        }
        return (
            <TabPane active={active} >
                <ControlSideBarMenuHeader title={Titles.PermissionAttributes} />
                {currentNode ? (<CheckBox
                    title={Titles.OwnedResourcesDescription}
                    label={Titles.OwnedResources}
                    value={currentNode.properties[UIA.NodeProperties.IsOwned]}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.IsOwned,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                <ControlSideBarMenuHeader title={Titles.PermissionActions} />
                {
                    permissions ? (<FormControl>{(Object.keys(permissions).map(key => {
                        return (<CheckBox key={`permissions-${key}`}
                            label={Titles.Permissions[key]}
                            value={permissions[key]}
                            onChange={(value) => {
                                permissions[key] = value;
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: UIA.NodeProperties.UIPermissions,
                                    id: currentNode.id,
                                    value: {
                                        ...permissions
                                    }
                                });
                            }} />);
                    }))}</FormControl>) : null
                }
                <ControlSideBarMenuHeader title={Titles.ModelActions} />
                {
                    currentNode ? (<SelectInput
                        label={Titles.Models}
                        options={model_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.PermissionRequester],
                                source: id
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
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.PermissionRequester] : ''} />) : null
                }
                {
                    requestorPropertyNodes && requestorPropertyNodes.length ? (<SelectInput
                        label={Titles.PermissionDependsOnProperties}
                        options={requestorPropertyNodes}
                        onChange={(value) => {

                            this.props.graphOperation(UIA.NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE, {
                                parent: UIA.Visual(state, UIA.SELECTED_NODE),
                                links: [{
                                    target: value,
                                    linkProperties: {
                                        properties: {
                                            ...UIA.LinkProperties.ExistLink,
                                            ...UIA.LinkProperties.PermissionDependencyPropertyLink
                                        }
                                    }
                                }],
                                properties: {
                                    [NodeProperties.UIText]: UIA.GetNodeProp(graph.nodeLib[value], NodeProperties.UIText)
                                },
                                groupProperties: {
                                },
                                linkProperties: {
                                    properties: { ...UIA.LinkProperties.PermissionPropertyDependencyLink }
                                }
                            });
                        }}
                        value={''} />) : null
                }
                {
                    currentNode ? (<SelectInput
                        label={Titles.TargetModel}
                        options={model_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.PermissionTarget],
                                source: id
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
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.PermissionTarget] : ''} />) : null
                }
                {
                    propertyNodes && propertyNodes.length ? (<SelectInput
                        label={Titles.PermissionDependsOnProperties}
                        options={propertyNodes}
                        onChange={(value) => {

                            this.props.graphOperation(UIA.NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE, {
                                parent: UIA.Visual(state, UIA.SELECTED_NODE),
                                links: [{
                                    target: value,
                                    linkProperties: {
                                        properties: {
                                            ...UIA.LinkProperties.ExistLink,
                                            ...UIA.LinkProperties.PermissionDependencyPropertyLink
                                        }
                                    }
                                }],
                                properties: {
                                    [NodeProperties.UIText]: UIA.GetNodeProp(graph.nodeLib[value], NodeProperties.UIText)
                                },
                                groupProperties: {
                                },
                                linkProperties: {
                                    properties: { ...UIA.LinkProperties.PermissionPropertyDependencyLink }
                                }
                            });
                        }}
                        value={''} />) : null
                }
            </TabPane >
        );
    }
}

export default UIConnect(PermissionActivityMenu)