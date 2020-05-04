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
    GetUIExentionKeyField
} from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';

class ValidatorItem extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Validator);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var validator;
        var validatorItem;
        if (currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ValidatorModel)) {
            validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator);
            validatorItem = validator.properties[this.props.property].validators[this.props.validator]
        }
        if (validatorItem) {
            if (validatorItem.arguments && validatorItem.arguments.reference) {
                var { types } = validatorItem.arguments.reference;
                if (types) {
                    let _nodes_types = UIA.NodesByType(state, types).filter(x => UIA.GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ExtensionType ? isUIExtensionEnumerable(x) : true);

                    var validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator) || createValidator();
                    let item = getValidatorItem(validator, { property: this.props.property, validator: this.props.validator });
                    let editlist = [];
                    if (item && item.node) {
                        let node = GetNode(graph, item.node);
                        switch (UIA.GetNodeProp(node, NodeProperties.NODEType)) {
                            case NodeTypes.Enumeration:
                                var enums = UIA.GetNodeProp(node, NodeProperties.Enumeration) || [];
                                editlist = enums.map((_enum) => {
                                    return <div className={`external-event ${item.enumeration && item.enumeration[_enum.id] ? 'bg-red' : 'bg-black'}`} style={{ cursor: 'pointer' }} onClick={() => {
                                        item.enumeration = item.enumeration || {};
                                        item.enumeration[_enum.id] = !item.enumeration[_enum.id];
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            id: currentNode.id,
                                            prop: NodeProperties.Validator,
                                            value: validator
                                        })
                                    }} > {_enum.value}</div>;
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
                                            prop: NodeProperties.Validator,
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
                                var validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator) || createValidator();
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
                                    prop: NodeProperties.Validator,
                                    value: validator
                                })
                                this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                    target: value,
                                    source: id,
                                    properties: {
                                        ...UIA.LinkProperties.ValidatorModelItemLink,
                                        ...createEventProp(LinkEvents.Remove, {
                                            property: this.props.property,
                                            validator: this.props.validator,
                                            function: 'OnRemoveValidationItemPropConnection',
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
            return (<div>item</div>)
        }


        return (
            <div></div>
        );
    }
}

export default UIConnect(ValidatorItem)
