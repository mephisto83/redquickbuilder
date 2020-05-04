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
import { ConditionTypes, ConditionFunctionSetups, ConditionTypeOptions, ConditionTypeParameters } from '../constants/functiontypes';
import CheckBox from './checkbox';
import TextInput from './textinput';
class ConditionActivityMenu extends Component<any, any> {
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
                <TextInput
                    label={Titles.NodeLabel}
                    value={UIA.GetNodeProp(currentNode, NodeProperties.UIText)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_TEXT, { id: currentNode.id, value })
                    }} />
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
                {this.getEnumeration({
                    conditionType,
                    graph,
                    model_options,
                    currentNode,
                    methods
                })}
                {this.getMatchReferenceProperty({
                    conditionType,
                    model_options,
                    currentNode,
                    methods,
                    graph
                })}
            </TabPane>
        );
    }

    getProperties(methodProps, temp, state, key = 'ref2') {
        let refId = methodProps[temp[key]];
        let properties = [];
        let nodeProperties = UIA.GetModelPropertyNodes(refId);
        let currentNode = UIA.GetNodeById(refId);
        if (nodeProperties) {
            properties = nodeProperties.toNodeSelect();
        }
        let logicalChildren = UIA.GetLogicalChildren(currentNode.id);
        properties = [...properties, ...logicalChildren.toNodeSelect()];
        return properties;
    }
    getEnumeration(options) {
        var {
            conditionType,
            model_options,
            graph,
            currentNode,
            methods,
        } = options;
        var { state } = this.props;
        var temp = UIA.GetNodeProp(currentNode, NodeProperties.EnumerationReference) || {};
        if (conditionType !== ConditionTypes.InEnumerable) {
            return [];
        }

        let methodProps = UIA.GetNodeProp(methods ? methods[0] : null, NodeProperties.MethodProps);
        var ref1_properties = [];
        var ref2_properties = [];
        var refManyToMany_properties = [];
        var permissionNode = GetLinkChain(state, {
            id: currentNode.id,
            links: [{
                type: LinkType.Condition,
                direction: TARGET
            }]
        })[0]
        var temp = UIA.GetNodeProp(currentNode, NodeProperties.EnumerationReference) || {
            ref1: GetNodeProp(permissionNode, UIA.NodeProperties.PermissionRequester)
        };
        if (temp.ref2) {
            ref2_properties = this.getProperties(methodProps, temp, state, 'ref2');
        }
        if (temp.ref1) {
            ref1_properties = this.getProperties(methodProps, temp, state, 'ref1');
        }

        if (temp[ConditionTypeParameters.RefManyToMany]) {
            refManyToMany_properties = this.getProperties(methodProps, temp, state, 'refManyToMany');
        }

        var enumeration = temp && temp[UIA.NodeProperties.Enumeration] ? temp[UIA.NodeProperties.Enumeration] : '';
        var allowed = (temp && temp[UIA.NodeProperties.AllowedEnumValues] ? temp[UIA.NodeProperties.AllowedEnumValues] : []);
        var disallowed = [];
        if (enumeration) {
            var enumerationNode = GetNode(graph, enumeration);
            if (enumerationNode) {
                var enumerationValues = UIA.GetNodeProp(enumerationNode, NodeProperties.Enumeration) || [];
                allowed = allowed.intersection(enumerationValues);
                disallowed = enumerationValues.relativeCompliment(allowed);
            }
        }

        let matchRef = { ...temp };
        var enumeration_nodes = UIA.NodesByType(state, UIA.NodeTypes.Enumeration).toNodeSelect();
        return [
            (
                <SelectInput
                    label={Titles.Reference}
                    options={model_options}
                    onChange={(value) => {
                        temp.ref1 = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.EnumerationReference,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef.ref1} />
            ),
            <SelectInput
                label={Titles.Property}
                options={ref1_properties}
                onChange={(value) => {
                    temp.ref1Property = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.EnumerationReference,
                        id: currentNode.id,
                        value: temp
                    });
                }}
                value={matchRef.ref1Property} />,
            currentNode ? (<SelectInput
                label={Titles.Enumeration}
                options={enumeration_nodes}
                key={`${currentNode.id}-enum`}
                onChange={(value) => {
                    var id = currentNode.id;
                    let target = temp[UIA.NodeProperties.Enumeration] || '';
                    temp[UIA.NodeProperties.Enumeration] = value;
                    this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                        target,
                        source: id,
                        linkType: UIA.LinkProperties.EnumerationReferenceLink.type
                    })

                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.EnumerationReference,
                        id,
                        value: temp
                    });
                    this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                        target: value,
                        source: id,
                        properties: { ...UIA.LinkProperties.EnumerationReferenceLink }
                    });
                }}
                value={temp[UIA.NodeProperties.Enumeration] || ''} />) : null,
            <ControlSideBarMenuHeader
                key={`${currentNode.id}-allowed-enum-title`} title={Titles.AllowedEnums} />,
            allowed && allowed.length ? allowed.map((_enum) => {
                return <div key={`allowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                    var disallowed = enumerationValues.relativeCompliment([...allowed].filter(x => x !== _enum));

                    temp[UIA.NodeProperties.AllowedEnumValues] = [...allowed].filter(x => x !== _enum);
                    temp[UIA.NodeProperties.DisallowedEnumValues] = disallowed;

                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.EnumerationReference,
                        id: currentNode.id,
                        value: temp
                    });
                }} > {_enum}</div>;
            }) : null,
            <ControlSideBarMenuHeader
                key={`${currentNode.id}-disalloweditem-title`} title={Titles.DisallowedEnums} />,
            disallowed && disallowed.length ? disallowed.map((_enum) => {
                return <div key={`disallowed-${_enum}`} className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {

                    var disallowed = enumerationValues.relativeCompliment([...allowed, _enum].unique());

                    temp[UIA.NodeProperties.AllowedEnumValues] = [...allowed, _enum].unique();
                    temp[UIA.NodeProperties.DisallowedEnumValues] = disallowed;

                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.EnumerationReference,
                        id: currentNode.id,
                        value: temp
                    });
                }} > {_enum}</div>;
            }) : null
        ]
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

        if (temp[ConditionTypeParameters.RefManyToMany]) {
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
                        temp[ConditionTypeParameters.RefManyToMany] = value;
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.MatchManyReferenceParameter,
                            id: currentNode.id,
                            value: temp
                        });
                    }}
                    value={matchRef[ConditionTypeParameters.RefManyToMany]} />
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
                        prop: UIA.NodeProperties.MatchManyReferenceParameter,
                        id: currentNode.id,
                        value: temp
                    });
                }} />) : null
        ].filter((x) => x).map((x, index) => {

            return x;
        });
    }

    getMatchReferenceProperty(options) {
        var {
            conditionType,
            model_options,
            currentNode,
            methods,
        } = options;
        if (conditionType !== ConditionTypes.MatchReference) {
            return null;
        }
        var { state } = this.props;
        var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};

        let methodProps = UIA.GetNodeProp(methods ? methods[0] : null, NodeProperties.MethodProps);
        var ref1_properties = [];
        var ref2_properties = [];
        var refManyToMany_properties = [];
        var propertyType = UIA.NodeProperties.MatchReference;

        if (temp.ref2) {
            ref2_properties = this.getProperties(methodProps, temp, state, 'ref2');
        }
        if (temp.ref1) {
            ref1_properties = this.getProperties(methodProps, temp, state, 'ref1');
        }

        if (temp[ConditionTypeParameters.RefManyToMany]) {
            refManyToMany_properties = this.getProperties(methodProps, temp, state, 'refManyToMany');
        }

        let matchRef = { ...temp };
        return [(
            <SelectInput
                label={Titles.Reference}
                options={model_options}
                onChange={(value) => {
                    var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                    temp.ref1 = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: propertyType,
                        id: currentNode.id,
                        value: temp
                    });
                }}
                value={matchRef.ref1} />
        ),
        matchRef.ref1 ? (
            <CheckBox
                label={Titles.UseId}
                value={matchRef.ref1UseId}
                onChange={(value) => {
                    var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                    temp.ref1UseId = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: propertyType,
                        id: currentNode.id,
                        value: temp
                    });
                }} />
        ) : null,
        matchRef.ref1 && !temp.ref1UseId ? (
            <SelectInput
                label={Titles.Property}
                options={ref1_properties}
                onChange={(value) => {
                    var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                    temp[ConditionTypeParameters.Ref1Property] = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: propertyType,
                        id: currentNode.id,
                        value: temp
                    });
                }}
                value={matchRef.ref1Property} />
        ) : null,
        (
            <SelectInput
                label={Titles.Reference}
                options={model_options}
                onChange={(value) => {
                    var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                    temp.ref2 = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: propertyType,
                        id: currentNode.id,
                        value: temp
                    });
                }}
                value={matchRef.ref2} />
        ),
        matchRef.ref2 ? (
            <CheckBox
                label={Titles.UseId}
                value={matchRef.ref2UseId}
                onChange={(value) => {
                    var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                    temp.ref2UseId = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: propertyType,
                        id: currentNode.id,
                        value: temp
                    });
                }} />
        ) : null,
        matchRef.ref2 && !temp.ref2UseId ? (
            <SelectInput
                label={Titles.Property}
                options={ref2_properties}
                onChange={(value) => {
                    var temp = UIA.GetNodeProp(currentNode, NodeProperties.MatchReference) || {};
                    temp.ref2Property = value;
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: propertyType,
                        id: currentNode.id,
                        value: temp
                    });
                }}
                value={matchRef.ref2Property} />
        ) : null
        ].filter(x => x)
    }
}

export default UIConnect(ConditionActivityMenu)
