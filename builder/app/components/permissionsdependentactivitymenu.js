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
import { getNodesLinkedTo, getNodesByLinkType, SOURCE, GetNode } from '../methods/graph_methods';
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
        var extension_nodes = UIA.NodesByType(state, UIA.NodeTypes.ExtensionType).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        var graph = UIA.GetCurrentGraph(state);

        var extensionNodeId = currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIExtension] : '';
        var ext_allowed = (currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.AllowedExtensionValues] : []) || [];
        var ext_disallowed = [];

        if (extensionNodeId) {
            var extensionNode = GetNode(graph, extensionNodeId);
            if (extensionNode) {
                var def = UIA.GetNodeProp(extensionNode, UIA.NodeProperties.UIExtensionDefinition);

                if (def && def.config) {
                    if (def.config.isEnumeration) {
                        var extensionValues = def.config.list.map(t => {
                            return t[Object.keys(t)[0]];
                        })
                        ext_allowed = ext_allowed.intersection(extensionValues);
                        ext_disallowed = extensionValues.relativeCompliment(ext_allowed);
                    }
                }
            }
        }

        var enumeration = currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.Enumeration] : '';
        var allowed = (currentNode && currentNode.properties ? currentNode.properties[UIA.NodeProperties.AllowedEnumValues] : []) || [];
        var disallowed = [];
        if (enumeration) {
            var enumerationNode = GetNode(graph, enumeration);
            if (enumerationNode) {
                var enumerationValues = UIA.GetNodeProp(enumerationNode, NodeProperties.Enumeration) || [];
                allowed = allowed.intersection(enumerationValues);
                disallowed = enumerationValues.relativeCompliment(allowed);
            }
        }
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
                {currentNode ? (<CheckBox
                    title={Titles.UseUIExtensions}
                    label={Titles.UseUIExtensions}
                    value={currentNode.properties[UIA.NodeProperties.UseExtension]}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UseExtension,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                {currentNode && currentNode.properties[UIA.NodeProperties.UseExtension] ? <ControlSideBarMenuHeader title={Titles.AllowedEnums} /> : null}
                {active && ext_allowed && ext_allowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseExtension] ? ext_allowed.map((_enum) => {
                    return <div key={`ext_allowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedExtensionValues,
                            id: currentNode.id,
                            value: [...ext_allowed].filter(x => x !== _enum)
                        });
                    }} > {_enum}</div>;
                }) : null}
                {currentNode && currentNode.properties[UIA.NodeProperties.UseExtension] ? <ControlSideBarMenuHeader title={Titles.DisallowedEnums} /> : null}
                {active && ext_disallowed && ext_disallowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseExtension] ? ext_disallowed.map((_enum) => {
                    return <div key={`ext_disallowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedExtensionValues,
                            id: currentNode.id,
                            value: [...ext_allowed, _enum].unique()
                        });
                    }} > {_enum}</div>;
                }) : null}
                {
                    currentNode && currentNode.properties[UIA.NodeProperties.UseExtension] ? (<SelectInput
                        label={Titles.Extensions}
                        options={extension_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIExtension],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIExtension,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ExtensionLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIExtension] : ''} />) : null
                }
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
                {currentNode && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? <ControlSideBarMenuHeader title={Titles.AllowedEnums} /> : null}
                {active && allowed && allowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? allowed.map((_enum) => {
                    return <div key={`allowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedEnumValues,
                            id: currentNode.id,
                            value: [...allowed].filter(x => x !== _enum)
                        });
                    }} > {_enum}</div>;
                }) : null}
                {currentNode && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? <ControlSideBarMenuHeader title={Titles.DisallowedEnums} /> : null}
                {active && disallowed && disallowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? disallowed.map((_enum) => {
                    return <div key={`disallowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedEnumValues,
                            id: currentNode.id,
                            value: [...allowed, _enum].unique()
                        });
                    }} > {_enum}</div>;
                }) : null}
            </TabPane >
        );
    }
}

export default UIConnect(PermissionDependencyActivityMenu)