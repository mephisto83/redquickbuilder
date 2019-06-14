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
            if (propertyNodes)
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
            </TabPane >
        );
    }
}

export default UIConnect(PermissionActivityMenu)