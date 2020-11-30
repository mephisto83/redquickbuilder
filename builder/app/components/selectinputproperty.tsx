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
class SelectInputProperty extends Component<any, any> {
	render() {
		let { state, value, model, valueObj } = this.props;
		let currentNode = this.props.node;
		if (typeof valueObj === 'object') {
			value = valueObj;
		}
		return (
			<SelectInput
				onChange={(_value: string) => {
					var id = currentNode.id;
					this.props.graphOperation(REMOVE_LINK_BETWEEN_NODES, {
						target: GetNodeProp(currentNode, NodeProperties.LambdaInsertArguments),
						source: id
					});

					value[model] = _value;
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
				label={this.props.label}
				value={this.props.value}
				options={this.props.options}
			/>
		);
	}
}

export default UIConnect(SelectInputProperty);
