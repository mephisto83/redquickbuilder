// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextInput from './textinput';
import SelectInput from './selectinput';
import ButtonList from './buttonlist';
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties } from '../constants/nodetypes';
import { GetNode } from '../methods/graph_methods';
class PropertyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Property);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (currentNode) {
            var show_dependent = currentNode && currentNode.properties && currentNode.properties[UIA.NodeProperties.UseUIDependsOn];;
            var use_model_as_type = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseModelAsType);
            var many_to_many_enabled = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexus);
            var property_nodes = UIA.NodesByType(state, UIA.NodeTypes.Property).filter(x => {
                return x.id !== currentNode.id;
            }).map(node => {
                return {
                    value: node.id,
                    title: UIA.GetNodeTitle(node)
                }
            });
        }
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <CheckBox
                        label={Titles.UseDependentProperty}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseUIDependsOn] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UseUIDependsOn,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    {show_dependent ? (<SelectInput
                        label={Titles.DependentProperty}
                        options={property_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIDependsOn],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIDependsOn,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.DependsOnLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIDependsOn] : ''} />) : null}
                </FormControl>) : null}

                {currentNode ? (<FormControl>
                    <TextInput
                        label={Titles.UIName}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIName] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIName,
                                id: currentNode.id,
                                value
                            });
                        }} />

                </FormControl>) : null}
                {currentNode ? (<FormControl>
                    <CheckBox
                        label={Titles.ManyToManyNexus}
                        title={Titles.ManyToManyNexusDescription}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexus)}
                        onChange={(value) => {
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY, options: {
                                    prop: UIA.NodeProperties.ManyToManyNexus,
                                    id: currentNode.id,
                                    value
                                }
                            }]);
                        }} />
                    {!many_to_many_enabled ? (<SelectInput
                        options={NodesByType(state, NodeTypes.Model).map(x => {
                            return {
                                value: x.id,
                                title: GetNodeTitle(x)
                            }
                        })}
                        label={Titles.PropertyValueType}
                        onChange={(value) => {
                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusTypes) || [];
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ManyToManyNexusTypes,
                                id: currentNode.id,
                                value: [...types, value].unique(x => x)
                            });
                        }}
                        value={''} />) : null}
                    <ButtonList active={true} isSelected={(item) => {
                        var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusTypes) || [];
                        return item && types.some(x => x === item.id);
                    }}
                        items={(UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusTypes) || []).map(t => {
                            let node = GetNode(UIA.GetCurrentGraph(state), t);
                            if (node) {
                                return {
                                    title: UIA.GetNodeTitle(node),
                                    id: node.id
                                }
                            }
                        })}
                        onClick={(item) => {

                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusTypes) || [];
                            var ids = types;
                            if (types.some(t => item.id === t)) {
                                ids = [...ids.filter(t => t !== item.id)].unique(x => x)
                            }
                            else {
                                ids = [...ids, item.id].unique(x => x)
                            }
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ManyToManyNexusTypes,
                                id: currentNode.id,
                                value: ids
                            });
                        }} />
                    <CheckBox
                        label={Titles.UseModelAsType}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseModelAsType] : ''}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation([value ? null : {
                                operation: UIA.REMOVE_LINK_BETWEEN_NODES, options: {
                                    target: currentNode.properties[UIA.NodeProperties.UIModelType],
                                    source: id
                                }
                            }, {
                                operation: UIA.CHANGE_NODE_PROPERTY, options: {
                                    prop: UIA.NodeProperties.UseModelAsType,
                                    id: currentNode.id,
                                    value
                                }
                            }, !value || !currentNode.properties[UIA.NodeProperties.UIModelType] ? null : {
                                operation: UIA.ADD_LINK_BETWEEN_NODES, options: {
                                    target: currentNode.properties[UIA.NodeProperties.UIModelType],
                                    source: id,
                                    properties: { ...UIA.LinkProperties.ModelTypeLink }
                                }
                            }]);
                        }} />
                    {!use_model_as_type ? (<SelectInput
                        options={Object.keys(UIA.NodePropertyTypes).sort((a, b) => a.localeCompare(b)).map(x => {
                            return {
                                value: UIA.NodePropertyTypes[x],
                                title: x
                            }
                        })}
                        label={Titles.PropertyValueType}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIAttributeType,
                                id: currentNode.id,
                                value
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIAttributeType] : ''} />) : null}
                    {use_model_as_type ? (<SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).map(x => {
                            return {
                                value: x.id,
                                title: UIA.GetNodeTitle(x)
                            }
                        })}
                        label={Titles.PropertyModelType}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation([{
                                operation: UIA.REMOVE_LINK_BETWEEN_NODES, options: {
                                    target: currentNode.properties[UIA.NodeProperties.UIModelType],
                                    source: id
                                }
                            }, {
                                operation: UIA.CHANGE_NODE_PROPERTY, options: {
                                    prop: UIA.NodeProperties.UIModelType,
                                    id: currentNode.id,
                                    value
                                }
                            }, {
                                operation: UIA.ADD_LINK_BETWEEN_NODES, options: {
                                    target: value,
                                    source: id,
                                    properties: { ...UIA.LinkProperties.ModelTypeLink }
                                }
                            }]);

                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIModelType] : ''} />) : null}
                </FormControl>) : null}
                <ControlSideBarMenuHeader title={Titles.ModelActions} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_ATTRIBUTE_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.AttributeLink }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddAttribute} description={Titles.AddAttributeDescription} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(PropertyActivityMenu)