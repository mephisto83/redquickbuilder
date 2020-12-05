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

	getMenuItems() {
		return [this.contextMenuTypes(), ...this.contextCopies()];
	}
	contextCopies() {
		let { state } = this.props;
		let copyContexts: UIA.CopyContext[] = UIA.Visual(state, UIA.COPY_CONTEXT) || [];
		return copyContexts.filter((v) => UIA.Visual(state, v.type)).map((copyContext: UIA.CopyContext) => {
			return (
				<TreeViewMenu
					active
					icon={copyContext.selected ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					greyed={!copyContext.selected}
					open={this.state[copyContext.id]}
					key={copyContext.id}
					title={`${copyContext.name || copyContext.id} [${UIA.GetNodeTitle(
						copyContext.model
					)}/ ${UIA.GetNodeTitle(copyContext.agent)}]`}
					onClick={() => {
						copyContext.selected = !copyContext.selected;
						this.setState({ turn: UIA.GUID() });
					}}
					onRightClick={() => {
						this.setState({ [copyContext.id]: !this.state[copyContext.id] });
					}}
				>
					<TreeViewItemContainer>
						<CheckBox
							label={Titles.Selected}
							value={copyContext.selected}
							onChange={(value: boolean) => {
								copyContext.selected = value;
								this.setState({ turn: UIA.GUID() });
							}}
						/>
					</TreeViewItemContainer>
					<TreeViewItemContainer>
						<CheckBox
							label={Titles.IgnoreAgents}
							value={copyContext.ignoreAgent}
							onChange={(value: boolean) => {
								copyContext.ignoreAgent = value;
								this.setState({ turn: UIA.GUID() });
							}}
						/>
					</TreeViewItemContainer>
					<TreeViewItemContainer>
						<CheckBox
							label={Titles.IgnoreModels}
							value={copyContext.ignoreModel}
							onChange={(value: boolean) => {
								copyContext.ignoreModel = value;
								this.setState({ turn: UIA.GUID() });
							}}
						/>
					</TreeViewItemContainer>
					<TreeViewItemContainer>
						<TextInput
							label={Titles.Name}
							onChange={(value: string) => {
								copyContext.name = value;
								this.setState({ turn: UIA.GUID() });
							}}
							value={copyContext.name}
						/>
					</TreeViewItemContainer>
				</TreeViewMenu>
			);
		});
	}
	contextMenuTypes() {
		let { state } = this.props;
		return (
			<TreeViewMenu
				active
				key={'context-menu-types'}
				title={Titles.CopyContexts}
				open={this.state.contextMenuTypesOpen}
				onClick={() => {
					this.setState({ contextMenuTypesOpen: !this.state.contextMenuTypesOpen });
				}}
			>
				{Object.keys(UIA.CopyType).map((key: string) => {
					return (
						<TreeViewItemContainer key={key}>
							<CheckBox
								label={key}
								value={UIA.Visual(state, key)}
								onChange={(value: boolean) => {
									this.props.setVisual(key, value);
								}}
							/>
						</TreeViewItemContainer>
					);
				})}
			</TreeViewMenu>
		);
	}
	render() {
		const { state } = this.props;
		const display = UIA.Visual(state, UIA.COPY_CONTEXT_MENU) ? 'block' : 'none';
		if (display === 'none')
			return <div></div>
			
		const exit = () => {
			this.props.setVisual(UIA.COPY_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const nodeType = UIA.Visual(state, UIA.COPY_CONTEXT_MENU)
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
							<button
								type="button"
								onClick={() => {
									this.props.clearCopyContext();
								}}
								className="btn btn-outline pull-right"
								data-dismiss="modal"
							>
								Clear
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
