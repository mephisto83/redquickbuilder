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
import TextBox from './textinput';

class ModelActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Model);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var is_agent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsAgent);
        var is_parent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsParent);
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
                                source: id
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
                </FormControl>) : null}

                <ControlSideBarMenuHeader title={Titles.ModelActions} />

                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_PROPERTY_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            linkProperties: {
                                properties: { ...UIA.LinkProperties.PropertyLink }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddProperty} description={Titles.AddPropertyDescription} />
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
                            source: id
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