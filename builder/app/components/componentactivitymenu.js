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
import { ComponentTypes } from '../constants/componenttypes';
import { GetConnectedNodeByType, CreateLayout, TARGET } from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
class ComponentActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var active = UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) === UIA.NodeTypes.ComponentNode;
        let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
        let componentTypes = ComponentTypes[UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType)] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
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
                    </ControlSideBarMenu>
                ) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ComponentActivityMenu)