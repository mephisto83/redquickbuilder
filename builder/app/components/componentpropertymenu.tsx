// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
import { ExcludeDefaultNode, NodeTypes, NodeProperties, MAIN_CONTENT, LAYOUT_VIEW, LinkProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { ComponentTypes, InstanceTypes } from '../constants/componenttypes';
import { GetConnectedNodeByType, CreateLayout, TARGET, createComponentProperties, addComponentProperty, hasComponentProperty, getComponentProperty, getComponentPropertyList, removeComponentProperty } from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import TextInput from './textinput';
import SideMenuContainer from './sidemenucontainer';
import ButtonList from './buttonlist';
import { SCOPE_TAB } from './dashboard';
class ComponentPropertyMenu extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }
    render() {
        var { state } = this.props;
        var active = [UIA.NodeTypes.ComponentNode, UIA.NodeTypes.ScreenOption].some(v => v === UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType));

        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
        let componentTypes = ComponentTypes[UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType)] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
        let models = UIA.NodesByType(state, NodeTypes.Model).toNodeSelect();
        let componentProps = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentProperties) || createComponentProperties();
        return (
            <SideMenuContainer active={active} tab={SCOPE_TAB} visual={"component-property-menu"} title={Titles.ComponentPropertyMenu}>
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
                    {componentType && componentTypes && componentTypes[componentType] ? (
                        <ControlSideBarMenu>
                            <ControlSideBarMenuItem onClick={() => {
                                if (this.state.modelType && this.state.modelProp) {

                                    if (hasComponentProperty(componentProps, this.state.modelProp)) {

                                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                            target: getComponentProperty(componentProps, this.state.modelProp),
                                            source: currentNode.id
                                        });
                                    }

                                    componentProps = addComponentProperty(componentProps, {
                                        instanceType: this.state.instanceType,
                                        modelType: this.state.modelType,
                                        modelProp: this.state.modelProp
                                    })
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
                            <ControlSideBarMenuItem onClick={() => {
                                if (this.state.modelType && this.state.modelProp) {

                                    if (hasComponentProperty(componentProps, this.state.modelProp)) {

                                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                            target: getComponentProperty(componentProps, this.state.modelProp),
                                            source: currentNode.id
                                        });
                                    }

                                    componentProps = removeComponentProperty(componentProps, { instanceType: this.state.instanceType, modelType: this.state.modelType, modelProp: this.state.modelProp })
                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        prop: UIA.NodeProperties.ComponentProperties,
                                        id: currentNode.id,
                                        value: componentProps
                                    });

                                }
                            }} icon={'fa fa-plus'} title={Titles.Remove} description={Titles.Remove} />
                        </ControlSideBarMenu>
                    ) : null}
                    <ButtonList active={true} isSelected={(item) => { return item.value === this.state.selectedItem; }}
                        items={getComponentPropertyList(UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentProperties))}
                        onClick={(item) => {
                            this.setState({
                                modelType: getComponentProperty(componentProps, item.value),
                                instanceType: getComponentProperty(componentProps, item.value, 'instanceTypes'),
                                modelProp: item.value,
                                selectedItem: item.value
                            })
                        }} />
                </TabPane>
            </SideMenuContainer>
        );
    }
}

export default UIConnect(ComponentPropertyMenu)
