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
import TextInput from './textinput';
import { Functions, HTTP_METHODS } from '../constants/functiontypes';
import { NodeProperties } from '../constants/nodetypes';

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
        var function_types = Object.keys(Functions).map(funcKey => {
            return {
                title: Functions[funcKey].title || funcKey,
                value: funcKey
            }
        })
        return (
            <TabPane active={active}>
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
                {currentNode ? (<CheckBox
                    label={Titles.CustomFunction}
                    title={Titles.CustomFunctionDescription}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseScopeGraph] : ''}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UseScopeGraph,
                            id: currentNode.id,
                            value: value
                        });
                    }} />) : null}
                {currentNode && !currentNode.properties[UIA.NodeProperties.UseScopeGraph] ? (<SelectInput
                    label={Titles.FunctionTypes}
                    options={function_types}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.FunctionType,
                            id: currentNode.id,
                            value
                        });
                        this.props.graphOperation(UIA.APPLY_FUNCTION_CONSTRAINTS, {
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.FunctionType] : ''} />) : null}

                {currentNode ? (<SelectInput
                    label={Titles.HttpMethod}
                    options={Object.keys(HTTP_METHODS).map(t => ({ title: t, value: HTTP_METHODS[t] }))}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            id: currentNode.id,
                            value,
                            prop: NodeProperties.HttpMethod
                        })
                    }}
                    value={UIA.GetNodeProp(currentNode, NodeProperties.HttpMethod)} />) : null}
                {currentNode ? (<TextInput
                    label={Titles.HttpRoute}
                    value={UIA.GetNodeProp(currentNode, NodeProperties.HttpRoute)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            id: currentNode.id,
                            value,
                            prop: NodeProperties.HttpRoute
                        })
                    }} />) : null}
                <ControlSideBarMenu>
                    {currentNode && currentNode.properties[UIA.NodeProperties.UseScopeGraph] ? (<ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation([{ operation: UIA.ESTABLISH_SCOPE }, { options: { id: currentNode.id } }])
                    }} icon={'fa fa-puzzle-piece'} title={Titles.CustomFunction} description={Titles.CustomFunctionDescription} />) : null}
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