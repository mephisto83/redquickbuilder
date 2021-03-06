/* eslint-disable no-case-declarations */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable func-names */
/* eslint-disable default-case */
/* eslint-disable no-shadow */
// @flow
import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import { NodeProperties, LinkType, LinkPropertyKeys, NodeTypes } from '../constants/nodetypes';
import GenericPropertyContainer from './genericpropertycontainer';
import _create_get_view_model from '../nodepacks/_create_get_view_model';
import TreeViewMenu from './treeviewmenu';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewItemContainer from './treeviewitemcontainer';
import {
	Routing,
	RouteDescription,
	MethodDescription,
	RouteSource,
	RouteSourceType,
	ViewMounting,
	ViewMoutingProps,
	MountingDescription,
	Effect,
	EffectDescription
} from '../interface/methodprops';
import SelectInput from './selectinput';
import { ViewTypes } from '../constants/viewtypes';
import routes from '../constants/routes';
import TextInput from './textinput';
import { Node } from '../methods/graph_types';
import { MethodFunctions, FunctionTemplateKeys, GetFunctionTypeOptions } from '../constants/functiontypes';
import CheckBox from './checkbox';
import AfterEffectsComponent from './aftereffectscomponent';
import MountingItemConfig from './mountingitemconfig';

const MAX_CONTENT_MENU_HEIGHT = 500;
class DashboardEffectContextMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			deleteType: {}
		};
	}

	getDefaultMenu(mode: any) {
		const { state } = this.props;
		const graph = UIA.GetCurrentGraph(state);
		let effect: Effect = mode.effect;
		let callback: any = mode.callback;
		let agent: string = mode.agent;
		return (
			<TreeViewButtonGroup>
				<TreeViewGroupButton
					title={`${Titles.AddEffect}`}
					onClick={() => {
						effect.effects.push({
							id: UIA.GUID(),
							model: '',
							body: false,
							screenEffect: [],
							agent,
							name: '',
							viewType: ViewTypes.Get,
							afterEffects: [],
							excludeFromController: false
						});
						if (callback) {
							callback(effect);
							this.setState({ turn: UIA.GUID() });
						}
					}}
					icon="fa fa-plus"
				/>
			</TreeViewButtonGroup>
		);
	}
	getRoutingApi(routing: Routing) {}
	getMenuMode(mode: any) {
		const result: any = [];
		let effect: Effect = mode.effect;
		let onComponentMountMethod: ViewMounting = mode.onComponentMountMethod;
		let sourceAgent = mode.agent;
		let sourceModel = mode.model;
		let callback: any = mode.callback;
		if (effect) {
			const exit = () => {
				this.props.setVisual(UIA.DASHBOARD_EFFECT_CONTEXT_MENU, null);
			};
			let models = UIA.NodesByType(this.props.state, UIA.NodeTypes.Model).toNodeSelect();
			this.getRoutingApi(mode);
			switch (mode) {
				default:
					effect.effects.forEach((effectItem: EffectDescription, index: number) => {
						let routeKey = `routing-${index}`;
            let { name, model, agent, viewType, methodDescription, source } = effectItem;
            effectItem.viewType = mode.viewType || effectItem.viewType;
						effectItem.afterEffects = effectItem.afterEffects || [];
						let parameterConnections: any = null;
						let bodyParameter: any = null;
						let methodConstraints: any = null;
						if (methodDescription) {
							parameterConnections = this.getMethodDescriptionParameters(methodDescription)
								.filter(this.filterMethodDescriptionFunctionParameters(methodDescription))
								.map((urlParameter: string, index: number) => {
									let routeKey = `url-param-${urlParameter}-${index}`;
									let agentPropertyOptions: Node[] = UIA.GetModelCodeProperties(agent);
									let modelPropertyOptions: Node[] = UIA.GetModelCodeProperties(model);
									// let value = effectItem.source ? effectItem.source.model : null;
									let value = UIA.ensureRouteSource(effectItem, urlParameter);
									let options = [
										...[ urlParameter ]
											.filter(
												methodDescription
													? this.filterMethodDescriptionFunctionParameters(methodDescription)
													: () => false
											)
											.map((k: string) => {
												return (
													<TreeViewMenu
														title={k}
														icon={value !== k ? 'fa fa-square-o' : 'fa fa-square'}
														onClick={() => {
															// effectItem.source = {
															// 	model: k,
															// 	property: null,
															// 	type: RouteSourceType.UrlParameter
															// };
															UIA.setRouteSource(
																effectItem,
																urlParameter,
																k,
																RouteSourceType.UrlParameter
															);
															callback(effect);
															this.setState({ turn: UIA.GUID() });
														}}
														key={`url-parma-k-${k}`}
													/>
												);
											}),
										<TreeViewMenu
											icon={value !== model ? 'fa fa-square-o' : 'fa fa-square'}
											title={`${UIA.GetNodeTitle(model)}(model)`}
											active
											key={`url-parma-k-modle`}
											open={this.state[model]}
											toggle={() => {
												this.setState({ [model]: !this.state[model] });
											}}
										>
											{modelPropertyOptions.map((modelPropertyOption: Node) => {
												// let value = effectItem.source ? effectItem.source.property : null;
												let value = UIA.ensureRouteSource(effectItem, urlParameter, 'property');
												return (
													<TreeViewMenu
														icon={
															value !== modelPropertyOption.id ? (
																'fa fa-square-o'
															) : (
																'fa fa-square'
															)
														}
														title={UIA.GetNodeTitle(modelPropertyOption)}
														onClick={() => {
															// effectItem.source = {
															// 	model,
															// 	property: modelPropertyOption.id,
															// 	type: RouteSourceType.Model
															// };
															UIA.setRouteSource(
																effectItem,
																urlParameter,
																model,
																RouteSourceType.Model,
																modelPropertyOption.id
															);
															callback(effect);
															this.setState({ turn: UIA.GUID() });
														}}
														key={`url-parsma-k-${modelPropertyOption.id}`}
													/>
												);
											})}
										</TreeViewMenu>,
										<TreeViewMenu
											icon={value !== agent ? 'fa fa-square-o' : 'fa fa-square'}
											open={this.state[agent]}
											active
											toggle={() => {
												this.setState({ [agent]: !this.state[agent] });
											}}
											title={`${UIA.GetNodeTitle(agent)}(agent)`}
											key={`url-parma-k-genta`}
										>
											{agentPropertyOptions.map((agentPropertyOption: Node) => {
												// let value = effectItem.source ? effectItem.source.property : null;
												let value = UIA.ensureRouteSource(effectItem, urlParameter, 'property');
												return (
													<TreeViewMenu
														title={UIA.GetNodeTitle(agentPropertyOption)}
														icon={
															value !== agentPropertyOption.id ? (
																'fa fa-square-o'
															) : (
																'fa fa-square'
															)
														}
														onClick={() => {
															// effectItem.source = {
															// 	model: agent,
															// 	property: agentPropertyOption.id,
															// 	type: RouteSourceType.Agent
															// };
															UIA.setRouteSource(
																effectItem,
																urlParameter,
																agent,
																RouteSourceType.Agent,
																agentPropertyOption.id
															);
															callback(effect);
															this.setState({ turn: UIA.GUID() });
														}}
														key={`url-parma-k-${agentPropertyOption.id}`}
													/>
												);
											})}
										</TreeViewMenu>
									];
									return (
										<TreeViewMenu
											key={routeKey}
											active
											open={this.state[routeKey]}
											title={urlParameter}
											toggle={() => {
												this.setState({ [routeKey]: !this.state[routeKey] });
											}}
										>
											{options}
										</TreeViewMenu>
									);
								});
							if (this.hasBodyParameter(methodDescription)) {
								bodyParameter = (
									<TreeViewItemContainer>
										<CheckBox
											label={'Body'}
											value={effectItem && effectItem.body}
											onChange={(value: boolean) => {
												effectItem.body = value;
												this.setState({
													turn: UIA.GUID()
												});
											}}
										/>
									</TreeViewItemContainer>
								);
							}
							methodConstraints = this.getMethodDescriptionConstraints(
								methodDescription
							).map((constraint: string, index: number) => {
								let props: any = null;
								if (!(effectItem.methodDescription && effectItem.methodDescription.properties)) {
									props = effectItem.methodDescription;
									props.properties = {};
								} else {
									props = effectItem.methodDescription.properties;
								}
								this.applyDefaultConstraintValues(effectItem);
								return (
									<SelectInput
										onChange={(c: string) => {
											if (
												effectItem.methodDescription &&
												effectItem.methodDescription.properties
											) {
												props[constraint] = c;
												this.setState({ turn: UIA.GUID() });
											}
										}}
										value={props[constraint]}
										label={constraint}
										options={UIA.NodesByType(null, NodeTypes.Model).toNodeSelect()}
									/>
								);
							});
						}

						result.push(
							<TreeViewMenu
								key={routeKey}
								open={this.state[routeKey]}
								active
								title={name}
								toggle={() => {
									this.setState({ [routeKey]: !this.state[routeKey] });
								}}
							>
								<TreeViewItemContainer>
									<TextInput
										label={Titles.Name}
										onChange={(value: string) => {
											effectItem.name = value;
											this.setState({ turn: UIA.GUID() });
										}}
										value={effectItem.name}
									/>
								</TreeViewItemContainer>
								<MountingItemConfig mountingDescription={effectItem} />
								<TreeViewItemContainer>
									<SelectInput
										onChange={(c: string) => {
											let defaultMethodDescription: any = {
												functionType: c,
												properties: {}
											};
											methodDescription = methodDescription || defaultMethodDescription;
											if (methodDescription) {
												methodDescription.functionType = c;
											}
											effectItem.methodDescription = methodDescription;
											this.setState({ turn: UIA.GUID() });
										}}
										label={Titles.FunctionTypes}
										value={methodDescription ? methodDescription.functionType : null}
										options={GetFunctionTypeOptions()}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										onChange={(c: string) => {
											effectItem.model = c;
											this.setState({ turn: UIA.GUID() });
										}}
										label={Titles.Model}
										value={effectItem.model}
										options={models}
									/>
								</TreeViewItemContainer>
								{bodyParameter}
								{parameterConnections}
								<TreeViewMenu
									active
									title={'Method constraint values'}
									open={this.state.methodConstraintValues}
									onClick={() => {
										this.setState({ methodConstraintValues: !this.state.methodConstraintValues });
									}}
								>
									{methodConstraints}
								</TreeViewMenu>
								<AfterEffectsComponent
									agent={agent}
									methods={mode.methods}
									methodDescription={effectItem.methodDescription}
									afterEffects={effectItem.afterEffects}
								/>
								<TreeViewButtonGroup>
									<TreeViewGroupButton
										onClick={() => {
											if (callback) {
												let update = effect.effects.find((x) => x.id === effectItem.id);
												if (update) {
													if (callback) {
														callback(effect);
													}
												}
											}
										}}
										icon="fa fa-save"
									/>
									<TreeViewGroupButton
										onClick={() => {
											effect.effects.splice(index, 1);
											if (callback) {
												callback(effect);
												this.setState({ turn: UIA.GUID() });
											}
										}}
										icon="fa fa-minus"
									/>
								</TreeViewButtonGroup>
							</TreeViewMenu>
						);
					});
					break;
			}
		}
		return result;
	}

	applyDefaultConstraintValues(mountingItem: EffectDescription) {
		let { methodDescription } = mountingItem;

		if (methodDescription) {
			let constraintKeys = this.getMethodDescriptionConstraints(methodDescription);
			if (constraintKeys) {
				constraintKeys.map((key: string) => {
					switch (key) {
						case FunctionTemplateKeys.Agent:
							if (methodDescription) {
								methodDescription.properties.agent = mountingItem.agent;
							}
							break;
						case FunctionTemplateKeys.Model:
							if (methodDescription) {
								methodDescription.properties.model_output =
									methodDescription.properties.model_output || mountingItem.model;
								methodDescription.properties.model = mountingItem.model;
							}
							break;
						case FunctionTemplateKeys.ModelProperty:
							if (methodDescription) {
								methodDescription.properties.model_output = mountingItem.model;
							}
							break;
					}
				});
			}
		}
	}
	private hasBodyParameter(methodDescription: MethodDescription): boolean {
		if (MethodFunctions[methodDescription.functionType]) {
			let { parameters } = MethodFunctions[methodDescription.functionType];
			if (parameters && parameters.body) {
				return parameters.body;
			}
		}
		return false;
	}
	private getMethodDescriptionParameters(methodDescription: MethodDescription): any[] {
		if (MethodFunctions[methodDescription.functionType]) {
			let { parameters } = MethodFunctions[methodDescription.functionType];
			if (parameters && parameters.parameters) {
				if (parameters && parameters.parameters && parameters.parameters.template) {
					return Object.keys(parameters.parameters.template);
				}
			}
		}
		return [];
	}
	private getMethodDescriptionConstraints(methodDescription: MethodDescription): any[] {
		if (MethodFunctions[methodDescription.functionType]) {
			let { constraints } = MethodFunctions[methodDescription.functionType];
			if (constraints) {
				return Object.keys(constraints).filter((key: string) => {
					let isNotUser = constraints[key] && !constraints[key][NodeProperties.IsUser];
					return (
						constraints[key] &&
						isNotUser &&
						constraints[key].nodeTypes &&
						constraints[key].nodeTypes.indexOf(NodeTypes.Model) !== -1
					);
				});
			}
		}
		return [];
	}

	private filterMethodDescriptionFunctionParameters(
		methodDescription: MethodDescription
	): (value: string, index: number, array: string[]) => boolean {
		return (x: string) => {
			if (MethodFunctions[methodDescription.functionType]) {
				let { parameters } = MethodFunctions[methodDescription.functionType];
				if (parameters && parameters.parameters) {
					if (parameters && parameters.parameters && parameters.parameters.template) {
						return !!parameters.parameters.template[x];
					}
				}
			}
			return false;
		};
	}

	render() {
		const { state } = this.props;
		const display = UIA.Visual(state, UIA.DASHBOARD_EFFECT_CONTEXT_MENU) ? 'block' : 'none';
		if (display === 'none')
			return <div></div>

		const exit = () => {
			this.props.setVisual(UIA.DASHBOARD_EFFECT_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const nodeType = UIA.Visual(state, UIA.DASHBOARD_EFFECT_CONTEXT_MENU)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.DASHBOARD_EFFECT_CONTEXT_MENU) || {};
		const currentInfo = this.getCurrentInfo(menuMode);
		const menuitems = this.getMenuMode(menuMode);
		const defaultMenus = this.getDefaultMenu(menuMode);
		const menu_width = 350;
		return (
			<Draggable handle=".draggable-header,.draggable-footer">
				<div
					className="context-menu modal-dialog modal-info"
					style={{
						zIndex: 1000,
						position: 'fixed',
						width: this.state.secondaryMenu ? 500 : menu_width,
						display,
						top: 250,
						left: 500
					}}
				>
					<div className="modal-content">
						<div className="modal-header draggable-header">
							<button
								type="button"
								onClick={() => {
									exit();
								}}
								className="close"
								data-dismiss="modal"
								aria-label="Close"
							>
								<span aria-hidden="true">×</span>
							</button>
						</div>
						<div className="modal-body" style={{ padding: 0 }}>
							<div
								className={this.state.secondaryMenu ? '' : 'row'}
								style={this.state.secondaryMenu ? { display: 'flex' } : {}}
							>
								<div
									className={this.state.secondaryMenu ? '' : 'col-md-12'}
									style={this.state.secondaryMenu ? { width: '50%' } : {}}
								>
									<GenericPropertyContainer active title="asdf" subTitle="afaf" nodeType={nodeType}>
										{currentInfo}
										{menuitems}
										{defaultMenus}
									</GenericPropertyContainer>
								</div>
							</div>
						</div>
						<div className="modal-footer draggable-footer">
							<button
								type="button"
								onClick={() => {
									exit();
								}}
								className="btn btn-outline pull-left"
								data-dismiss="modal"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			</Draggable>
		);
	}
	getCurrentInfo(menuMode: any) {
		let { model, agent, viewType } = menuMode;
		if (model && agent) {
			return [
				<TreeViewMenu
					key={'current-agent'}
					icon={'fa fa-square-o'}
					title={`${UIA.GetNodeTitle(agent)}/${UIA.GetNodeTitle(model)}/${viewType}`}
				/>
			];
		}
		return null;
	}
}

export default UIConnect(DashboardEffectContextMenu);
