/* eslint-disable no-case-declarations */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable func-names */
/* eslint-disable default-case */
/* eslint-disable no-shadow */
// @flow
import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
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
	MountingDescription
} from '../interface/methodprops';
import SelectInput from './selectinput';
import { ViewTypes } from '../constants/viewtypes';
import routes from '../constants/routes';
import TextInput from './textinput';
import { Node } from '../methods/graph_types';
import {
	MethodFunctions,
	GetFunctionTypeOptions,
	GetConstraints,
	FunctionTemplateKeys,
	FunctionConstraintKeys
} from '../constants/functiontypes';
import CheckBox from './checkbox';
import { GetNodeProp } from '../methods/graph_methods';
import ScreenEffectsComponent from './screenEffectsComponent';
import AfterEffectsComponent from './aftereffectscomponent';

const MAX_CONTENT_MENU_HEIGHT = 500;
class DashboardMountingContenxt extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			deleteType: {}
		};
	}

	getDefaultMenu(mode: any) {
		const { state } = this.props;
		const graph = UIA.GetCurrentGraph(state);
		let mounting: ViewMounting = mode.mounting;
		let callback: any = mode.callback;
		let dashboard: string = mode.dashboard;
		let agent: string = mode.agent;
		let viewType: string = mode.viewType;
		return (
			<TreeViewButtonGroup>
				<TreeViewGroupButton
					title={`${Titles.AddMountFunction}`}
					onClick={() => {
						mounting.mountings.push({
							id: UIA.GUID(),
							model: '',
							agent,
							name: '',
							screenEffect: [],
							viewType
						});
						if (callback) {
							callback(mounting);
							this.setState({ turn: UIA.GUID() });
						}
					}}
					icon="fa fa-plus"
				/>
			</TreeViewButtonGroup>
		);
	}
	getMenuMode(mode: any) {
		const result: any = [];
		let mounting: ViewMounting = mode.mounting;

		let callback: any = mode.callback;
		if (mounting) {
			const exit = () => {
				this.props.setVisual(UIA.DASHBOARD_MOUNTING_CONTEXT_MENU, null);
			};

			result.push(
				<TreeViewMenu
					key={'clear-screen'}
					open={this.state.mountingProperties}
					active
					title={Titles.Properties}
					toggle={() => {
						this.setState({
							mountingProperties: !this.state.mountingProperties
						});
					}}
				>
					<TreeViewItemContainer>
						<CheckBox
							label={'Clear Screen On Mount'}
							value={mounting && mounting.clearScreen}
							onChange={(value: boolean) => {
								mounting.clearScreen = value;
								this.setState({
									turn: UIA.GUID()
								});
							}}
						/>
					</TreeViewItemContainer>
				</TreeViewMenu>
			);

			let models = UIA.NodesByType(this.props.state, UIA.NodeTypes.Model).toNodeSelect();

			switch (mode) {
				default:
					mounting.mountings.forEach((mountingItem: MountingDescription, index: number) => {
						let routeKey = `routing-${index}`;
						let { name, model, agent, viewType, methodDescription, screenEffect } = mountingItem;
						if (!mountingItem.screenEffect) {
							mountingItem.screenEffect = [];
						}
						let parameterConnections: any = null;
						let methodConstraints: any = null;
						if (methodDescription) {
							parameterConnections = this.getMethodDescriptionParameters(methodDescription)
								.filter(this.filterFunctionParameters(methodDescription))
								.map((urlParameter: string, index: number) => {
									let routeKey = `url-param-${urlParameter}-${index}`;
									let agentPropertyOptions: Node[] = UIA.GetModelCodeProperties(agent);
									let modelPropertyOptions: Node[] = UIA.GetModelCodeProperties(model);
									let value = UIA.ensureRouteSource(mountingItem, urlParameter);
									let options = [
										...[ urlParameter ]
											.filter(
												methodDescription
													? this.filterFunctionParameters(methodDescription)
													: () => false
											)
											.map((k: string) => {
												return (
													<TreeViewMenu
														title={k}
														icon={value !== k ? 'fa fa-square-o' : 'fa fa-square'}
														onClick={() => {
															UIA.setRouteSource(
																mountingItem,
																urlParameter,
																k,
																RouteSourceType.UrlParameter
															);

															callback(mounting);
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
												let value = UIA.ensureRouteSource(
													mountingItem,
													urlParameter,
													'property'
												);
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
															// mountingItem.source = {
															// 	model,
															// 	property: modelPropertyOption.id,
															// 	type: RouteSourceType.Model
															// };
															UIA.setRouteSource(
																mountingItem,
																urlParameter,
																model,
																RouteSourceType.Model,
																modelPropertyOption.id
															);
															callback(mounting);
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
                        let value = UIA.ensureRouteSource(
													mountingItem,
													urlParameter,
													'property'
												);
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
															// mountingItem.source = {
															// 	model: agent,
															// 	property: agentPropertyOption.id,
															// 	type: RouteSourceType.Agent
                              // };
                              UIA.setRouteSource(
																mountingItem,
																urlParameter,
																agent,
																RouteSourceType.Agent,
																agentPropertyOption.id
															);
															callback(mounting);
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
							methodConstraints = this.getMethodDescriptionConstraints(
								methodDescription
							).map((constraint: string, index: number) => {
								let props: any = null;
								if (!(mountingItem.methodDescription && mountingItem.methodDescription.properties)) {
									props = mountingItem.methodDescription;
									props.properties = {};
								} else {
									props = mountingItem.methodDescription.properties;
								}
								this.applyDefaultConstraintValues(mountingItem);
								return (
									<SelectInput
										onChange={(c: string) => {
											if (
												mountingItem.methodDescription &&
												mountingItem.methodDescription.properties
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
								innerStyle={{ maxHeight: 300, overflowY: 'auto' }}
								active
								title={name}
								toggle={() => {
									this.setState({ [routeKey]: !this.state[routeKey] });
								}}
							>
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
											mountingItem.methodDescription = methodDescription;
											this.setState({ turn: UIA.GUID() });
										}}
										label={Titles.FunctionTypes}
										value={methodDescription ? methodDescription.functionType : null}
										options={GetFunctionTypeOptions()}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<TextInput
										label={Titles.Name}
										onChange={(value: string) => {
											mountingItem.name = value;
											this.setState({ turn: UIA.GUID() });
										}}
										value={mountingItem.name}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.Model}
										options={models}
										onChange={(value: string) => {
											mountingItem.model = value;
											this.setState({ turn: UIA.GUID() });
										}}
										value={mountingItem.model}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.Agents}
										options={models.filter((x: { value: string }) =>
											GetNodeProp(x.value, NodeProperties.IsAgent)
										)}
										onChange={(value: string) => {
											mountingItem.agent = value;
											this.setState({ turn: UIA.GUID() });
										}}
										value={mountingItem.agent}
									/>
								</TreeViewItemContainer>
								<TreeViewMenu
									title={'Screen to API'}
									open={this.state.screenToApi}
									active
									onClick={() => {
										this.setState({ screenToApi: !this.state.screenToApi });
									}}
								>
									{parameterConnections}
								</TreeViewMenu>
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
								<ScreenEffectsComponent agent={agent} screenEffects={mountingItem.screenEffect} />
								<AfterEffectsComponent
									agent={agent}
									methods={mode.methods}
                  methodDescription={effectItem.methodDescription}
									afterEffects={mountingItem.afterEffects}
								/>
								<TreeViewButtonGroup>
									<TreeViewGroupButton
										onClick={() => {
											if (callback) {
												let update = mounting.mountings.find((x) => x.id === mountingItem.id);
												if (update) {
													if (callback) {
														callback(mounting);
													}
													this.setState({ turn: UIA.GUID() });
												}
											}
										}}
										icon="fa fa-save"
									/>
									<TreeViewGroupButton
										onClick={() => {
											mounting.mountings.splice(index, 1);
											if (callback) {
												callback(mounting);
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
	applyDefaultConstraintValues(mountingItem: MountingDescription) {
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

	private filterFunctionParameters(
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
		const exit = () => {
			this.props.setVisual(UIA.DASHBOARD_MOUNTING_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const display = UIA.Visual(state, UIA.DASHBOARD_MOUNTING_CONTEXT_MENU) ? 'block' : 'none';
		const nodeType = UIA.Visual(state, UIA.DASHBOARD_MOUNTING_CONTEXT_MENU)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.DASHBOARD_MOUNTING_CONTEXT_MENU) || {};
		const currentInfo = this.getCurrentInfo(menuMode);
		const menuitems = this.getMenuMode(menuMode);
		const defaultMenus = this.getDefaultMenu(menuMode);
		const MENU_WIDTH = 300;
		return (
			<Draggable handle=".draggable-header,.draggable-footer">
				<div
					className="context-menu modal-dialog modal-danger"
					style={{
						zIndex: 1000,
						position: 'fixed',
						width: this.state.secondaryMenu ? 500 : MENU_WIDTH,
						display,
						top: MENU_WIDTH,
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
		let { dashboard, agent } = menuMode;
		if (dashboard && agent) {
			return [
				<TreeViewMenu
					key={'current-agent'}
					icon={'fa fa-briefcase'}
					title={`${UIA.GetNodeTitle(dashboard)}/${UIA.GetNodeTitle(agent)}`}
				/>
			];
		}
		return null;
	}
}

export default UIConnect(DashboardMountingContenxt);
