// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import TextInput from './textinput';
import { MethodFunctions, HTTP_METHODS } from '../constants/functiontypes';
import TreeViewMenu from './treeviewmenu';
import { CreateAgentFunction } from '../constants/nodepackages';

class AgentBasedMethods extends Component<any, any> {
	render() {
		var { state } = this.props;
		if (!state || !UIA.HasCurrentGraph()) {
			return <div />;
		}
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		return (
			<TabPane active={true}>
				<FormControl>
					<h3>{Titles.QuickMethods}</h3>
					<SelectInput
						options={UIA.NodesByType(state, NodeTypes.Model)
							.filter((t) => UIA.GetNodeProp(t, NodeProperties.IsAgent))
							.toNodeSelect()}
						label={Titles.Agents}
						onChange={(value) => {
							this.props.setVisual(UIA.BATCH_AGENT, value);
						}}
						value={UIA.Visual(state, UIA.BATCH_AGENT)}
					/>

					<div style={{ paddingBottom: 10 }}>
						<TreeViewMenu
							hideArrow={true}
							title={Titles.Clear}
							icon={'fa fa-times'}
							toggle={() => {
								this.props.graphOperation(
									UIA.NodesByType(state, NodeTypes.Model).map((model) => {
										return {
											operation: UIA.CHANGE_NODE_PROPERTY,
											options: {
												prop: UIA.NodeProperties.AgentBasedMethod,
												id: model.id,
												value: false
											}
										};
									})
								);
							}}
						/>
						<TreeViewMenu
							title={Titles.Models}
							icon={'fa fa-object-group'}
							open={UIA.Visual(state, 'agent-base-methods')}
							innerStyle={{ maxHeight: 400, overflowY: 'auto' }}
							right={null}
							hideArrow={true}
							active={true}
							toggle={() => {
								this.props.toggleVisual('agent-base-methods');
							}}
						>
							{UIA.NodesByType(state, NodeTypes.Model).map((model) => {
								return (
									<TreeViewMenu
										key={`node--${model.id}`}
										hideArrow={true}
										title={UIA.GetNodeProp(model, NodeProperties.UIText)}
										icon={
											!UIA.GetNodeProp(model, NodeProperties.AgentBasedMethod) ? (
												'fa fa-circle-o'
											) : (
												'fa fa-check-circle-o'
											)
										}
										toggle={() => {
											this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
												prop: UIA.NodeProperties.AgentBasedMethod,
												id: model.id,
												value: !UIA.GetNodeProp(model, NodeProperties.AgentBasedMethod)
											});
										}}
									/>
								);
							})}
						</TreeViewMenu>
					</div>
					<SelectInput
						options={Object.keys(MethodFunctions).map((t) => {
							return {
								title: MethodFunctions[t] && MethodFunctions[t].title ? MethodFunctions[t].title : t,
								value: t
							};
						})}
						label={Titles.FunctionTypes}
						onChange={(value) => {
							this.props.setVisual(UIA.BATCH_FUNCTION_TYPE, value);
						}}
						value={UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)}
					/>
					<TextInput
						label={Titles.MethodName}
						value={UIA.Visual(state, UIA.BATCH_FUNCTION_NAME)}
						onChange={(value) => {
							this.props.setVisual(UIA.BATCH_FUNCTION_NAME, value);
						}}
					/>
					<button
						type="button"
						className="btn btn-block btn-info btn-sm"
						onClick={() => {
							this.props.executeGraphOperations(
								UIA.NodesByType(state, NodeTypes.Model)
									.filter((x) => {
										return UIA.GetNodeProp(x, NodeProperties.AgentBasedMethod);
									})
									.map((model) => {
										let functionName = MethodFunctions[
											UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)
										].titleTemplate(
											UIA.GetNodeTitle(model),
											UIA.GetNodeTitle(UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_AGENT)))
										);

										return {
											node: currentNode,
											type: UIA.Visual(state, UIA.BATCH_FUNCTION_NAME),
											method: {
												method: CreateAgentFunction({
													nodePackageType: functionName,
													methodType:
														MethodFunctions[UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)]
															.method,
													model: model,
													parentId: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_PARENT)),
													agent: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_AGENT)),
													httpMethod: HTTP_METHODS.POST,
													functionType: UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE),
													functionName
												})
											},
											methodType: UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)
										};
									})
							);
						}}
					>
						Build
					</button>
				</FormControl>
			</TabPane>
		);
	}
}

export default UIConnect(AgentBasedMethods);
