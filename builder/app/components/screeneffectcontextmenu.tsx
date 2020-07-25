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
	ScreenEffectApi
} from '../interface/methodprops';
import SelectInput from './selectinput';
import { ViewTypes } from '../constants/viewtypes';
import routes from '../constants/routes';
import TextInput from './textinput';
import { Node } from '../methods/graph_types';
import { MethodFunctions, FunctionTemplateKeys, GetFunctionTypeOptions } from '../constants/functiontypes';
import CheckBox from './checkbox';
import ScreenEffectsComponent from './screenEffectsComponent';

const MAX_CONTENT_MENU_HEIGHT = 500;
class ScreenEffectContextMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			deleteType: {}
		};
	}

	getMenuMode(mode: any) {
		const result: any = [];
		let screenEffectApis: ScreenEffectApi[] = mode.screenEffectApis;
		if (screenEffectApis) {
			const exit = () => {
				this.props.setVisual(UIA.AGENT_SCREENEFFECT_CONTEXT_MENU, null);
			};

			switch (mode) {
				default:
					result.push(
						<ScreenEffectsComponent
							onChange={() => {
								if (mode && mode.callback) {
									mode.callback();
								}
							}}
							api
							screenEffects={screenEffectApis}
						/>
					);
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

	render() {
		const { state } = this.props;
		const exit = () => {
			this.props.setVisual(UIA.AGENT_SCREENEFFECT_CONTEXT_MENU, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const display = UIA.Visual(state, UIA.AGENT_SCREENEFFECT_CONTEXT_MENU) ? 'block' : 'none';
		const nodeType = UIA.Visual(state, UIA.AGENT_SCREENEFFECT_CONTEXT_MENU)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.AGENT_SCREENEFFECT_CONTEXT_MENU) || {};
		const currentInfo = this.getCurrentInfo(menuMode);
		const menuitems = this.getMenuMode(menuMode);
		return (
			<Draggable handle=".draggable-header,.draggable-footer">
				<div
					className="context-menu modal-dialog modal-warning"
					style={{
						zIndex: 1000,
						position: 'fixed',
						width: this.state.secondaryMenu ? 500 : 300,
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
									<GenericPropertyContainer
										active
										title="asdf"
										subTitle="afaf"
										nodeType={nodeType}
									>
										{currentInfo}
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
		let { model, viewType, agent } = menuMode;
		if (model && viewType && agent) {
			return [
				<TreeViewMenu
					key={'current-agent'}
					icon={'fa fa-square-o'}
					title={`${UIA.GetNodeTitle(model)}/${UIA.GetNodeTitle(agent)}/${viewType}`}
				/>
			];
		}
		return null;
	}
}

export default UIConnect(ScreenEffectContextMenu);
