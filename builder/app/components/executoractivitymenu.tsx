// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties, Methods } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';

class ExecutorActivityMenu extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Executor);
		if (!active) {
			return <div />;
		}
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		var modelNodes = UIA.NodesByType(state, UIA.NodeTypes.Model).toNodeSelect();
		var functionNodes = UIA.NodesByType(state, [ UIA.NodeTypes.Function, UIA.NodeTypes.Method ]).toNodeSelect();
		var agents = UIA.NodesByType(state, UIA.NodeTypes.Model)
			.filter((x: Node) => UIA.GetNodeProp(x, NodeProperties.IsAgent))
			.toNodeSelect();
		return (
			<TabPane active={active}>
				{currentNode ? (
					<FormControl>
						<SelectInput
							options={Object.keys(Methods).map((t) => ({ title: t, value: t }))}
							label={Titles.Methods}
							onChange={(value: string) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ExecutorFunctionType,
									id: currentNode.id,
									value
								});
							}}
							value={
								currentNode.properties ? (
									currentNode.properties[UIA.NodeProperties.ExecutorFunctionType]
								) : (
									''
								)
							}
						/>
						<SelectInput
							options={modelNodes}
							label={Titles.Models}
							onChange={(value: string) => {
								var id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: currentNode.properties[UIA.NodeProperties.ExecutorModel],
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ExecutorModel,
									id: currentNode.id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.ExecutorModelLink }
								});
							}}
							value={
								currentNode.properties ? currentNode.properties[UIA.NodeProperties.ExecutorModel] : ''
							}
						/>
						<SelectInput
							options={modelNodes}
							label={Titles.OutputModel}
							onChange={(value: string) => {
								var id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: currentNode.properties[UIA.NodeProperties.ExecutorModelOutput],
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ExecutorModelOutput,
									id: currentNode.id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.ExecutorModelLink }
								});
							}}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModelOutput)}
						/>
						<SelectInput
							options={agents}
							label={Titles.Agents}
							onChange={(value: string) => {
								var id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: currentNode.properties[UIA.NodeProperties.ExecutorAgent],
									source: id
								});

								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ExecutorAgent,
									id: currentNode.id,
									value
								});

								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.ExecutorAgentLink }
								});
							}}
							value={
								currentNode.properties ? currentNode.properties[UIA.NodeProperties.ExecutorAgent] : ''
							}
						/>
						<SelectInput
							options={functionNodes}
							label={Titles.Functions}
							onChange={(value: string) => {
								var id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: currentNode.properties[UIA.NodeProperties.ExecutorFunction],
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ExecutorFunction,
									id: currentNode.id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.ExecutorFunctionLink }
								});
							}}
							value={
								currentNode.properties ? (
									currentNode.properties[UIA.NodeProperties.ExecutorFunction]
								) : (
									''
								)
							}
						/>
					</FormControl>
				) : null}
			</TabPane>
		);
	}
}

export default UIConnect(ExecutorActivityMenu);
