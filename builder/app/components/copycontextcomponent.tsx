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
	MountingDescription,
	setDefaultRouteSource
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
import ScreenEffectsComponent from './screenEffectsComponent';
import AfterEffectsComponent from './aftereffectscomponent';
import MountingItemConfig from './mountingitemconfig';
import ExecutionComponent from './executioncomponent';
import ValidationComponent from './validationcomponent';
import FilterComponent from './filtercomponent';
import FilterItemsComponent from './filteritemscomponent';
import PermissionComponent from './permissioncomponent';

class CopyContextComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	getMenuMode(mode: any) {
		const result: any = [];
		let mounting: ViewMounting = mode.mounting;

		let callback: any = mode.callback;
		if (mounting) {
			const exit = () => {
				this.props.setVisual(UIA.MOUNTING_CONTEXT_MENU, null);
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
					break;
			}
		}
		return result;
	}
	getMenuItems() {
		return [];
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
		let menuitems = this.getMenuItems();
		return (
			<Draggable handle=".draggable-header,.draggable-footer">
				<div
					className="context-menu modal-dialog modal-danger"
					style={{
						zIndex: 1000,
						position: 'fixed',
						width: 500,
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
										{menuitems}
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

export default UIConnect(CopyContextComponent);
