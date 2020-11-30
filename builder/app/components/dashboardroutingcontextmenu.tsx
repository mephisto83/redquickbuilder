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
	MountingDescription
} from '../interface/methodprops';
import SelectInput from './selectinput';
import { ViewTypes } from '../constants/viewtypes';
import routes from '../constants/routes';
import TextInput from './textinput';
import { Node } from '../methods/graph_types';
import { MethodFunctions } from '../constants/functiontypes';
import { GetNodesByProperties, NodesByType } from '../methods/graph_methods';
import CheckBox from './checkbox';
import StaticParametersComponent from './staticparameterscomponent';
import RoutingInput from './routinginput';

const MAX_CONTENT_MENU_HEIGHT = 500;
class DashboardRoutingContextMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			deleteType: {}
		};
	}

	getDefaultMenu(mode: any) {
		const { state } = this.props;
		const graph = UIA.GetCurrentGraph(state);
		let routing: Routing = mode.routing;
		let callback: any = mode.callback;
		let agent: string = mode.agent;
		return (
			<TreeViewButtonGroup>
				<TreeViewGroupButton
					title={`${Titles.DeleteAllSelected}(${graph ? graph.selected : '0'})`}
					onClick={() => {
						routing.routes.push({
							id: UIA.GUID(),
							model: '',
							agent,
							name: '',
							viewType: ViewTypes.Get
						});
						if (callback) {
							callback(routing);
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
		let routing: Routing = mode.routing;
		let onComponentMountMethod: ViewMounting = mode.onComponentMountMethod;
		let sourceAgent = mode.agent;
		let sourceModel = mode.model;
		let callback: any = mode.callback;
		if (routing) {
			const exit = () => {
				this.props.setVisual(UIA.DASHBOARD_ROUTING_CONTEXT_MENU, null);
			};
			let models = UIA.NodesByType(this.props.state, UIA.NodeTypes.Model).toNodeSelect();
			let agents = UIA.NodesByType(this.props.state, UIA.NodeTypes.Model)
				.filter(
					(x: Node) =>
						UIA.GetNodeProp(x, NodeProperties.IsAgent) && !UIA.GetNodeProp(x, NodeProperties.IsUser)
				)
				.toNodeSelect();
			switch (mode) {
				default:
					routing.routes.forEach((route: RouteDescription, index: number) => {
						let routeKey = `dashboard-routing-${index}`;
						let { name, model, agent, viewType } = route;
						let viewMounting: ViewMounting =
							agent && model
								? mode.getMountingDescription(agent, model, route.isDashboard ? null : route.viewType)
								: null;
						let sourceViewMounting: ViewMounting =
							agent && model
								? mode.getMountingDescription(sourceAgent, mode.dashboard, mode.viewType)
								: null;
						let parameterConnections: any = null;
						if (onComponentMountMethod && viewMounting) {
							parameterConnections = this.getViewMountingDescriptionParameters(
								viewMounting
							).map((urlParameter: string, index: number) => {
								let routeKey = `url-param-${urlParameter}-${index}`;
								let agentPropertyOptions: Node[] = UIA.GetModelCodeProperties(sourceAgent);
								let modelPropertyOptions: Node[] = UIA.GetModelCodeProperties(sourceModel);
								let value = UIA.ensureRouteSource(route, urlParameter);
								// let value = route.source ? route.source.model : null;
								let sourceParameters =
									this.getViewMountingDescriptionParameters(sourceViewMounting) || [];
								let options = [
									...sourceParameters
										.filter(this.filterFunctionParameters(onComponentMountMethod))
										.map((k: string) => {
											return (
												<TreeViewMenu
													title={k}
													icon={value !== k ? 'fa fa-square-o' : 'fa fa-square'}
													onClick={() => {
														// route.source = {
														// 	model: k,
														// 	property: null,
														// 	type: RouteSourceType.UrlParameter
														// };
														UIA.setRouteSource(
															route,
															urlParameter,
															k,
															RouteSourceType.UrlParameter
														);

														callback(routing);
														this.setState({ turn: UIA.GUID() });
													}}
													key={`url-parma-k-${k}`}
												/>
											);
										}),
									!sourceModel ? null : (
										<TreeViewMenu
											icon={value !== sourceModel ? 'fa fa-square-o' : 'fa fa-square'}
											title={`${UIA.GetNodeTitle(sourceModel)}(model)`}
											active
											key={`url-parma-k-modle`}
											open={this.state[`${sourceModel}-model`]}
											toggle={() => {
												this.setState({
													[`${sourceModel}-model`]: !this.state[`${sourceModel}-model`]
												});
											}}
										>
											{modelPropertyOptions.map((modelPropertyOption: Node) => {
												// let value = route.source ? route.source.property : null;
												let value = UIA.ensureRouteSource(route, urlParameter, 'property');
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
															// route.source = {
															// 	model: sourceModel,
															// 	property: modelPropertyOption.id,
															// 	type: RouteSourceType.Model
															// };
															UIA.setRouteSource(
																route,
																urlParameter,
																sourceModel,
																RouteSourceType.Model,
																modelPropertyOption.id
															);
															callback(routing);
															this.setState({ turn: UIA.GUID() });
														}}
														key={`url-parsma-k-${modelPropertyOption.id}`}
													/>
												);
											})}
										</TreeViewMenu>
									),
									!sourceAgent ? null : (
										<TreeViewMenu
											icon={value !== sourceAgent ? 'fa fa-square-o' : 'fa fa-square'}
											open={this.state[sourceAgent]}
											active
											toggle={() => {
												this.setState({ [sourceAgent]: !this.state[sourceAgent] });
											}}
											title={`${UIA.GetNodeTitle(sourceAgent)}(agent)`}
											key={`url-parma-k-genta`}
										>
											{agentPropertyOptions.map((agentPropertyOption: Node) => {
												let value = UIA.ensureRouteSource(route, urlParameter, 'property');
												// let value = route.source ? route.source.property : null;
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
															// route.source = {
															// 	model: agent,
															// 	property: agentPropertyOption.id,
															// 	type: RouteSourceType.Agent
															// };
															UIA.setRouteSource(
																route,
																urlParameter,
																agent,
																RouteSourceType.Agent,
																agentPropertyOption.id
															);
															callback(routing);
															this.setState({ turn: UIA.GUID() });
														}}
														key={`url-parma-k-${agentPropertyOption.id}`}
													/>
												);
											})}
										</TreeViewMenu>
									)
								].filter((x: any) => x);
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
								{agent && model && !viewMounting ? (
									<TreeViewMenu error title={Titles.NoUIForRoute} />
								) : null}
								<TreeViewItemContainer>
									<TextInput
										label={Titles.Name}
										checkError={(value: string) => {
											let outState = mode.outState;
											if (outState) {
												let { agentMethod } = outState;
											}
										}}
										onChange={(value: string) => {
											route.name = value;
											this.setState({ turn: UIA.GUID() });
										}}
										value={route.name}
									/>
								</TreeViewItemContainer>
								{viewType !== ViewTypes.GetAll ? null : (
									<TreeViewItemContainer>
										<CheckBox
											label={Titles.OnItemSelection}
											onChange={(value: boolean) => {
												route.isItemized = value;
												this.setState({ turn: UIA.GUID() });
											}}
											value={route.isItemized}
										/>
									</TreeViewItemContainer>
								)}
								<TreeViewItemContainer>
									<CheckBox
										label={Titles.Dashboard}
										onChange={(value: boolean) => {
											route.isDashboard = value;
											this.setState({ turn: UIA.GUID() });
										}}
										value={route.isDashboard}
									/>
								</TreeViewItemContainer>
								{route.isDashboard ? null : (
									<TreeViewItemContainer>
										<SelectInput
											options={models}
											label={Titles.Model}
											onChange={(value: string) => {
												route.model = value;
												this.setState({ turn: UIA.GUID() });
											}}
											value={route.model}
										/>
									</TreeViewItemContainer>
								)}

								<TreeViewItemContainer>
									<SelectInput
										options={agents}
										label={Titles.Agents}
										onChange={(value: string) => {
											route.agent = value;
											this.setState({ turn: UIA.GUID() });
										}}
										value={route.agent}
									/>
								</TreeViewItemContainer>

								{!route.isDashboard ? null : (
									<TreeViewItemContainer>
										<SelectInput
											options={GetNodesByProperties(
												{
													[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
													[NodeProperties.IsDashboard]: true
												},
												UIA.GetCurrentGraph()
											).toNodeSelect()}
											label={Titles.Dashboard}
											onChange={(value: string) => {
												route.dashboard = value;
												this.setState({ turn: UIA.GUID() });
											}}
											value={route.dashboard}
										/>
									</TreeViewItemContainer>
								)}
								{route.isDashboard ? null : (
									<TreeViewItemContainer>
										<SelectInput
											options={Object.keys(ViewTypes).map((c) => ({ title: c, value: c }))}
											label={Titles.ViewTypes}
											onChange={(value: string) => {
												route.viewType = value;
												this.setState({ turn: UIA.GUID() });
											}}
											value={route.viewType}
										/>
									</TreeViewItemContainer>
								)}
								{parameterConnections}

								<StaticParametersComponent agent={agent} mountingItem={route} />
								<TreeViewButtonGroup>
									<TreeViewGroupButton
										onClick={() => {
											if (callback) {
												let update = routing.routes.find((x) => x.id === route.id);
												if (update) {
													// update.viewType = this.state.viewType || viewType;
													// update.model = this.state.model || model;
													// update.name = this.state.name || name;
													if (callback) {
														callback(routing);
													}
												}
											}
										}}
										icon="fa fa-save"
									/>
									<TreeViewGroupButton
										onClick={() => {
											routing.routes.splice(index, 1);
											if (callback) {
												callback(routing);
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
	private filterMethodDescriptionFunctionParameters(
		methodDescription: MethodDescription
	): (value: string, index: number, array: string[]) => boolean {
		return (x: string) => {
			let { parameters } = MethodFunctions[methodDescription.functionType];
			if (parameters && parameters.parameters) {
				if (parameters && parameters.parameters && parameters.parameters.template) {
					return !!parameters.parameters.template[x];
				}
			}
			return false;
		};
	}
	private getViewMountingDescriptionParameters(viewMounting: ViewMounting): any[] {
		let result: string[] = [];
		if (viewMounting && viewMounting.mountings)
			viewMounting.mountings.forEach((mounting: MountingDescription) => {
				if (mounting.methodDescription) {
					let parameters = this.getMethodDescriptionParameters(mounting.methodDescription);
					result.push(...parameters);
				}
			});
		return result;
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
	private filterFunctionParameters(
		viewMounting: ViewMounting
	): (value: string, index: number, array: string[]) => boolean {
		return (x: string) => {
			return (
				viewMounting &&
				viewMounting.mountings &&
				!!viewMounting.mountings.find((mounting: MountingDescription) => {
					if (mounting && mounting.methodDescription) {
						let { parameters } = MethodFunctions[mounting.methodDescription.functionType];
						if (parameters && parameters.parameters) {
							if (parameters && parameters.parameters && parameters.parameters.template) {
								return !!parameters.parameters.template[x];
							}
						}
					}
					return false;
				})
			);
		};
	}

	render() {
		const { state } = this.props;
		const exit = () => {
			this.props.setVisual(UIA.DASHBOARD_ROUTING_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const display = UIA.Visual(state, UIA.DASHBOARD_ROUTING_CONTEXT_MENU) ? 'block' : 'none';
		const nodeType = UIA.Visual(state, UIA.DASHBOARD_ROUTING_CONTEXT_MENU)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.DASHBOARD_ROUTING_CONTEXT_MENU) || {};
		const currentInfo = this.getCurrentInfo(menuMode);
		const menuitems = this.getMenuMode(menuMode);
		const defaultMenus = this.getDefaultMenu(menuMode);
		const large =
			this.state.large || this.state.pLarger || this.state.vLarger || this.state.aLarger || this.state.eLarger;
		const menu_width = large ? 1000 : 350;
		let icon_expando: any = {
			fontSize: `1.4rem`,
			paddingLeft: 5,
			top: -2,
			position: 'relative'
		};
		return (
			<Draggable handle=".draggable-header,.draggable-footer">
				<div
					className="context-menu modal-dialog modal-success"
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
							</button>{' '}
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
										<RoutingInput
											agent={menuMode.agent}
											viewType={menuMode.viewType}
                      model={menuMode.model}
                      routing={menuMode.routing}
											onNewRoutes={(newRoutes: RouteDescription[]) => {
												let routing: Routing = menuMode.routing;
												routing.routes.length = 0;
												routing.routes.push(...newRoutes);

												menuMode.callback(routing);
												this.setState({ turn: UIA.GUID() });
											}}
										/>
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
					icon={'fa fa-square-o'}
					title={`${UIA.GetNodeTitle(dashboard)}/${UIA.GetNodeTitle(agent)}`}
				/>
			];
		}
		return null;
	}
}

export default UIConnect(DashboardRoutingContextMenu);
