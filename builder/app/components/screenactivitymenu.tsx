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
import ButtonList from './buttonlist';
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties, NodeProperties } from '../constants/nodetypes';
import { GetNode } from '../methods/graph_methods';
class ScreenActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Screen);
        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (currentNode) {
            var show_dependent = currentNode && currentNode.properties && currentNode.properties[UIA.NodeProperties.UseUIDependsOn];
            var use_model_as_type = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseModelAsType);
            var many_to_many_enabled = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexus);
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
                <ControlSideBarMenuHeader title={Titles.ScreenOptions} />
                <SelectInput
                    label={Titles.Priority}
                    options={[].interpolate(0, 10, x => x).map(t => ({ title: t, value: t }))}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Priority)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.Priority,
                            id: currentNode.id,
                            value
                        });
                    }} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_SCREEN_OPTIONS, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.ScreenOptionsLink }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddScreenOptions} description={Titles.AddScreenOptions} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(ScreenActivityMenu)
