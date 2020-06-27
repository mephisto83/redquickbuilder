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
import { NodeProperties, LinkType, LinkPropertyKeys } from '../constants/nodetypes';
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
import { MethodFunctions, GetFunctionTypeOptions } from '../constants/functiontypes';

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
		let mounting: ViewMounting = mode.mounting;
		let callback: any = mode.callback;
		let model: string = mode.model;
		let agent: string = mode.agent;
		let viewType: string = mode.viewType;
		return (
			<TreeViewButtonGroup>
				<TreeViewGroupButton
					title={`${Titles.AddMountFunction}`}
					onClick={() => {
						mounting.mountings.push({
							id: UIA.GUID(),
							model,
							agent,
							name: '',
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
	getRoutingApi(routing: Routing) {}
	getMenuMode(mode: any) {
		const result: any = [];
		let mounting: ViewMounting = mode.mounting;

		let callback: any = mode.callback;
		if (mounting) {
			const exit = () => {
				this.props.setVisual(UIA.MOUNTING_CONTEXT_MENU, null);
			};
			let models = UIA.NodesByType(this.props.state, UIA.NodeTypes.Model).toNodeSelect();
			this.getRoutingApi(mode);
			switch (mode) {
				default:
					mounting.mountings.forEach((mountingItem: MountingDescription, index: number) => {
						let routeKey = `routing-${index}`;
						let { name, model, agent, viewType, methodDescription } = mountingItem;
						let parameterConnections: any = null;
						if (methodDescription) {
							parameterConnections = this.getMethodDescriptionParameters(methodDescription)
								.filter(this.filterFunctionParameters(methodDescription))
								.map((urlParameter: string, index: number) => {
									let routeKey = `url-param-${urlParameter}-${index}`;
									let agentPropertyOptions: Node[] = UIA.GetModelCodeProperties(agent);
									let modelPropertyOptions: Node[] = UIA.GetModelCodeProperties(model);
									let value = mountingItem.source ? mountingItem.source.model : null;
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
															mountingItem.source = {
																model: k,
																property: null,
																type: RouteSourceType.UrlParameter
															};
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
												let value = mountingItem.source ? mountingItem.source.property : null;
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
															mountingItem.source = {
																model,
																property: modelPropertyOption.id,
																type: RouteSourceType.Model
															};
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
												let value = mountingItem.source ? mountingItem.source.property : null;
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
															mountingItem.source = {
																model: agent,
																property: agentPropertyOption.id,
																type: RouteSourceType.Agent
															};
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
								{parameterConnections}
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
			this.props.setVisual(UIA.MOUNTING_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const display = UIA.Visual(state, UIA.MOUNTING_CONTEXT_MENU) ? 'block' : 'none';
		const nodeType = UIA.Visual(state, UIA.MOUNTING_CONTEXT_MENU)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.MOUNTING_CONTEXT_MENU) || {};
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
