// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';

class FunctionActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Function);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var agent_nodes = UIA.NodesByType(state, UIA.NodeTypes.Model).filter(x => UIA.GetNodeProp(x, UIA.NodeProperties.IsAgent)).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        var ceremony_types  = [];
        return (
            <TabPane active={active}>
                {/* {currentNode ? (<FormControl>
                    <CheckBox
                        label={Titles.IsAgent}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.IsAgent] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.IsAgent,
                                id: currentNode.id,
                                value
                            });
                        }} />
                </FormControl>) : null} */}

                {currentNode ? (<SelectInput
                    label={Titles.AgentOperator}
                    options={agent_nodes}
                    onChange={(value) => {
                        var id = currentNode.id;
                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                            target: currentNode.properties[UIA.NodeProperties.UIExtension],
                            source: id
                        })
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UIExtension,
                            id: currentNode.id,
                            value
                        });
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: { ...UIA.LinkProperties.FunctionOperator }
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIPermissions] : ''} />) : null}
                {currentNode ? (<SelectInput
                    label={Titles.CeromonyType}
                    options={ceremony_types}
                    onChange={(value) => {
                        var id = currentNode.id;
                        // this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                        //     target: currentNode.properties[UIA.NodeProperties.UIExtension],
                        //     source: id
                        // })
                        // this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        //     prop: UIA.NodeProperties.UIExtension,
                        //     id: currentNode.id,
                        //     value
                        // });
                        // this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                        //     target: value,
                        //     source: id,
                        //     properties: { ...UIA.LinkProperties.FunctionOperator }
                        // });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIPermissions] : ''} />) : null}
                <ControlSideBarMenu>
                    {currentNode ? (<ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_PARAMETER_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE)
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddParameter} description={Titles.AddParameterDescription} />) : null}
                    {currentNode ? (<ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_FUNCTION_OUTPUT_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE)
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddFunctionOutput} description={Titles.AddFunctionOutputDescription} />) : null}
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(FunctionActivityMenu)