// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import MainSideBar from './mainsidebar';
import FormControl from './formcontrol';
import TextBox from './textinput';
import { ExcludeDefaultNode, NodeTypes, NodeProperties, MAIN_CONTENT, LAYOUT_VIEW, LinkProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { ComponentTypes, NAVIGATION } from '../constants/componenttypes';
import { GetConnectedNodeByType, CreateLayout, TARGET, GetParameterName, getComponentPropertyList } from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import SideBarMenu from './sidebarmenu';
import TreeViewItem from './treeviewitem';
class ComponentActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var active = UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) === UIA.NodeTypes.ComponentNode;
        let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
        let _ui_type = UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType);
        let componentTypes = ComponentTypes[_ui_type] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
        let components = [];
        if (componentTypes[componentType] && componentTypes[componentType].properties) {
            Object.keys(componentTypes[componentType].properties).map(key => {
                let prop_obj = componentTypes[componentType].properties[key];
                if (prop_obj && prop_obj.ui) {
                    if (prop_obj.options) {
                        components.push((<SelectInput
                            label={key}
                            key={`${_ui_type} - ${componentType}- ${key}`}
                            options={prop_obj.options.map(t => ({ title: t, value: t }))}
                            value={UIA.GetNodeProp(currentNode, prop_obj.nodeProperty)}
                            onChange={(value) => {
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: prop_obj.nodeProperty,
                                    id: currentNode.id,
                                    value
                                });
                            }} />));
                    }
                    else if (prop_obj.nodeTypes) {
                        components.push((<SelectInput
                            label={key}
                            key={`${_ui_type} - ${componentType}- ${key}`}
                            options={UIA.NodesByType(state, prop_obj.nodeTypes).filter(prop_obj.nodeFilter || (() => true)).toNodeSelect()}
                            value={UIA.GetNodeProp(currentNode, prop_obj.nodeProperty)}
                            onChange={(value) => {
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: prop_obj.nodeProperty,
                                    id: currentNode.id,
                                    value
                                });
                            }} />));
                    }
                }
            })
        }
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <TextInput
                        label={Titles.Label}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Label)}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Label,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    <SelectInput
                        label={Titles.ComponentType}
                        options={Object.keys(componentTypes).map(t => ({ title: t, value: t }))}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType)}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ComponentType,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    {components}
                </FormControl>) : null}
                {componentType && componentTypes && componentTypes[componentType] && componentTypes[componentType].layout ? (
                    <ControlSideBarMenu>
                        <ControlSideBarMenuItem onClick={() => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Layout,
                                id: currentNode.id,
                                value: UIA.GetNodeProp(currentNode, NodeProperties.Layout) || CreateLayout()
                            });
                            this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
                        }} icon={'fa fa-puzzle-piece'} title={Titles.SetupLayout} description={Titles.SetupLayout} />
                        <ControlSideBarMenuItem onClick={() => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Layout,
                                id: currentNode.id,
                                value: null
                            });
                            this.props.setVisual(MAIN_CONTENT, null);
                        }} icon={'fa fa-puzzle-piece'} title={Titles.ClearLayout} description={Titles.ClearLayout} />
                        <ControlSideBarMenuItem onClick={() => {
                            this.props.graphOperation(UIA.NEW_COMPONENT_NODE, {
                                parent: UIA.Visual(state, UIA.SELECTED_NODE),
                                groupProperties: {
                                },
                                properties: {
                                    [UIA.NodeProperties.UIType]: UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType)
                                },
                                linkProperties: {
                                    properties: { ...LinkProperties.ComponentLink }
                                }
                            });
                            this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
                        }} icon={'fa fa-puzzle-piece'} title={Titles.AddComponentNew} description={Titles.AddComponentNew} />
                        {UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType) === ComponentTypes.ReactNative.List.key ? (<ControlSideBarMenuItem onClick={() => {
                            this.props.graphOperation(UIA.NEW_COMPONENT_NODE, {
                                parent: UIA.Visual(state, UIA.SELECTED_NODE),
                                groupProperties: {
                                },
                                properties: {
                                    [UIA.NodeProperties.UIType]: UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType)
                                },
                                linkProperties: {
                                    properties: { ...LinkProperties.ListItem }
                                }
                            });
                            this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
                        }} icon={'fa fa-puzzle-piece'} title={Titles.SetListItem} description={Titles.SetListItem} />) : null
                        }
                    </ControlSideBarMenu>
                ) : null}

                {componentType && componentTypes && componentTypes[componentType] && componentTypes[componentType].datasource ? (
                    <ControlSideBarMenu> <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_DATA_SOURCE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            properties: {
                                [UIA.NodeProperties.UIType]: UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType),
                                [UIA.NodeProperties.UIText]: `${UIA.GetNodeTitle(currentNode)} Data Source`
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.DataSourceLink }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddDataSource} description={Titles.AddDataSource} />  </ControlSideBarMenu>) : null}

            </TabPane>
        );
    }
}

export default UIConnect(ComponentActivityMenu)