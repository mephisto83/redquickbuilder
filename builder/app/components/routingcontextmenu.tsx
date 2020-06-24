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
import { Routing, RouteDescription } from '../interface/methodprops';
import SelectInput from './selectinput';
import { ViewTypes } from '../constants/viewtypes';
import routes from '../constants/routes';
import TextInput from './textinput';

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
		return (
			<TreeViewButtonGroup>
				<TreeViewGroupButton
					title={`${Titles.DeleteAllSelected}(${graph ? graph.selected : '0'})`}
					onClick={() => {
						routing.routes.push({
							id: UIA.GUID(),
							model: '',
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
	getRoutingApi(routing: Routing) {

  }
	getMenuMode(mode: any) {
		const result: any = [];
		let routing: Routing = mode.routing;
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
						let { name, model, viewType } = route;
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
											this.setState({ name: value });
										}}
										value={this.state.name || name}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										options={models}
										label={Titles.Model}
										onChange={(value: string) => {
											this.setState({ model: value });
										}}
										value={this.state.model || model}
									/>
								</TreeViewItemContainer>

								<TreeViewItemContainer>
									<SelectInput
										options={Object.keys(ViewTypes).map((c) => ({ title: c, value: c }))}
										label={Titles.ViewTypes}
										onChange={(value: string) => {
											this.setState({ viewType: value });
										}}
										value={this.state.viewType || viewType}
									/>
								</TreeViewItemContainer>
								<TreeViewButtonGroup>
									<TreeViewGroupButton
										onClick={() => {
											if (callback) {
												let update = routing.routes.find((x) => x.id === route.id);
												if (update) {
													update.viewType = this.state.viewType || viewType;
													update.model = this.state.model || model;
													update.name = this.state.name || name;
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
		const { agent, model } = menuMode;
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
		let { model, agent } = menuMode;
		if (model && agent) {
			return [
				<TreeViewMenu key={'current-agent'} icon={'fa fa-square-o'} title={`${UIA.GetNodeTitle(agent)}`} />,
				<TreeViewMenu key={'current-model'} icon={'fa fa-square-o'} title={`${UIA.GetNodeTitle(model)}`} />
			];
		}
		return null;
	}
}

export default UIConnect(ContextMenu);
