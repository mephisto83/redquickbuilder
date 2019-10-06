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
                    {currentNode ? (<FormControl>
                        <TextInput
                            label={Titles.Property}
                            value={this.state.modelProp}
                            onChange={(value) => {
                                this.setState({ modelProp: value });
                            }} />
                    </FormControl>) : null}
                    {componentType && componentTypes && componentTypes[componentType] && componentTypes[componentType] ? (
                        <ControlSideBarMenu>
                            <ControlSideBarMenuItem onClick={() => {
                                if (this.state.modelProp) {
                                    componentProps = addComponentApi(componentProps, {
                                        modelProp: this.state.modelProp
                                    })
                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        prop: UIA.NodeProperties.ComponentApi,
                                        id: currentNode.id,
                                        value: componentProps
                                    });
                                }
                            }} icon={'fa fa-plus'} title={Titles.Add} description={Titles.Add} />
                            <ControlSideBarMenuItem onClick={() => {
                                if (this.state.modelProp) {
                                    componentProps = removeComponentApi(componentProps, { modelProp: this.state.modelProp })
                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        prop: UIA.NodeProperties.ComponentApi,
                                        id: currentNode.id,
                                        value: componentProps
                                    });

                                }
                            }} icon={'fa fa-plus'} title={Titles.Remove} description={Titles.Remove} />
                            {componentTypes[componentType] && componentTypes[componentType].defaultApi ? <ControlSideBarMenuItem onClick={() => {
                                componentTypes[componentType].defaultApi.map(x => {
                                    componentProps = addComponentApi(componentProps, {
                                        modelProp: x.property
                                    })

                                })
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: UIA.NodeProperties.ComponentApi,
                                    id: currentNode.id,
                                    value: componentProps
                                });
                            }} icon={'fa fa-plus'} title={Titles.AddDefaults} description={Titles.AddDefaults} /> : null}
                        </ControlSideBarMenu>
                    ) : null}
                    <ButtonList active={true} isSelected={(item) => { return item.value === this.state.selectedItem; }}
                        items={getComponentPropertyList(UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentApi))}
                        onClick={(item) => {
                            this.setState({
                                modelProp: item.value,
                                selectedItem: item.value
                            })
                        }} />
                </TabPane>
            </SideMenuContainer>
        );
    }
}

export default UIConnect(ComponentAPIMenu)