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
	ViewMoutingProps,
	MountingDescription,
	Effect,
	EffectDescription,
	setDefaultRouteSource,
	PermissionConfig,
	ValidationConfig,
	FilterConfig,
	ExecutionConfig
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
import ValidationComponent from './validationcomponent';
import PermissionComponent from './permissioncomponent';
import ExecutionComponent from './executioncomponent';
import FilterComponent from './filtercomponent';
import StaticParametersComponent from './staticparameterscomponent';
import FilterItemsComponent from './filteritemscomponent';
import { autoNameGenerateDataChain } from './validationcomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { autoNameExecutionConfig } from './executioncomponentitem';

const MAX_CONTENT_MENU_HEIGHT = 500;
class EffectContextMenu extends Component<any, any> {
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
							model: mode.model,
							body: false,
							agent,
							name: '',
							screenEffect: [],
							viewType: ViewTypes.Get,
							validations: [],
							afterEffects: [],
							excludeFromController: false,
							executions: [],
							permissions: [],
							autoSetup: { executionAutoCopy: true }
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
				this.props.setVisual(UIA.EFFECT_CONTEXT_MENU, null);
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
						effectItem.autoSetup = effectItem.autoSetup || { executionAutoCopy: true };
						effectItem.validations = effectItem.validations || [];
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
									let value =
										effectItem.source && effectItem.source[urlParameter]
											? effectItem.source[urlParameter].model
											: null;
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
															setDefaultRouteSource(effectItem, urlParameter, k);
															effectItem.source = effectItem.source || {};
															effectItem.source[urlParameter] = {
																model: k,
																property: null,
																type: RouteSourceType.UrlParameter
															};
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
												let value =
													effectItem.source && effectItem.source[urlParameter]
														? effectItem.source[urlParameter].model
														: null;
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
															effectItem.source = effectItem.source || {};
															effectItem.source[urlParameter] = {
																model,
																property: modelPropertyOption.id,
																type: RouteSourceType.Model
															};
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
												let value =
													effectItem.source && effectItem.source[urlParameter]
														? effectItem.source[urlParameter].model
														: null;
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
															effectItem.source = effectItem.source || {};
															effectItem.source[urlParameter] = {
																model: agent,
																property: agentPropertyOption.id,
																type: RouteSourceType.Agent
															};
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
								innerStyle={{ maxHeight: `calc(100vh - 325px)`, overflowY: 'auto' }}
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
												if (
													agent &&
													effectItem &&
													model &&
													MethodFunctions[c] &&
													MethodFunctions[c].titleTemplate
												) {
													effectItem.name =
														effectItem.name ||
														`${MethodFunctions[c].titleTemplate(
															UIA.GetNodeTitle(model),
															UIA.GetNodeTitle(agent)
														)} For ${viewType}`;
												}
											}
											effectItem.methodDescription = methodDescription;
											this.setState({ turn: UIA.GUID() });
										}}
										label={Titles.FunctionTypes}
										value={methodDescription ? methodDescription.functionType : null}
										options={GetFunctionTypeOptions()}
									/>
								</TreeViewItemContainer>
								<TreeViewButtonGroup>
									<TreeViewGroupButton
										icon="fa fa-amazon"
										onClick={() => {
											if (methodDescription) {
												effectItem.name = `${MethodFunctions[
													methodDescription.functionType
												].titleTemplate(
													UIA.GetNodeTitle(model),
													UIA.GetNodeTitle(agent)
												)} For ${viewType}`;

												this.setState({ turn: UIA.GUID() });
											}
										}}
									/>
									<TreeViewGroupButton
										icon="fa fa-sitemap"
										title={'Auto generate, permissions, validations, filters'}
										onClick={() => {
											if (effectItem.permissions) {
												effectItem.permissions.forEach((permission: PermissionConfig) => {
													autoNameGenerateDataChain(
														permission,
														effectItem,
														DataChainType.Permission,
														mode.methods,
														null,
														true
													);
												});
											}
											if (effectItem.validations) {
												effectItem.validations.forEach((validation: ValidationConfig) => {
													autoNameGenerateDataChain(
														validation,
														effectItem,
														DataChainType.Validation,
														mode.methods,
														null,
														true
													);
												});
											}
											if (effectItem.filters) {
												effectItem.filters.forEach((filter: FilterConfig) => {
													autoNameGenerateDataChain(
														filter,
														effectItem,
														DataChainType.Filter,
														mode.methods,
														null,
														true
													);
												});
											}
											if (effectItem.executions) {
												effectItem.executions.forEach((executionConfig: ExecutionConfig) => {
													if (methodDescription) {
														autoNameExecutionConfig(
															executionConfig,
															viewType,
															effectItem,
															methodDescription,
															effectItem.name,
															mode.methods,
															true
														);
													}
												});
											}
											this.setState({ turn: UIA.GUID() });
										}}
									/>
								</TreeViewButtonGroup>
								<MountingItemConfig mountingDescription={effectItem} />
								<TreeViewMenu
									title={'Screen to API'}
									hide={(!parameterConnections || !parameterConnections.length) && !bodyParameter}
									open={this.state.screenToApi}
									active
									onClick={() => {
										this.setState({ screenToApi: !this.state.screenToApi });
									}}
								>
									{bodyParameter}
									{parameterConnections}
								</TreeViewMenu>
								<StaticParametersComponent agent={agent} mountingItem={effectItem} />
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
								<PermissionComponent
									agent={agent}
									mountingItem={effectItem}
									methods={mode.methods}
									onContext={(msg: { largerPlease: boolean }) => {
										if (msg) this.setState({ pLarger: msg.largerPlease });
									}}
									methodDescription={effectItem.methodDescription}
								/>
								<ValidationComponent
									agent={agent}
									mountingItem={effectItem}
									onContext={(msg: { largerPlease: boolean }) => {
										if (msg) this.setState({ vLarger: msg.largerPlease });
									}}
									methods={mode.methods}
									methodDescription={effectItem.methodDescription}
								/>
								<FilterComponent
									agent={agent}
									mountingItem={effectItem}
									onContext={(msg: { largerPlease: boolean }) => {
										if (msg) this.setState({ vLarger: msg.largerPlease });
									}}
									methods={mode.methods}
									methodDescription={effectItem.methodDescription}
								/>
								<FilterItemsComponent
									agent={agent}
									mountingItem={effectItem}
									onContext={(msg: { largerPlease: boolean }) => {
										if (msg) this.setState({ vLarger: msg.largerPlease });
									}}
									methods={mode.methods}
									methodDescription={effectItem.methodDescription}
								/>
								<ExecutionComponent
									agent={agent}
									mountingItem={effectItem}
									methods={mode.methods}
									onContext={(msg: { largerPlease: boolean }) => {
										if (msg) this.setState({ eLarger: msg.largerPlease });
									}}
									methodDescription={effectItem.methodDescription}
								/>
								<AfterEffectsComponent
									agent={agent}
									mountingItem={effectItem}
									onContext={(msg: { largerPlease: boolean }) => {
										if (msg) this.setState({ aLarger: msg.largerPlease });
									}}
									methods={mode.methods}
									afterEffects={effectItem.afterEffects}
									methodDescription={effectItem.methodDescription}
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
		const exit = () => {
			this.props.setVisual(UIA.EFFECT_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const display = UIA.Visual(state, UIA.EFFECT_CONTEXT_MENU) ? 'block' : 'none';
		const nodeType = UIA.Visual(state, UIA.EFFECT_CONTEXT_MENU)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.EFFECT_CONTEXT_MENU) || {};
		const currentInfo = this.getCurrentInfo(menuMode);
		const menuitems = this.getMenuMode(menuMode);
		const defaultMenus = this.getDefaultMenu(menuMode);
		const large =
			this.state.large || this.state.pLarger || this.state.vLarger || this.state.aLarger || this.state.eLarger;
		const menu_width = large ? 755 : 350;
		let icon_expando: any = {
			fontSize: `1.4rem`,
			paddingLeft: 5,
			top: -2,
			position: 'relative'
		};
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
						left: 500,
						transition: `width 1s ease 0s`
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
							<button
								type="button"
								onClick={() => {
									this.setState({ large: !this.state.large });
								}}
								className="close"
								data-dismiss="modal"
								aria-label="Expand"
							>
								<span aria-hidden="true">
									<i className={large ? 'fa  fa-compress' : 'fa  fa-expand'} style={icon_expando} />
								</span>
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

export default UIConnect(EffectContextMenu);
