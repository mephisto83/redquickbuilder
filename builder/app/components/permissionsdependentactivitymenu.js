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
import { NodeTypes, LinkType, NodeProperties } from '../constants/nodetypes';

class PermissionDependencyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.PermissionDependency);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var is_agent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsAgent);
        var enumeration_nodes = UIA.NodesByType(state, UIA.NodeTypes.Enumeration).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });

        return (
            <TabPane active={active} >
                <ControlSideBarMenuHeader title={Titles.PermissionsDependencyAttribute} />
                {currentNode ? (<CheckBox
                    title={Titles.UseEnumeration}
                    label={Titles.UseEnumeration}
                    value={currentNode.properties[UIA.NodeProperties.UseEnumeration]}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UseEnumeration,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                {
                    currentNode && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? (<SelectInput
                        label={Titles.Enumeration}
                        options={enumeration_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.Enumeration],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Enumeration,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.EnumerationLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.Enumeration] : ''} />) : null
                }
            </TabPane >
        );
    }
}

export default UIConnect(PermissionDependencyActivityMenu)