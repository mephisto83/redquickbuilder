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
import { NodeProperties } from '../constants/nodetypes';
import GenericPropertyContainer from './genericpropertycontainer';
import _create_get_view_model from '../nodepacks/_create_get_view_model';
import TreeViewMenu from './treeviewmenu';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewItemContainer from './treeviewitemcontainer';

const MAX_CONTENT_MENU_HEIGHT = 500;
class ContextMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			deleteType: {}
		};
	}

	getDefaultMenu() {
		const { state } = this.props;
		const graph = UIA.GetCurrentGraph(state);
		return (
			<TreeViewButtonGroup>
				<TreeViewGroupButton
					title={`${Titles.DeleteAllSelected}(${graph ? graph.selected : '0'})`}
					onClick={() => {
					}}
					icon="fa fa-plus"
				/>
			</TreeViewButtonGroup>
		);
	}

	getMenuMode(mode: any) {
		const result = [];
		const exit = () => {
			this.props.setVisual(UIA.ROUTING_CONTEXT_MENU, null);
		};
		switch (mode) {
			default:
				result.push(<TreeViewMenu open active title={Titles.Layout} toggle={() => {}} />);
				break;
		}
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
		const defaultMenus = this.getDefaultMenu();
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
				<TreeViewMenu
					key={'current-agent'}
					icon={'fa fa-square-o'}
					title={`${UIA.GetNodeTitle(agent)}`}
				/>,
				<TreeViewMenu
					key={'current-model'}
					icon={'fa fa-square-o'}
					title={`${UIA.GetNodeTitle(model)}`}
				/>
			];
		}
		return null;
	}
}

export default UIConnect(ContextMenu);
