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
import CheckBox from './checkbox';
class PropertyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Property);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (currentNode) {
            var show_dependent = currentNode && currentNode.properties && currentNode.properties[UIA.NodeProperties.UseUIDependsOn];;
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
                    <SelectInput
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
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIAttributeType] : ''} />
                </FormControl>) : null}
                <ControlSideBarMenuHeader title={Titles.ModelActions} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_ATTRIBUTE_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE)
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddAttribute} description={Titles.AddAttributeDescription} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(PropertyActivityMenu)