// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import SelectInput from './selectinput';
import TextInput from './textinput';
import { NodeProperties } from '../constants/nodetypes';

class ControllerActivityMenu extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Controller);
		var currentNode = active ? UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE)) : null;

		return (
			<TabPane active={active}>
				{currentNode ? (
					<SelectInput
						label={Titles.Maestros}
						options={UIA.NodesByType(state, UIA.NodeTypes.Maestro).map((funcKey) => {
							return {
								title: UIA.GetNodeTitle(funcKey),
								value: funcKey.id
							};
						})}
						defaultSelectText={Titles.AddMaestros}
						onChange={(value) => {
							let id = currentNode.id;
							this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
								target: value,
								source: id,
								properties: {
									...UIA.LinkProperties.MaestroLink
								}
							});
						}}
						value={''}
					/>
				) : null}
				{currentNode ? (
					<TextInput
						label={Titles.CodeUser}
						value={UIA.GetNodeProp(currentNode, NodeProperties.CodeUser)}
						onChange={(value) => {
							this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
								id: currentNode.id,
								value,
								prop: NodeProperties.CodeUser
							});
						}}
					/>
				) : null}
			</TabPane>
		);
	}
}

export default UIConnect(ControllerActivityMenu);
