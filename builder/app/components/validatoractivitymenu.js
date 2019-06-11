// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties } from '../constants/nodetypes';

class ValidatorActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Validator);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var modelNodes = UIA.NodesByType(state, UIA.NodeTypes.Model).map(t => {
            return {
                title: UIA.GetNodeTitle(t),
                value: t.id
            }
        });

        var functionNodes = UIA.NodesByType(state, UIA.NodeTypes.Function).map(t => {
            return {
                title: UIA.GetNodeTitle(t),
                value: t.id
            }
        });
        var agents = UIA.NodesByType(state, UIA.NodeTypes.Model)
            .filter(x => UIA.GetNodeProp(x, NodeProperties.IsAgent))
            .map(t => {
                return {
                    title: UIA.GetNodeTitle(t),
                    value: t.id
                }
            });
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <SelectInput
                        options={modelNodes}
                        label={Titles.Models}
                        onChange={(value) => {

                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.ValidatorModel],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ValidatorModel,
                                id: currentNode.id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ValidatorModelLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.ValidatorModel] : ''} />
                    <SelectInput
                        options={agents}
                        label={Titles.Agents}
                        onChange={(value) => {

                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.ValidatorAgent],
                                source: id
                            });

                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ValidatorAgent,
                                id: currentNode.id,
                                value
                            });

                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ValidatorAgentLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.ValidatorAgent] : ''} />
                    <SelectInput
                        options={functionNodes}
                        label={Titles.Functions}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.ValidatorFunction],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ValidatorFunction,
                                id: currentNode.id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ValidatorFunctionLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.ValidatorFunction] : ''} />
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ValidatorActivityMenu)