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

class PermissionDependencyActivityMenu extends Component<any, any> {
    getTargetNodes(graph, currentNode) {
        let targetPropertyNodes = [];
        if (currentNode) {
            targetPropertyNodes = getNodesByLinkType(graph, {
                id: currentNode.id,
                direction: SOURCE,
                type: LinkType.PermissionDependencyPropertyManyToManyLink
            });
            if (!targetPropertyNodes.length) {
                targetPropertyNodes = getNodesByLinkType(graph, {
                    id: currentNode.id,
                    direction: SOURCE,
                    type: LinkType.PermissionDependencyProperty
                });
            }
        }
        return targetPropertyNodes;
    }
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.PermissionDependency);
        if (!active) {
          return <div />;
        }
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
                            return t[def.config.keyField || Object.keys(t)[0]];
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

        let targetPropertyNodes = this.getTargetNodes(graph, currentNode);
        let targetNodeType = null;
        let targetPropertyNode = null;
        if (targetPropertyNodes.length) {
            targetPropertyNode = targetPropertyNodes[0];
            targetNodeType = UIA.GetNodeProp(targetPropertyNode, UIA.NodeProperties.UIAttributeType);
        }
        return (
            <TabPane active={active} >
                <ControlSideBarMenuHeader title={Titles.PermissionsDependencyAttribute} />
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.BOOLEAN ? (<CheckBox
                    title={Titles.UseEqualDescription}
                    label={Titles.UseEqual}
                    value={currentNode.properties[UIA.NodeProperties.UseEqual]}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UseEqual,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.BOOLEAN && UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseEqual) ? (<SelectInput
                    title={Titles.IsEqualToDescription}
                    label={Titles.IsEqualTo}
                    options={['true', 'false'].map(t => ({ title: t, value: t }))}
                    value={currentNode.properties[UIA.NodeProperties.IsEqualTo]}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.IsEqualTo,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.LISTOFSTRINGS ? (<CheckBox
                    title={Titles.IncludedInListDescription}
                    label={Titles.IncludedInList}
                    value={currentNode.properties[UIA.NodeProperties.IncludedInList]}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.IncludedInList,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.LISTOFSTRINGS ? (<CheckBox
                    title={Titles.ExcludedFromListDescription}
                    label={Titles.ExcludedFromList}
                    value={currentNode.properties[UIA.NodeProperties.ExcludedFromList]}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.ExcludedFromList,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING ? (<CheckBox
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
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING ? (<CheckBox
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
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING && currentNode.properties[UIA.NodeProperties.UseExtension] ? <ControlSideBarMenuHeader title={Titles.AllowedEnums} /> : null}
                {active && ext_allowed && ext_allowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseExtension] ? ext_allowed.map((_enum) => {
                    return <div key={`ext_allowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedExtensionValues,
                            id: currentNode.id,
                            value: [...ext_allowed].filter(x => x !== _enum)
                        });
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.DisallowedExtensionValues,
                            id: currentNode.id,
                            value: extensionValues.relativeCompliment([...ext_allowed].filter(x => x !== _enum))
                        });
                    }} > {_enum}</div>;
                }) : null}
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING && currentNode.properties[UIA.NodeProperties.UseExtension] ? <ControlSideBarMenuHeader title={Titles.DisallowedEnums} /> : null}
                {active && ext_disallowed && ext_disallowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseExtension] ? ext_disallowed.map((_enum) => {
                    return <div key={`ext_disallowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedExtensionValues,
                            id: currentNode.id,
                            value: [...ext_allowed, _enum].unique()
                        });
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.DisallowedExtensionValues,
                            id: currentNode.id,
                            value: extensionValues.relativeCompliment([...ext_allowed, _enum].unique())
                        });
                    }} > {_enum}</div>;
                }) : null}
                {
                    currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING && currentNode.properties[UIA.NodeProperties.UseExtension] ? (<SelectInput
                        label={Titles.Extensions}
                        options={extension_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIExtension],
                                source: id,
                                linkType: UIA.LinkProperties.ExtensionLink.type
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
                    currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? (<SelectInput
                        label={Titles.Enumeration}
                        options={enumeration_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.Enumeration],
                                source: id,
                                linkType: UIA.LinkProperties.EnumerationLink.type
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
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? <ControlSideBarMenuHeader title={Titles.AllowedEnums} /> : null}
                {active && allowed && allowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? allowed.map((_enum) => {
                    return <div key={`allowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        var disallowed = enumerationValues.relativeCompliment([...allowed].filter(x => x !== _enum));
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedEnumValues,
                            id: currentNode.id,
                            value: [...allowed].filter(x => x !== _enum)
                        });
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.DisallowedEnumValues,
                            id: currentNode.id,
                            value: disallowed
                        });
                    }} > {_enum}</div>;
                }) : null}
                {currentNode && targetPropertyNode && targetNodeType == UIA.NodePropertyTypes.STRING && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? <ControlSideBarMenuHeader title={Titles.DisallowedEnums} /> : null}
                {active && disallowed && disallowed.length && currentNode && currentNode.properties[UIA.NodeProperties.UseEnumeration] ? disallowed.map((_enum) => {
                    return <div key={`disallowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        var disallowed = enumerationValues.relativeCompliment([...allowed, _enum].unique());
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AllowedEnumValues,
                            id: currentNode.id,
                            value: [...allowed, _enum].unique()
                        });
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.DisallowedEnumValues,
                            id: currentNode.id,
                            value: disallowed
                        });
                    }} > {_enum}</div>;
                }) : null}
            </TabPane >
        );
    }
}

export default UIConnect(PermissionDependencyActivityMenu)
