// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import {
	createValidator,
	TARGET,
	createEventProp,
	GetNode,
	getValidatorItem,
	isUIExtensionEnumerable,
	GetUIExentionEnumeration,
	GetUIExentionKeyField,
	GetLinkChainFromGraph,
	GetMethodNode,
	GetNodesByProperties
} from '../methods/graph_methods';
import { Validator, ValidatorItem, Enumeration } from '../methods/graph_types';
import { NodeProperties, LinkType, LinkEvents, FilterRules, NodePropertyTypes } from '../constants/nodetypes';
import { NodeTypes } from '../actions/uiactions';

class ExecutorItem extends Component<any, any> {
	render() {
		var { state } = this.props;
		var graph = UIA.GetCurrentGraph(state);
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		var validator: Validator;
		let validatorItem: ValidatorItem | null = null;
		var function_variables = [];
		if (currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel)) {
			validator = UIA.GetNodeProp(currentNode, NodeProperties.Executor);
			validatorItem = validator.properties[this.props.property].validators[this.props.validator];
		} else if (currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ModelItemFilter)) {
			validator = UIA.GetNodeProp(currentNode, NodeProperties.FilterModel);
			validatorItem = validator.properties[this.props.property].validators[this.props.validator];
			var methods = GetLinkChainFromGraph(
				graph,
				{
					id: currentNode.id,
					links: [
						{
							direction: TARGET,
							type: LinkType.ModelItemFilter
						}
					]
				},
				[ NodeTypes.Method ]
			);
			if (methods && methods.length) {
				var props = UIA.GetMethodProps(methods[0]);
				let filterParameters = UIA.GetMethodFilterParameters(currentNode.id, true);
				if (filterParameters && filterParameters.length) {
					function_variables = filterParameters;
				} else if (props) {
					function_variables = Object.keys(props).map((t) => ({ title: t, value: t }));
				}
			}
		} else {
			validator = this.props.selectedValidator;
			if (validator) {
				validatorItem = validator.properties[this.props.property].validators[this.props.validator];
			}
			function_variables = this.props.function_variables;
		}
		if (validatorItem) {
			if (validatorItem.arguments && validatorItem.arguments.reference) {
				var { types, properties, title } = validatorItem.arguments.reference;
				if (types) {
					let _nodes_types = (properties
						? GetNodesByProperties(properties, UIA.GetCurrentGraph())
						: UIA.NodesByType(state, types))
						.filter(
							(x: string) =>
								UIA.GetNodeProp(x, NodeProperties.NODEType) === UIA.NodeTypes.ExtensionType
									? isUIExtensionEnumerable(x)
									: true
						)
						.filter((v: Node) => {});

					validator = validator || UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
					let item = getValidatorItem(validator, {
						property: this.props.property,
						validator: this.props.validator
					});
					let editlist = [];
					if (item && item.node) {
						let node = GetNode(graph, item.node);
						switch (UIA.GetNodeProp(node, NodeProperties.NODEType)) {
							case NodeTypes.Enumeration:
								var enums: Enumeration[] = UIA.GetNodeProp(node, NodeProperties.Enumeration) || [];
								editlist = enums.map((_enum: Enumeration) => {
									let enumKey: any = _enum.id || _enum;
									return (
										<div
											className={`external-event ${item.enumeration && item.enumeration[enumKey]
												? 'bg-red'
												: 'bg-black'}`}
											style={{ cursor: 'pointer' }}
											onClick={() => {
												item.enumeration = item.enumeration || {};
												item.enumeration[enumKey] = !item.enumeration[enumKey];
												this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
													id: currentNode.id,
													prop: NodeProperties.Executor,
													value: validator
												});
											}}
										>
											{' '}
											{_enum.value}
										</div>
									);
								});
								break;
							case NodeTypes.ExtensionType:
								var list_enums = GetUIExentionEnumeration(node);
								var list_key_field = GetUIExentionKeyField(node);
								editlist = list_enums.map((_enum: { [str: string]: any }) => {
									return (
										<div
											className={`external-event ${item.extension &&
											item.extension[_enum[list_key_field]]
												? 'bg-red'
												: 'bg-black'}`}
											style={{ cursor: 'pointer' }}
											onClick={() => {
												item.extension = item.extension || {};
												item.extension[_enum[list_key_field]] = !item.extension[
													_enum[list_key_field]
												];
												this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
													id: currentNode.id,
													prop: NodeProperties.Executor,
													value: validator
												});
											}}
										>
											{' '}
											{_enum[list_key_field]}
										</div>
									);
								});
								break;
						}
					}
					let formControll = (
						<FormControl>
							<SelectInput
								options={_nodes_types.toNodeSelect()}
								label={title || Titles.Property}
								onChange={(value: string) => {
									var id = currentNode.id;
									validator =
										validator ||
										UIA.GetNodeProp(currentNode, NodeProperties.Executor) ||
										createValidator();
									let item = getValidatorItem(validator, {
										property: this.props.property,
										validator: this.props.validator
									});
									let old_one = item.node;
									item.node = value;
									if (this.props.onChange) {
										this.props.onChange();
									} else {
										if (old_one) {
											this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
												target: old_one,
												source: id
											});
										}
										this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
											id,
											prop: NodeProperties.Executor,
											value: validator
										});
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
									}
								}}
								value={validatorItem ? validatorItem.node : ''}
							/>
							{editlist}
						</FormControl>
					);

					return formControll;
				}
				return <div>reference</div>;
			} else if (validatorItem.arguments && validatorItem.arguments.method_reference) {
				return this.getMethodReferenceItem(validator, validatorItem);
			} else if (validatorItem.arguments && validatorItem.arguments.functionvariables) {
				let functionVariableControl = (
					<FormControl>
						<SelectInput
							options={function_variables}
							label={Titles.FunctionVariables}
							onChange={(value: string) => {
								var id = currentNode.id;
								validator =
									validator ||
									this.props.selectedValidator ||
									UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
									createValidator();
								let item = getValidatorItem(validator, {
									property: this.props.property,
									validator: this.props.validator
								});
								item.node = value;

								if (this.props.onChange) {
									this.props.onChange();
								} else {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: NodeProperties.FilterModel,
										value: validator
									});
								}
							}}
							value={validatorItem ? validatorItem.node : ''}
						/>
					</FormControl>
				);

				return functionVariableControl;
			} else if (validatorItem.arguments && validatorItem.arguments.modelproperty) {
				let modelParameters = function_variables || UIA.GetMethodFilterParameters(currentNode.id, true);
				let node_value = validatorItem ? validatorItem.node : '';
				let nodeProperty = validatorItem ? validatorItem.nodeProperty : '';
				let properties = [];
				if (node_value) {
					let node_ref = UIA.GetMethodsProperty(this.props.adjacentNodeId || currentNode.id, node_value);
					if (node_ref) {
						properties = UIA.GetModelPropertyChildren(node_ref).toNodeSelect();
					}
				}
				let functionVariableControl = (
					<FormControl>
						<SelectInput
							options={modelParameters}
							label={Titles.FunctionVariables}
							onChange={(value: string) => {
								var id = currentNode.id;
								var validator =
									this.props.selectedValidator ||
									UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
									createValidator();
								let item = getValidatorItem(validator, {
									property: this.props.property,
									validator: this.props.validator
								});
								item.node = value;
								if (this.props.onChange) {
									this.props.onChange();
								} else {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: NodeProperties.FilterModel,
										value: validator
									});
								}
							}}
							value={node_value}
						/>
						<SelectInput
							options={properties}
							label={Titles.Property}
							onChange={(value: string) => {
								var id = currentNode.id;
								var validator =
									this.props.selectedValidator ||
									UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
									createValidator();
								let item = getValidatorItem(validator, {
									property: this.props.property,
									validator: this.props.validator
								});
								item.nodeProperty = value;
								if (this.props.onChange) {
									this.props.onChange();
								} else {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: NodeProperties.FilterModel,
										value: validator
									});
								}
							}}
							value={nodeProperty}
						/>
					</FormControl>
				);

				return functionVariableControl;
			} else if (validatorItem.arguments && validatorItem.arguments.model2modelproperty) {
				let modelParameters = function_variables || UIA.GetMethodFilterParameters(currentNode.id, true);
				let node_value = validatorItem ? validatorItem.node : '';
				let many2many = validatorItem ? validatorItem.many2many : '';
				let nodeProperty = validatorItem ? validatorItem.nodeProperty : '';
				let many2manyProperty = validatorItem ? validatorItem.many2manyProperty : '';
				let many2manyMethod = validatorItem ? validatorItem.many2manyMethod : '';
				let properties = [];
				if (node_value) {
					let node_ref = UIA.GetMethodsProperty(this.props.adjacentNodeId || currentNode.id, node_value);
					if (node_ref) {
						properties = UIA.GetModelPropertyChildren(node_ref).toNodeSelect();
					}
				}
				let manyNodeSelector = null;
				let manyNodePropertySelector = null;
				let manyNodePropertyMethodSelector = null;
				if (modelParameters) {
					let manyNodes = UIA.GetManyToManyNodes([ this.props.property, node_value ].filter((x) => x)) || [];

					manyNodeSelector = (
						<SelectInput
							options={manyNodes.toNodeSelect()}
							label={Titles.ManyToMany}
							onChange={(value: string) => {
								var id = currentNode.id;
								validator =
									validator ||
									this.props.selectedValidator ||
									UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
									createValidator();
								let item = getValidatorItem(validator, {
									property: this.props.property,
									validator: this.props.validator
								});
								item.many2many = value;
								if (this.props.onChange) {
									this.props.onChange();
								} else {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: NodeProperties.FilterModel,
										value: validator
									});
								}
							}}
							value={many2many}
						/>
					);
					if (many2many) {
						manyNodePropertySelector = (
							<SelectInput
								options={UIA.GetModelPropertyNodes(many2many).toNodeSelect()}
								label={Titles.Many2ManyProperties}
								onChange={(value: string) => {
									var id = currentNode.id;
									validator =
										validator ||
										this.props.selectedValidator ||
										UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
										createValidator();
									let item = getValidatorItem(validator, {
										property: this.props.property,
										validator: this.props.validator
									});
									item.many2manyProperty = value;
									if (this.props.onChange) {
										this.props.onChange();
									} else {
										this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
											id,
											prop: NodeProperties.FilterModel,
											value: validator
										});
									}
								}}
								value={many2manyProperty}
							/>
						);
						if (many2manyProperty) {
							manyNodePropertyMethodSelector = (
								<SelectInput
									options={Object.keys(FilterRules).map((t) => {
										return {
											title: t,
											value: FilterRules[t]
										};
									})}
									label={Titles.Many2ManyProperties}
									onChange={(value: string) => {
										var id = currentNode.id;
										validator =
											validator ||
											this.props.selectedValidator ||
											UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
											createValidator();
										let item = getValidatorItem(validator, {
											property: this.props.property,
											validator: this.props.validator
										});
										item.many2manyMethod = value;
										if (this.props.onChange) {
											this.props.onChange();
										} else {
											this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
												id,
												prop: NodeProperties.FilterModel,
												value: validator
											});
										}
									}}
									value={many2manyMethod}
								/>
							);
						}
					}
				}
				let functionVariableControl = (
					<FormControl>
						<SelectInput
							options={modelParameters}
							label={Titles.FunctionVariables}
							onChange={(value: string) => {
								var id = currentNode.id;
								validator =
									validator ||
									this.props.selectedValidator ||
									UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
									createValidator();
								let item = getValidatorItem(validator, {
									property: this.props.property,
									validator: this.props.validator
								});
								item.node = value;
								if (this.props.onChange) {
									this.props.onChange();
								} else {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: NodeProperties.FilterModel,
										value: validator
									});
								}
							}}
							value={node_value}
						/>
						<SelectInput
							options={properties}
							label={Titles.Property}
							onChange={(value: string) => {
								var id = currentNode.id;
								validator =
									validator ||
									this.props.selectedValidator ||
									UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) ||
									createValidator();
								let item = getValidatorItem(validator, {
									property: this.props.property,
									validator: this.props.validator
								});
								item.nodeProperty = value;
								if (this.props.onChange) {
									this.props.onChange();
								} else {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: NodeProperties.FilterModel,
										value: validator
									});
								}
							}}
							value={nodeProperty}
						/>
						{manyNodeSelector}
						{manyNodePropertySelector}
						{manyNodePropertyMethodSelector}
					</FormControl>
				);

				return functionVariableControl;
			} else if (validatorItem.arguments && validatorItem.arguments.condition) {
				return this.getValidatorArgumentCondition(validator, validatorItem);
			}
			return <div>item</div>;
		}

		return <div />;
	}
	getValidatorArgumentCondition(validator: Validator, validatorItem: ValidatorItem) {
		var { state } = this.props;
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (validatorItem.arguments.condition) {
			let formControll = (
				<FormControl>
					<TextInput
						value={validatorItem && validatorItem.condition ? validatorItem.condition : ''}
						label={Titles.Condition}
						onChange={(value: string) => {
							if (
								validatorItem.arguments.condition.type === NodePropertyTypes.INT &&
								isNaN(parseFloat(value))
							) {
								return;
							}

							var id = currentNode.id;

							validator =
								validator || UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
							let item = getValidatorItem(validator, {
								property: this.props.property,
								validator: this.props.validator
							});
							item.condition = value;
							if (this.props.onChange) {
								this.props.onChange();
							} else {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									id,
									prop: NodeProperties.Executor,
									value: validator
								});
							}
						}}
					/>
				</FormControl>
			);

			return formControll;
		}
		return <div />;
	}
	getMethodReferenceItem(validator: Validator, validatorItem: ValidatorItem) {
		var { state } = this.props;
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

		let methodNode = GetMethodNode(state, currentNode.id);
		let methodNodeProperties = UIA.GetMethodProps(methodNode);
		if (validatorItem.arguments && validatorItem.arguments.method_reference) {
			return Object.keys(validatorItem.arguments.method_reference).map((ref) => {
				validator = validator || UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
				let editlist: any[] = [];
				let options = UIA.GetMethodNodeSelectOptions(methodNodeProperties);
				let formControll = (
					<FormControl key={ref}>
						<SelectInput
							options={options}
							defaultSelectText={Titles.NodeType}
							label={Titles.Property}
							onChange={(value: string) => {
								var id = currentNode.id;
								validator =
									validator ||
									UIA.GetNodeProp(currentNode, NodeProperties.Executor) ||
									createValidator();
								let item = getValidatorItem(validator, {
									property: this.props.property,
									validator: this.props.validator
								});
								item.references = item.references || {};
								item.references[ref] = value;
								if (this.props.onChange) {
									this.props.onChange();
								} else {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										id,
										prop: NodeProperties.Executor,
										value: validator
									});
								}
							}}
							value={validatorItem && validatorItem.references ? validatorItem.references[ref] : ''}
						/>
						{editlist}
					</FormControl>
				);

				return formControll;
			});
		}
		return <div>reference</div>;
	}
}

export default UIConnect(ExecutorItem);
