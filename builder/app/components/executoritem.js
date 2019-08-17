// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import EnumerationEditMenu from './enumerationeditmenu';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties, NodeTypes, LinkEvents, LinkType } from '../constants/nodetypes';
import {
    getNodesByLinkType,
    SOURCE,
    createValidator,
    addValidatator,
    TARGET,
    createEventProp,
    GetNode,
    getValidatorItem,
    isUIExtensionEnumerable,
    GetUIExentionEnumeration,
    GetUIExentionKeyField,
    GetLinkChainFromGraph,
    GetMethodNode
} from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';

class ExecutorItem extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Executor);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var validator;
        var validatorItem;
        var function_variables = [];
        if (currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel)) {
            validator = UIA.GetNodeProp(currentNode, NodeProperties.Executor);
            validatorItem = validator.properties[this.props.property].validators[this.props.validator]
        }
        else if (currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ModelItemFilter)) {
            validator = UIA.GetNodeProp(currentNode, NodeProperties.FilterModel);
            validatorItem = validator.properties[this.props.property].validators[this.props.validator];
            var methods = GetLinkChainFromGraph(graph, {
                id: currentNode.id,
                links: [{
                    direction: TARGET,
                    type: LinkType.ModelItemFilter
                }]
            }, [NodeTypes.Method]);
            if (methods && methods.length) {
                var props = UIA.GetMethodProps(methods[0]);
                let filterParameters = UIA.GetMethodFilterParameters(currentNode.id);
                if (filterParameters && filterParameters.length) {
                    function_variables = filterParameters;
                }
                else if (props) {
                    function_variables = Object.keys(props).map(t => ({ title: t, value: t }));
                }
            }
        }
        if (validatorItem) {
            if (validatorItem.arguments && validatorItem.arguments.reference) {
                var { types } = validatorItem.arguments.reference;
                if (types) {
                    let _nodes_types = UIA.NodesByType(state, types).filter(x => UIA.GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ExtensionType ? isUIExtensionEnumerable(x) : true);

                    var validator = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
                    let item = getValidatorItem(validator, { property: this.props.property, validator: this.props.validator });
                    let editlist = [];
                    if (item && item.node) {
                        let node = GetNode(graph, item.node);
                        switch (UIA.GetNodeProp(node, NodeProperties.NODEType)) {
                            case NodeTypes.Enumeration:
                                var enums = UIA.GetNodeProp(node, NodeProperties.Enumeration) || [];
                                editlist = enums.map((_enum) => {
                                    return <div className={`external-event ${item.enumeration && item.enumeration[_enum] ? 'bg-red' : 'bg-black'}`} style={{ cursor: 'pointer' }} onClick={() => {
                                        item.enumeration = item.enumeration || {};
                                        item.enumeration[_enum] = !item.enumeration[_enum];
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            id: currentNode.id,
                                            prop: NodeProperties.Executor,
                                            value: validator
                                        })
                                    }} > {_enum}</div>;
                                });
                                break;
                            case NodeTypes.ExtensionType:
                                var list_enums = GetUIExentionEnumeration(node);
                                var list_key_field = GetUIExentionKeyField(node);
                                editlist = list_enums.map((_enum) => {
                                    return <div className={`external-event ${item.extension && item.extension[_enum[list_key_field]] ? 'bg-red' : 'bg-black'}`} style={{ cursor: 'pointer' }} onClick={() => {
                                        item.extension = item.extension || {};
                                        item.extension[_enum[list_key_field]] = !item.extension[_enum[list_key_field]];
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            id: currentNode.id,
                                            prop: NodeProperties.Executor,
                                            value: validator
                                        })
                                    }} > {_enum[list_key_field]}</div>;
                                });
                                break;
                        }
                    }
                    let formControll = (<FormControl>
                        <SelectInput
                            options={_nodes_types.map(t => ({
                                title: UIA.GetNodeTitle(t), value: t.id
                            }))}
                            defaultSelectText={Titles.NodeType}
                            label={Titles.Property}
                            onChange={(value) => {
                                var id = currentNode.id;
                                var validator = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
                                let item = getValidatorItem(validator, { property: this.props.property, validator: this.props.validator });
                                let old_one = item.node;
                                item.node = value;
                                if (old_one) {
                                    this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                        target: old_one,
                                        source: id,
                                    });
                                }
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    id,
                                    prop: NodeProperties.Executor,
                                    value: validator
                                })
                                this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                    target: value,
                                    source: id,
                                    properties: {
                                        ...UIA.LinkProperties.ExecutorModelItemLink,
                                        ...createEventProp(LinkEvents.Remove, {
                                            property: this.props.property,
                                            validator: this.props.validator,
                                            function: 'OnRemoveExecutorItemPropConnection',
                                            node: item.node
                                        })
                                    }
                                });
                            }}
                            value={validatorItem ? validatorItem.node : ''} />
                        {editlist}
                    </FormControl>);

                    return formControll
                }
                return (<div>reference</div>)
            }
            else if (validatorItem.arguments && validatorItem.arguments.method_reference) {
                return this.getMethodReferenceItem(validator, validatorItem);
            }
            else if (validatorItem.arguments && validatorItem.arguments.functionvariables) {
                let functionVariableControl = (<FormControl>
                    <SelectInput
                        options={function_variables}
                        label={Titles.FunctionVariables}
                        onChange={(value) => {
                            var id = currentNode.id;
                            var validator = UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) || createValidator();
                            let item = getValidatorItem(validator, { property: this.props.property, validator: this.props.validator });
                            let old_one = item.node;
                            item.node = value;

                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                id,
                                prop: NodeProperties.FilterModel,
                                value: validator
                            })

                        }}
                        value={validatorItem ? validatorItem.node : ''} />
                </FormControl>);

                return functionVariableControl
            }
            else if (validatorItem.arguments && validatorItem.arguments.modelproperty) {
                let modelParameters = UIA.GetMethodFilterParameters(currentNode.id);
                let node_value = validatorItem ? validatorItem.node : '';
                let nodeProperty = validatorItem ? validatorItem.nodeProperty : '';
                let properties = [];
                if (node_value) {
                    let node_ref = UIA.GetMethodsProperty(currentNode.id, node_value);
                    if (node_ref) {
                        properties = UIA.GetModelPropertyChildren(node_ref).toNodeSelect();
                    }
                }
                let functionVariableControl = (<FormControl>
                    <SelectInput
                        options={modelParameters}
                        label={Titles.FunctionVariables}
                        onChange={(value) => {
                            var id = currentNode.id;
                            var validator = UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) || createValidator();
                            let item = getValidatorItem(validator, { property: this.props.property, validator: this.props.validator });
                            item.node = value;

                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                id,
                                prop: NodeProperties.FilterModel,
                                value: validator
                            })

                        }}
                        value={node_value} />
                    <SelectInput
                        options={properties}
                        label={Titles.Property}
                        onChange={(value) => {
                            var id = currentNode.id;
                            var validator = UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) || createValidator();
                            let item = getValidatorItem(validator, { property: this.props.property, validator: this.props.validator });
                            item.nodeProperty = value;

                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                id,
                                prop: NodeProperties.FilterModel,
                                value: validator
                            })

                        }}
                        value={nodeProperty} />
                </FormControl>);

                return functionVariableControl
            }
            return (<div>item</div>)
        }


        return (
            <div></div>
        );
    }

    getMethodReferenceItem(validator, validatorItem) {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        let methodNode = GetMethodNode(state, currentNode.id, LinkType.ExecutorFunction);
        let methodNodeProperties = UIA.GetMethodProps(methodNode);
        if (validatorItem.arguments && validatorItem.arguments.method_reference) {
            return Object.keys(validatorItem.arguments.method_reference).map(ref => {
                var validator = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
                let editlist = [];
                let options = UIA.GetMethodNodeSelectOptions(methodNodeProperties);
                let formControll = (<FormControl key={ref}>
                    <SelectInput
                        options={options}
                        defaultSelectText={Titles.NodeType}
                        label={Titles.Property}
                        onChange={(value) => {
                            var id = currentNode.id;
                            var validator = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
                            let item = getValidatorItem(validator, { property: this.props.property, validator: this.props.validator });
                            item.references = item.references || {};
                            item.references[ref] = value;

                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                id,
                                prop: NodeProperties.Executor,
                                value: validator
                            })

                        }}
                        value={validatorItem && validatorItem.references ? validatorItem.references[ref] : ''} />
                    {editlist}
                </FormControl>);

                return formControll
            });
        }
        return (<div>reference</div>)
    }
}

export default UIConnect(ExecutorItem)