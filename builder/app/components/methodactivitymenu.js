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
import { Functions, HTTP_METHODS, MethodFunctions } from '../constants/functiontypes';
import { NodeProperties, Methods, LinkProperties } from '../constants/nodetypes';

class MethodActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Method);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        var function_types = Object.keys(MethodFunctions).map(funcKey => {
            return {
                title: MethodFunctions[funcKey].title || funcKey,
                value: funcKey
            }
        })
        return (
            <TabPane active={active}>
                {currentNode && !currentNode.properties[UIA.NodeProperties.UseScopeGraph] ? (<SelectInput
                    label={Titles.FunctionTypes}
                    options={function_types}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.FunctionType,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.FunctionType] : ''} />) : null}
                {currentNode ? (<SelectInput
                    label={Titles.Methods}
                    options={Object.keys(Methods).map(t => ({ title: t, value: Methods[t] }))}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MethodType,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.MethodType] : ''} />) : null}
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
                {currentNode ? (<CheckBox
                    label={Titles.NotIncludeInController}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.NotIncludedInController,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.NotIncludedInController)} />) : null}
                {currentNode ? (<CheckBox
                    label={Titles.AsForm}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AsForm,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.AsForm)} />) : null}
                {currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.AsForm) ? (<CheckBox
                    label={Titles.CollectCookies}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.CollectCookies,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.CollectCookies)} />) : null}
                {currentNode ? (<CheckBox
                    label={Titles.AsText}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.AsText,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.AsText)} />) : null}
                {currentNode ? (<CheckBox
                    label={Titles.NoApiPrefix}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.NoApiPrefix,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.NoApiPrefix)} />) : null}
                <ControlSideBarMenu>
                    {currentNode && currentNode.properties[UIA.NodeProperties.UseScopeGraph] ? (<ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation([{ operation: UIA.ESTABLISH_SCOPE }, { options: { id: currentNode.id } }])
                    }} icon={'fa fa-puzzle-piece'} title={Titles.CustomFunction} description={Titles.CustomFunctionDescription} />) : null}
                    {currentNode ? (<ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_MODEL_ITEM_FILTER, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.ModelItemFilter }
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddModelItemFilter} description={Titles.AddModelItemFilterDescription} />) : null}
                    {currentNode ? (<ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_AFTER_METHOD, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.AfterMethod }
                            },
                            properties: {
                                [NodeProperties.UIText]: `${UIA.GetNodeProp(currentNode, NodeProperties.UIText)} After Effect`
                            }
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddAfterMethods} description={Titles.AddAfterMethodsDescription} />) : null}

                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(MethodActivityMenu)