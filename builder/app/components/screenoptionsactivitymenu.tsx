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
import { NodeTypes, LinkProperties, NodeProperties, UITypes, MAIN_CONTENT, MIND_MAP, LAYOUT_VIEW } from '../constants/nodetypes';
import { GetNode, CreateLayout } from '../methods/graph_methods';
import { ComponentTypes } from '../constants/componenttypes';
class ScreenOptionsActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ScreenOption);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (currentNode) {

        }
        let componentTypes = ComponentTypes[UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType)] || {};
        let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
        return (
            <TabPane active={active}>
                <ControlSideBarMenuHeader title={Titles.ScreenOptions} />
                <SelectInput
                    label={Titles.UIType}
                    options={Object.keys(UITypes).map(t => ({ title: t, value: t }))}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UIType,
                            id: currentNode.id,
                            value: value
                        });
                    }}

                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType)} />

                <CheckBox
                    label={Titles.EnableMenu}
                    value={UIA.GetNodeProp(currentNode, NodeProperties.EnabledMenu)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.EnabledMenu,
                            id: currentNode.id,
                            value
                        });
                    }} />

                <SelectInput label={Titles.AddComponentDidMount}
                    options={UIA.NodesByType(state, UIA.NodeTypes.Method).toNodeSelect()}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentDidMountEvent)}
                    onChange={(value) => {
                        var id = currentNode.id;
                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                            target: currentNode.properties[UIA.NodeProperties.UIChoiceType],
                            source: id
                        })

                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.ComponentDidMountEvent,
                            id: currentNode.id,
                            value: [value, ...(UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentDidMountEvent) || [])].unique()
                        });
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: {}
                        });
                    }} />
                <ButtonList active={true} isSelected={(item) => {
                    var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentDidMountEvent) || [];
                    return item && types.some(x => x === item.id);
                }}
                    items={(UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentDidMountEvent) || []).map(t => {
                        return GetNode(UIA.GetCurrentGraph(state), t);
                    }).toNodeSelect()}
                    onClick={(item) => {
                        let id = currentNode.id;
                        var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentDidMountEvent) || [];
                        var ids = types;
                        if (types.some(t => item.id === t)) {
                            ids = [...ids.filter(t => t !== item.id)].unique(x => x)
                        }
                        else {
                            ids = [...ids, item.id].unique(x => x)
                        }
                        this.props.graphOperation([{
                            operation: UIA.CHANGE_NODE_PROPERTY,
                            options: {
                                prop: UIA.NodeProperties.ComponentDidMountEvent,
                                id: currentNode.id,
                                value: ids
                            }
                        }, {
                            operation: UIA.REMOVE_LINK_BETWEEN_NODES,
                            options: {
                                target: item.id,
                                source: id
                            }
                        }]);
                    }} />

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
            </TabPane>
        );
    }
}

export default UIConnect(ScreenOptionsActivityMenu)
