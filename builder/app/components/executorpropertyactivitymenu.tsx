// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import ExecutorItem from './executoritem';
import * as Titles from './titles';
import { NodeProperties, ExecutorUI, NodeTypes } from '../constants/nodetypes';
import { createValidator, addValidatator, GetNode, getValidatorItem } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { uuidv4 } from '../utils/array';
import { Validator, Node } from '../methods/graph_types';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctions, DataChainFunctionKeys } from '../constants/datachain';
import BuildLambda, { LambdaTypes } from './lambda/BuildLambda';

class ExecutorPropertyActivityMenu extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, this.props.nodeType || UIA.NodeTypes.Executor);
		if (!active) {
			return <div />;
		}
		var graph = UIA.GetCurrentGraph(state);
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		var executor: Validator | null = null;
		if (
			active &&
			currentNode &&
			UIA.GetNodeProp(currentNode, this.props.modelKey || UIA.NodeProperties.ExecutorModel)
		) {
			executor = UIA.GetNodeProp(currentNode, this.props.nodeProp || NodeProperties.Executor);
		}
		let _ui = this.props.ui || ExecutorUI;
		let propertyExecutors: JSX.Element | any[] = <div />;
		if (executor && executor.properties) {
			propertyExecutors = Object.keys(executor.properties).map((key) => {
				let _validates = executor ? executor.properties[key] : null;
				let visualKey = `ExecutorPropertyActivityMenu${key}-${currentNode.id}`;
				let temp = Object.keys(_validates && _validates.validators ? _validates.validators : {});
				let selectedValidationsCount = temp.length;
				let selectedValidations = temp.map((v) => {
					let selK = `${visualKey}-selected-validation`;
					let selKInner = `${selK}-inne-${v}-r`;
					let validatorItem = _validates ? _validates.validators[v] : null;
					let isDataChainExecutor = validatorItem && validatorItem.type === NodeTypes.DataChain;
					return (
						<TreeViewMenu
							key={`${v}-v-v`}
							title={
								_validates &&
								_validates.validators &&
								_validates.validators[v] &&
								_validates.validators[v].type ? (
									_validates.validators[v].type
								) : (
									v
								)
							}
							open={UIA.Visual(state, selKInner)}
							active={UIA.Visual(state, selKInner)}
							toggle={() => {
								this.props.toggleVisual(selKInner);
							}}
							icon={'fa fa-tag'}
						>
							<TreeViewButtonGroup>
								<TreeViewGroupButton
									title={Titles.Remove}
									icon={'fa fa-minus'}
									onClick={() => {
										let id = currentNode.id;
										let validator =
											UIA.GetNodeProp(
												currentNode,
												this.props.nodeProp || NodeProperties.Executor
											) || createValidator();

										let _validates = validator.properties[key];
										delete _validates.validators[v];

										this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
											id,
											prop: this.props.nodeProp || NodeProperties.Executor,
											value: validator
										});
									}}
								/>
								{isDataChainExecutor ? (
									<TreeViewGroupButton
										plus
										title={NodeTypes.DataChain}
										icon={'fa fa-chain'}
										onClick={() => {
											let id = currentNode.id;
											let validator: Validator =
												UIA.GetNodeProp(
													currentNode,
													this.props.nodeProp || NodeProperties.Executor
												) || createValidator();

											let item = getValidatorItem(validator, {
												property: key,
												validator: v
											});
											let value: string | null = null;
											UIA.graphOperation([
												UIA.CreateNewNode(
													{
														[NodeProperties.NODEType]: NodeTypes.DataChain,
														[NodeProperties.CS]: true,
														[NodeProperties.CSEntryPoint]: true,
														[NodeProperties.AsOutput]: true,
														[NodeProperties.DataChainFunctionType]:
															DataChainFunctionKeys.Lambda,
														[NodeProperties.Lambda]: BuildLambda({
															lambdaType: LambdaTypes.ExecutorItem
														})
													},
													(newNode: Node) => {
														value = newNode.id;
													}
												)
											])(UIA.GetDispatchFunc(), UIA.GetStateFunc());
											if (value) {
                        item.node = value;
                        UIA.AddInsertArgumentsForDataChain(value);
												UIA.updateComponentProperty(value, NodeProperties.Pinned, true);
											}
											this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
												id,
												prop: this.props.nodeProp || NodeProperties.Executor,
												value: validator
											});
										}}
									/>
								) : null}
							</TreeViewButtonGroup>
							<ExecutorItem node={currentNode.id} property={key} validator={v} />
						</TreeViewMenu>
					);
				});
				let validationUis = Object.keys(_ui)
					.filter((x) => !_validates || !_validates.validators || !_validates.validators[x])
					.reverse()
					.map((executorUI) => {
						return (
							<TreeViewMenu
								hideArrow={true}
								key={`${executorUI}-afjlskf-asfd`}
								title={executorUI}
								icon={'fa fa-plus-square-o'}
								onClick={() => {
									let id = currentNode.id;
									var executor =
										UIA.GetNodeProp(currentNode, this.props.nodeProp || NodeProperties.Executor) ||
										createValidator();
									executor = addValidatator(executor, {
										id: key,
										validator: uuidv4(),
										validatorArgs: {
											type: executorUI,
											..._ui[executorUI]
										}
									});
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: this.props.nodeProp || NodeProperties.Executor,
										value: executor
									});
								}}
							/>
						);
					});
				return (
					<TreeViewMenu
						key={visualKey}
						open={UIA.Visual(state, visualKey)}
						active={UIA.Visual(state, visualKey)}
						title={UIA.GetNodeTitle(GetNode(graph, key))}
						toggle={() => {
							this.props.toggleVisual(visualKey);
						}}
					>
						<TreeViewMenu
							hideArrow={true}
							title={Titles.RemoveExecution}
							icon={'fa fa-minus'}
							onClick={() => {
								let id = currentNode.id;

								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: key,
									source: id
								});
							}}
						/>
						<TreeViewMenu
							title={`${Titles.SelectedExecutors}(${selectedValidationsCount})`}
							icon={'fa  fa-list-ul'}
							open={UIA.Visual(state, `${visualKey}-selected-executions`)}
							active={UIA.Visual(state, `${visualKey}-selected-executions`)}
							toggle={() => {
								this.props.toggleVisual(`${visualKey}-selected-executions`);
							}}
						>
							{selectedValidations}
						</TreeViewMenu>
						<TreeViewMenu
							title={Titles.SelectExecution}
							icon={'fa fa-plus-circle'}
							open={UIA.Visual(state, `${visualKey}-selectexecution`)}
							active={UIA.Visual(state, `${visualKey}-selectexecution`)}
							toggle={() => {
								this.props.toggleVisual(`${visualKey}-selectexecution`);
							}}
						>
							{validationUis}
						</TreeViewMenu>
					</TreeViewMenu>
				);
			});
			propertyExecutors = (
				<div style={{ position: 'relative' }}>
					<MainSideBar>
						<SideBar style={{ maxHeight: 600, overflowY: 'auto' }}>
							<SideBarMenu>{propertyExecutors}</SideBarMenu>
						</SideBar>
					</MainSideBar>
				</div>
			);
		}

		return propertyExecutors;
	}
}

export default UIConnect(ExecutorPropertyActivityMenu);
