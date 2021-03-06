// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import MainSideBar from './mainsidebar';
import FormControl from './formcontrol';
import SideBar from './sidebar';
import TextBox from './textinput';
import { ExcludeDefaultNode, NodeTypes, NodeProperties, MAIN_CONTENT, LAYOUT_VIEW, LinkProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { ComponentTypes, NAVIGATION } from '../constants/componenttypes';
import { GetConnectedNodeByType, CreateLayout, TARGET, GetParameterName, getComponentPropertyList, GetNodesLinkedTo, SOURCE } from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import SideBarMenu from './sidebarmenu';
import TreeViewItem from './treeviewitem';
const NAVIGATION_PARAMETERS = 'NAVIGATION_PARAMETERS';
class NavigationParameterMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var active = UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) === UIA.NodeTypes.ComponentNode;
        if (!active) {
          return <div />;
        }
        let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
        let _ui_type = UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType);
        let componentTypes = ComponentTypes[_ui_type] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
        let componentProperties = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentProperties);
        let componentPropertiesList = getComponentPropertyList(componentProperties);
        let components = [];
        if (componentTypes[componentType] && componentTypes[componentType].properties) {
            Object.keys(componentTypes[componentType].properties).map(key => {
                let prop_obj = componentTypes[componentType].properties[key];
                if (prop_obj && prop_obj.ui) {
                    if (prop_obj.options) {
                        let nodeproperty = UIA.GetNodeProp(currentNode, prop_obj.nodeProperty);
                        if (nodeproperty === NAVIGATION) {
                            components.push((<SelectInput
                                label={Titles.Navigation}
                                key={`${nodeproperty} - ${_ui_type} - ${componentType} - ${key}`}
                                options={UIA.NodesByType(state, NodeTypes.Screen).toNodeSelect()}
                                value={UIA.GetNodeProp(currentNode, NodeProperties.Navigation)}
                                onChange={(value) => {
                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        prop: NodeProperties.Navigation,
                                        id: currentNode.id,
                                        value
                                    });
                                }} />));

                            let screenParameters = UIA.GetNodeProp(UIA.GetNodeById(UIA.GetNodeProp(currentNode, NodeProperties.Navigation)), NodeProperties.ScreenParameters) || [];
                            let treeMenu = (screenParameters.map(v => {
                                let innertree = `${nodeproperty} - ${_ui_type} - ${componentType} - parameter - ${GetParameterName(v)}`;
                                let navparameters = UIA.GetNodeProp(currentNode, NodeProperties.NavigationParameters) || {};
                                let parameterProperty = UIA.GetNodeProp(currentNode, UIA.NodeProperties.NavigationParametersProperty) || {};
                                return (
                                    <TreeViewMenu
                                        title={`${GetParameterName(v)}`}
                                        icon={'fa fa-object-group'}
                                        open={UIA.Visual(state, innertree)}
                                        active={UIA.Visual(state, innertree)}
                                        onClick={() => {
                                            this.props.toggleVisual(innertree)
                                        }}>
                                        <FormControl>
                                            <SelectInput
                                                label={GetParameterName(v)}
                                                key={`${innertree}`}
                                                options={componentPropertiesList}
                                                value={navparameters[v.id]}
                                                onChange={(value) => {
                                                    let parameters = UIA.GetNodeProp(currentNode, NodeProperties.NavigationParameters) || {};
                                                    parameters[v.id] = value;
                                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                        prop: NodeProperties.NavigationParameters,
                                                        id: currentNode.id,
                                                        value: parameters
                                                    });
                                                }} />
                                            {componentProperties && navparameters && v && v.id && navparameters[v.id] ? <SelectInput
                                                options={GetNodesLinkedTo(UIA.GetRootGraph(state), {
                                                    id: componentProperties.properties[navparameters[v.id]],
                                                    direction: SOURCE
                                                }).toNodeSelect()}
                                                onChange={(val) => {
                                                    parameterProperty[navparameters[v.id]] = val;
                                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                        prop: UIA.NodeProperties.NavigationParametersProperty,
                                                        id: currentNode.id,
                                                        value: parameterProperty
                                                    });
                                                }}
                                                label={Titles.Property}
                                                value={parameterProperty[navparameters[v.id]]} /> : null}
                                        </FormControl>
                                    </TreeViewMenu>)
                            }));
                            components.push(treeMenu);

                        }
                    }
                }
            })
        }
        return (
            <div style={{ position: 'relative' }}>
                <MainSideBar notactive={!active} relative={true}>
                    <SideBar relative={true} style={{ paddingTop: 0 }}>
                        <SideBarMenu>
                            <TreeViewMenu
                                title={`${Titles.Navigation}`}
                                icon={'fa fa-object-group'}
                                open={UIA.Visual(state, NAVIGATION_PARAMETERS)}
                                active={UIA.Visual(state, NAVIGATION_PARAMETERS)}
                                onClick={() => {
                                    this.props.toggleVisual(NAVIGATION_PARAMETERS)
                                }}>
                                <br />
                                {components}
                            </TreeViewMenu>
                        </SideBarMenu>
                    </SideBar>
                </MainSideBar>
            </div>
        );
    }
}

export default UIConnect(NavigationParameterMenu)
