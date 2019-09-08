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
import { GetConnectedNodeByType, CreateLayout, TARGET, createComponentProperties, addComponentProperty, hasComponentProperty, getComponentProperty, getComponentPropertyList } from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import TextInput from './textinput';
import ButtonList from './buttonlist';
class ComponentPropertyMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var active = UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) === UIA.NodeTypes.ComponentNode;
        let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
        let componentTypes = ComponentTypes[UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType)] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
        let models = UIA.NodesByType(state, NodeTypes.Model).toNodeSelect();
        let componentProps = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentProperties) || createComponentProperties();
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <SelectInput
                        label={Titles.Models}
                        options={models}
                        value={this.state.modelType}
                        onChange={(value) => {
                            this.setState({ modelType: value })
                        }} />
                    <TextInput
                        label={Titles.Property}
                        value={this.state.modelProp}
                        onChange={(value) => {
                            this.setState({ modelProp: value });
                        }} />
                    <SelectInput
                        label={Titles.InstanceType}
                        value={this.state.instanceType}
                        options={Object.keys(InstanceTypes).map(t => ({ title: t, value: InstanceTypes[t] }))}
                        onChange={(value) => {
                            this.setState({ instanceType: value });
                        }} />
                </FormControl>) : null}
                {componentType && componentTypes && componentTypes[componentType] && componentTypes[componentType].layout ? (
                    <ControlSideBarMenu>
                        <ControlSideBarMenuItem onClick={() => {
                            if (this.state.modelType && this.state.modelProp) {

                                if (hasComponentProperty(componentProps, this.state.modelProp)) {

                                    this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                        target: getComponentProperty(componentProps, this.state.modelProp),
                                        source: currentNode.id
                                    });
                                }

                                componentProps = addComponentProperty(componentProps, { instanceType: this.state.instanceType, modelType: this.state.modelType, modelProp: this.state.modelProp })
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: UIA.NodeProperties.ComponentProperties,
                                    id: currentNode.id,
                                    value: componentProps
                                });
                                this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                    target: this.state.modelType,
                                    source: currentNode.id,
                                    properties: {
                                        ...UIA.LinkProperties.ComponentPropertyLink
                                    }
                                })
                            }
                        }} icon={'fa fa-plus'} title={Titles.Add} description={Titles.Add} />
                    </ControlSideBarMenu>
                ) : null}
                <ButtonList active={true} isSelected={(item) => { return item.id === this.state.selectedItem; }}
                    items={getComponentPropertyList(UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentProperties))}
                    onClick={(item) => {
                        this.setState({
                            modelType: getComponentProperty(componentProps, item.id),
                            instanceType: getComponentProperty(componentProps, item.id, 'instanceTypes'),
                            modelProp: item.id,
                            selectedItem: item.id
                        })
                    }} />
            </TabPane>
        );
    }
}

export default UIConnect(ComponentPropertyMenu)