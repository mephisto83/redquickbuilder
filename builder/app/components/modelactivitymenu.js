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
import { clipboard } from 'electron';

class ModelActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Model);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var is_agent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsAgent);
        var is_parent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsParent);
        var many_to_many_enabled = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexus);
        var permission_nodes = UIA.NodesByType(state, UIA.NodeTypes.Permission).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <CheckBox
                        label={Titles.IsAgent}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.IsAgent] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.IsAgent,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    {is_agent ? (<SelectInput
                        label={Titles.UserModel}
                        options={UIA.NodesByType(state, UIA.NodeTypes.Model).map(node => {
                            return {
                                value: node.id,
                                title: UIA.GetNodeTitle(node)
                            }
                        })}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIUser],
                                source: id,
                                linkType: UIA.LinkProperties.UserLink.type
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIUser,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.UserLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIUser] : ''} />) : null}
                    <CheckBox
                        label={Titles.IsUser}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.IsUser] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.IsUser,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    <CheckBox
                        label={Titles.IsOwnedByAgents}
                        title={Titles.IsOwnedByAgentsDescriptions}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.IsOwnedByAgents] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.IsOwnedByAgents,
                                id: currentNode.id,
                                value
                            });
                        }} />
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
                    <CheckBox
                        label={Titles.IsCompositeInput}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsCompositeInput)}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.IsCompositeInput,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    {many_to_many_enabled ? (<SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).map(x => {
                            return {
                                value: x.id,
                                title: UIA.GetNodeTitle(x)
                            }
                        })}
                        label={Titles.ManyToManyNexusModel}
                        onChange={(value) => {
                            let id = currentNode.id;
                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusTypes) || [];
                            this.props.graphOperation([{
                                operation: UIA.CHANGE_NODE_PROPERTY,
                                options: {
                                    prop: UIA.NodeProperties.ManyToManyNexusTypes,
                                    id: currentNode.id,
                                    value: [...types, value].unique(x => x)
                                }
                            }, {
                                operation: UIA.ADD_LINK_BETWEEN_NODES,
                                options: {
                                    target: value,
                                    source: id,
                                    properties: { ...UIA.LinkProperties.ManyToManyLink }
                                }
                            }]);
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
                            let id = currentNode.id;
                            var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusTypes) || [];
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
                                    prop: UIA.NodeProperties.ManyToManyNexusTypes,
                                    id: currentNode.id,
                                    value: ids
                                }
                            }, {
                                operation: UIA.REMOVE_LINK_BETWEEN_NODES,
                                options: {
                                    target: item.id,
                                    source: id,
                                    linkType: UIA.LinkProperties.ManyToManyLink.type
                                }
                            }]);
                        }} />
                </FormControl>) : null}

                <ControlSideBarMenuHeader title={Titles.ModelActions} />

                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.ADD_DEFAULT_PROPERTIES, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: { ...UIA.LinkProperties.PropertyLink }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.SetDefaultProperties} description={Titles.SetDefaultPropertiesDescription} />
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_PROPERTY_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: { ...UIA.LinkProperties.PropertyLink }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddProperty} description={Titles.AddPropertyDescription} />
                    <ControlSideBarMenuItem onClick={() => {
                      clipboard.writeText(UIA.generateDataSeed(currentNode))
                    }} icon={'fa fa-puzzle-piece'} title={Titles.CreateObjectDataSeed} description={Titles.CreateObjectDataSeed} />
                    
                </ControlSideBarMenu>
                {is_agent ? (<SelectInput
                    label={Titles.PermissionType}
                    options={permission_nodes}
                    onChange={(value) => {
                        var id = currentNode.id;
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: { ...UIA.LinkProperties.PermissionLink }
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIPermissions] : ''} />) : null}
                {currentNode ? (<FormControl>
                    <CheckBox
                        label={Titles.IsParent}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.IsParent] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.IsParent,
                                id: currentNode.id,
                                value
                            });
                        }} />
                </FormControl>) : null}
                {is_parent ? (<SelectInput
                    label={Titles.ParentTo}
                    options={UIA.NodesByType(state, UIA.NodeTypes.Model).map(node => {
                        return {
                            value: node.id,
                            title: UIA.GetNodeTitle(node)
                        }
                    })}
                    onChange={(value) => {
                        var id = currentNode.id;
                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                            target: currentNode.properties[UIA.NodeProperties.UIChoiceNode],
                            source: id,
                            linkType: UIA.LinkProperties.ParentLink.type
                        })
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UIChoiceNode,
                            id,
                            value
                        });
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: { ...UIA.LinkProperties.ParentLink }
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIChoiceNode] : ''} />) : null}
                <ControlSideBarMenu>
                    {is_agent ? (<ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_PERMISSION_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            linkProperties: {
                                properties: { ...UIA.LinkProperties.PermissionLink }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddPermission} description={Titles.AddPermissionDescription} />) : null}
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(ModelActivityMenu)