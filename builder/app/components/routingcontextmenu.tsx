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
	MountingDescription
} from '../interface/methodprops';
import SelectInput from './selectinput';
import { ViewTypes } from '../constants/viewtypes';
import routes from '../constants/routes';
import TextInput from './textinput';
import { Node } from '../methods/graph_types';
import { MethodFunctions } from '../constants/functiontypes';
import { GetNodesByProperties } from '../methods/graph_methods';

const MAX_CONTENT_MENU_HEIGHT = 500;
class ContextMenu extends Component<any, any> {
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
	getRoutingApi(routing: Routing) {}
	getMenuMode(mode: any) {
		const result: any = [];
		let routing: Routing = mode.routing;
		let onComponentMountMethod: ViewMounting = mode.onComponentMountMethod;
		let sourceAgent = mode.agent;
		let sourceModel = mode.model;
		let callback: any = mode.callback;
		if (routing) {
			const exit = () => {
				this.props.setVisual(UIA.ROUTING_CONTEXT_MENU, null);
			};
			let models = UIA.NodesByType(this.props.state, UIA.NodeTypes.Model).toNodeSelect();
			this.getRoutingApi(mode);
			switch (mode) {
				default:
					routing.routes.forEach((route: RouteDescription, index: number) => {
						let routeKey = `routing-${index}`;
						let { name, model, agent, viewType } = route;
						let viewMounting: ViewMounting =
							agent && model ? mode.getMountingDescription(agent, model, viewType) : null;
						let sourceViewMounting: ViewMounting =
							agent && model
								? mode.getMountingDescription(sourceAgent, sourceModel, mode.viewType)
								: null;
						let parameterConnections: any = null;
						if (onComponentMountMethod && viewMounting) {
							parameterConnections = this.getViewMountingDescriptionParameters(
								viewMounting
							).map((urlParameter: string, index: number) => {
								let routeKey = `url-param-${urlParameter}-${index}`;
								let agentPropertyOptions: Node[] = UIA.GetModelCodeProperties(sourceAgent);
								let modelPropertyOptions: Node[] = UIA.GetModelCodeProperties(sourceModel);
								let value = route.source ? route.source.model : null;
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
														route.source = {
															model: k,
															property: null,
															type: RouteSourceType.UrlParameter
														};
														callback(routing);
														this.setState({ turn: UIA.GUID() });
													}}
													key={`url-parma-k-${k}`}
												/>
											);
										}),
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
											let value = route.source ? route.source.property : null;
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
														route.source = {
															model: sourceModel,
															property: modelPropertyOption.id,
															type: RouteSourceType.Model
														};
														callback(routing);
														this.setState({ turn: UIA.GUID() });
													}}
													key={`url-parsma-k-${modelPropertyOption.id}`}
												/>
											);
										})}
									</TreeViewMenu>,
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
											let value = route.source ? route.source.property : null;
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
														route.source = {
															model: agent,
															property: agentPropertyOption.id,
															type: RouteSourceType.Agent
														};
														callback(routing);
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
								{parameterConnections}
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
			this.props.setVisual(UIA.ROUTING_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const display = UIA.Visual(state, UIA.ROUTING_CONTEXT_MENU) ? 'block' : 'none';
		const nodeType = UIA.Visual(state, UIA.ROUTING_CONTEXT_MENU)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.ROUTING_CONTEXT_MENU) || {};
		const currentInfo = this.getCurrentInfo(menuMode);
		const menuitems = this.getMenuMode(menuMode);
		const defaultMenus = this.getDefaultMenu(menuMode);
		return (
			<Draggable handle=".draggable-header,.draggable-footer">
				<div
					className="context-menu modal-dialog modal-info"
					style={{
						zIndex: 1000,
						position: 'fixed',
						width: this.state.secondaryMenu ? 500 : 250,
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

export default UIConnect(ContextMenu);
