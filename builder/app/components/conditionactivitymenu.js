// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import { LinkType, NodeProperties, NodeTypes } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { TARGET, GetLinkChain, SOURCE, GetNode } from '../methods/graph_methods';
import { ConditionTypes, ConditionFunctionSetups, ConditionTypeOptions } from '../constants/functiontypes';
import CheckBox from './checkbox';
class ConditionActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Condition);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var conditionType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ConditionType);
        var graph = UIA.GetCurrentGraph(state);
        var methods = currentNode ? GetLinkChain(state, {
            id: currentNode.id,
            links: [{
                type: LinkType.Condition,
                direction: TARGET
            }, {
                type: LinkType.FunctionOperator,
                direction: TARGET
            }]
        }) : [];
        let ref2_properties = [];
        let ref1_properties = [];
        let matchRef = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
        var model_options = [];
        var functions = methods.map(x => UIA.GetNodeProp(x, NodeProperties.FunctionType)).filter(x => x);
        if (ConditionFunctionSetups[conditionType] && ConditionFunctionSetups[conditionType].functions && functions && functions.length === 1) {
            let { constraints } = ConditionFunctionSetups[conditionType].functions[functions[0]];
            if (constraints) {
                let methodProps = UIA.GetNodeProp(methods[0], NodeProperties.MethodProps);
                model_options = Object.keys(constraints).filter(t => constraints[t].nodeTypes.indexOf(NodeTypes.Model) !== -1)
                    .map(x => {
                        if (methodProps && methodProps[x]) {
                            return {
                                title: `${UIA.GetNodeProp(GetNode(graph, methodProps[x]), NodeProperties.UIText) || x}(${x})`,
                                value: x
                            }
                        }
                        return {
                            title: x,
                            value: x
                        }
                    });

                if (methodProps) {

                    var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                    if (temp.ref2) {
                        ref2_properties = this.getProperties(methodProps, temp, state, 'ref2');
                    }
                    if (temp.ref1) {
                        ref1_properties = this.getProperties(methodProps, temp, state, 'ref1');
                    }
                }
            }
        }
        return (
            <TabPane active={active}>
                <SelectInput
                    label={Titles.ConditionType}
                    options={Object.keys(ConditionTypes).map(t => ({ title: t, value: ConditionTypes[t] }))}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.ConditionType,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={conditionType} />
                {this.getMatchManyReferenceProperty({
                    conditionType,
                    model_options,
                    currentNode,
                    methods
                })}
                {conditionType == ConditionTypes.MatchReference ? (
                    <SelectInput
                        label={Titles.Reference}
                        options={model_options}
                        onChange={(value) => {
                            var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                            temp.ref1 = value;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.MatchReference,
                                id: currentNode.id,
                                value: temp
                            });
                        }}
                        value={matchRef.ref1} />
                ) : null}
                {matchRef.ref1 && conditionType == ConditionTypes.MatchReference ? (
                    <CheckBox
                        label={Titles.UseId}
                        value={matchRef.ref1UseId}
                        onChange={(value) => {
                            var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                            temp.ref1UseId = value;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.MatchReference,
                                id: currentNode.id,
                                value: temp
                            });
                        }} />
                ) : null}
                {matchRef.ref1 && !temp.ref1UseId && conditionType == ConditionTypes.MatchReference ? (
                    <SelectInput
                        label={Titles.Property}
                        options={ref1_properties}
                        onChange={(value) => {
                            var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                            temp.ref1Property = value;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.MatchReference,
                                id: currentNode.id,
                                value: temp
                            });
                        }}
                        value={matchRef.ref1Property} />
                ) : null}
                {conditionType == ConditionTypes.MatchReference ? (
                    <SelectInput
                        label={Titles.Reference}
                        options={model_options}
                        onChange={(value) => {
                            var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                            temp.ref2 = value;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.MatchReference,
                                id: currentNode.id,
                                value: temp
                            });
                        }}
                        value={matchRef.ref2} />
                ) : null}
                {matchRef.ref2 && conditionType == ConditionTypes.MatchReference ? (
                    <CheckBox
                        label={Titles.UseId}
                        value={matchRef.ref2UseId}
                        onChange={(value) => {
                            var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                            temp.ref2UseId = value;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.MatchReference,
                                id: currentNode.id,
                                value: temp
                            });
                        }} />
                ) : null}
                {matchRef.ref2 && !temp.ref2UseId && conditionType == ConditionTypes.MatchReference ? (
                    <SelectInput
                        label={Titles.Property}
                        options={ref2_properties}
                        onChange={(value) => {
                            var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                            temp.ref2Property = value;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.MatchReference,
                                id: currentNode.id,
                                value: temp
                            });
                        }}
                        value={matchRef.ref2Property} />
                ) : null}
            </TabPane>
        );
    }

    getProperties(methodProps, temp, state, key = 'ref2') {
        let refId = methodProps[temp[key]];
        let properties = [];
        let nodeProperties = GetLinkChain(state, {
            id: refId,
            links: [{
                type: LinkType.PropertyLink,
                direction: SOURCE
            }]
        });
        if (nodeProperties) {
            properties = nodeProperties.toNodeSelect();
        }
        return properties;
    }


    getMatchManyReferenceProperty(options) {
        var {
            conditionType,
            model_options,
            currentNode,
            methods,
        } = options;
        var { state } = this.props;
        var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchManyReferenceParameter) || {};


        let methodProps = UIA.GetNodeProp(methods ? methods[0] : null, NodeProperties.MethodProps);
        var ref1_properties = [];
        var ref2_properties = [];
        var refManyToMany_properties = [];

        var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchManyReferenceParameter) || {};
        if (temp.ref2) {
            ref2_properties = this.getProperties(methodProps, temp, state, 'ref2');
        }
        if (temp.ref1) {
            ref1_properties = this.getProperties(methodProps, temp, state, 'ref1');
        }

        if (temp.refManyToMany) {
            refManyToMany_properties = this.getProperties(methodProps, temp, state, 'refManyToMany');
        }

        let matchRef = { ...temp };
        return [
            conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <SelectInput
                    label={Titles.Reference}
                    options={model_options}
                    onChange={(value) => {
                        temp.ref1 = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef.ref1} />
            ) : null,
            matchRef.ref1 && conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <CheckBox
                    label={Titles.UseId}
                    value={matchRef.ref1UseId}
                    onChange={(value) => {
                        temp.ref1UseId = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }} />
            ) : null,
            matchRef.ref1 && !temp.ref1UseId && conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <SelectInput
                    label={Titles.Property}
                    options={ref1_properties}
                    onChange={(value) => {
                        temp.ref1Property = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef.ref1Property} />
            ) : null,
            conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <SelectInput
                    label={Titles.Reference}
                    options={model_options}
                    onChange={(value) => {
                        temp.ref2 = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef.ref2} />
            ) : null,
            matchRef.ref2 && conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <CheckBox
                    label={Titles.UseId}
                    value={matchRef.ref2UseId}
                    onChange={(value) => {
                        temp.ref2UseId = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }} />
            ) : null,
            matchRef.ref2 && !temp.ref2UseId && conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <SelectInput
                    label={Titles.Property}
                    options={ref2_properties}
                    onChange={(value) => {
                        temp.ref2Property = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef.ref2Property} />
            ) : null,
            matchRef.ref1 && matchRef.ref2 && conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <SelectInput
                    label={Titles.ManyToManyNexus}
                    options={model_options}
                    onChange={(value) => {
                        temp.refManyToMany = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef.refManyToMany} />
            ) : null,
            matchRef.ref2 && conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <CheckBox
                    label={Titles.ManyToManyExists}
                    value={matchRef.refManyToManyExists}
                    onChange={(value) => {
                        temp.refManyToManyExists = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }} />
            ) : null,
            matchRef.ref1 && matchRef.ref2 && conditionType == ConditionTypes.MatchManyReferenceParameter ? (
                <SelectInput
                    label={Titles.Property}
                    options={refManyToMany_properties}
                    onChange={(value) => {
                        temp.refManyToManyProperty = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef.refManyToManyProperty} />
            ) : null,
            matchRef.refManyToManyProperty && matchRef.ref1 && matchRef.ref2 && conditionType == ConditionTypes.MatchManyReferenceParameter ? (<SelectInput
                title={Titles.Condition}
                label={Titles.Condition}
                options={[...Object.keys(ConditionTypeOptions)].map(t => ({ title: t, value: t }))}
                value={matchRef.refManyToManyCondition}
                onChange={(value) => {
                    temp.refManyToManyCondition = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.IsEqualTo,
                        id: currentNode.id,
                        value
                    });
                }} />) : null
        ].filter((x) => x).map((x, index) => {

            return x;
        });
    }
}

export default UIConnect(ConditionActivityMenu)