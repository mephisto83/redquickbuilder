// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
import { ExcludeDefaultNode, NodeTypes, NodeProperties, MAIN_CONTENT, LAYOUT_VIEW, LinkProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { ComponentTypes, InstanceTypes } from '../constants/componenttypes';
import { GetConnectedNodeByType, CreateLayout, TARGET, addComponentProperty, hasComponentProperty, getComponentProperty, getComponentPropertyList, removeComponentProperty } from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import TextInput from './textinput';
import SideMenuContainer from './sidemenucontainer';
import ButtonList from './buttonlist';
import { SCOPE_TAB } from './dashboard';
import { createComponentApi, removeComponentApi, addComponentApi } from '../methods/component_api_methods';
import checkboxproperty from './checkboxproperty';
class ComponentAPIMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var active = [UIA.NodeTypes.ComponentNode, UIA.NodeTypes.ScreenOption].some(v => v === UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType));
        let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
        let componentTypes = ComponentTypes[UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType)] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
        let models = UIA.NodesByType(state, NodeTypes.Model).toNodeSelect();
        let componentProps = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentApi) || createComponentApi();
        return (
            <SideMenuContainer active={active} tab={SCOPE_TAB} visual={"component-api-menu"} title={Titles.ComponentAPIMenu}>
                <TabPane active={active}>
                    <checkboxproperty />
                </TabPane>
            </SideMenuContainer>
        );
    }
    applyDefaultComponentProperties() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
        let _ui_type = UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType);
        let componentTypes = ComponentTypes[_ui_type] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);

        Object.keys(componentTypes[componentType].properties).map(key => {
            let prop_obj = componentTypes[componentType].properties[key];
            if (prop_obj.parameterConfig) {
                let selectedComponentApiProperty = key;
                let componentProperties = UIA.GetNodeProp(currentNode, prop_obj.nodeProperty);
                componentProperties = componentProperties || {};
                componentProperties[selectedComponentApiProperty] = componentProperties[selectedComponentApiProperty] || {};
                componentProperties[selectedComponentApiProperty] = {
                    instanceType: InstanceTypes.ApiProperty,
                    isHandler: prop_obj.isHandler,
                    apiProperty: prop_obj.nodeProperty
                };

                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: prop_obj.nodeProperty,
                    id: currentNode.id,
                    value: componentProperties
                });
            }
        });

    }
}

export default UIConnect(ComponentAPIMenu)
