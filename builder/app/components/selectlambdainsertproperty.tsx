// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
import SelectInput from './selectinput';
import { UIConnect } from '../utils/utils';
import {
	REMOVE_LINK_BETWEEN_NODES,
	CHANGE_NODE_PROPERTY,
	ADD_LINK_BETWEEN_NODES,
	LinkProperties,
	GetNodeProp
} from '../actions/uiActions';
import { NodeProperties } from '../constants/nodetypes';
import { GraphNode } from 'webcola';
import { Node } from '../methods/graph_types';
class SelectLambdaInsertProperty extends Component<
	{
		valueKey: string;
		currentNode: any;
		options: any;
		value: any;
		title: any;
		type: string;
		node: Node;
		graphOperation: Function;
	},
	any
> {
	render() {
		let { value, type, valueKey } = this.props;
		let currentNode = this.props.node;

		return (
			<SelectInput
				onChange={(_value: string) => {
					var id = currentNode.id;
					this.props.graphOperation(REMOVE_LINK_BETWEEN_NODES, {
						target: GetNodeProp(currentNode, NodeProperties.LambdaInsertArguments),
						source: id
					});
					value[valueKey] = value[valueKey] || {};
					value[valueKey][type] = _value;
					this.props.graphOperation(CHANGE_NODE_PROPERTY, {
						prop: NodeProperties.LambdaInsertArguments,
						id,
						value: value
					});
					this.props.graphOperation(ADD_LINK_BETWEEN_NODES, {
						target: _value,
						source: id,
						properties: { ...LinkProperties.LambdaInsertArguments }
					});
				}}
				label={this.props.title}
				value={value && value[valueKey] ? value[valueKey][type] : null}
				options={this.props.options}
			/>
		);
	}
}

export default UIConnect(SelectLambdaInsertProperty);
