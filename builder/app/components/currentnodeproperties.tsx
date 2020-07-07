// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import {
	NodeProperties,
	NodeTypes,
	LinkEvents,
	LinkType,
	LinkProperties,
	GroupProperties
} from '../constants/nodetypes';
import {
	addValidatator,
	TARGET,
	createEventProp,
	GetNode,
	GetLinkChain,
	GetLinkChainItem,
	createExecutor,
	GetLinkBetween
} from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';
import { DataChainContextMethods } from '../constants/datachain';
import { Node } from '../methods/graph_types';

class CurrentNodeProperties extends Component<any, any> {
	render() {
		var { state } = this.props;

		var currentNode: Node = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (!currentNode) {
			return <div />;
		}
		let selectedLink = UIA.Visual(state, UIA.SELECTED_LINK);

		let currentLink = selectedLink
			? GetLinkBetween(selectedLink.source, selectedLink.target, UIA.GetCurrentGraph())
			: null;
		let linkProperties = currentLink ? currentLink.properties : {};
		let nodeProperties = currentNode.properties || {};
		let nodePropertyVersions = currentNode.propertyVersions || {};
		return (
			<MainSideBar active={true} relative={true}>
				<SideBar style={{ paddingTop: 0 }}>
					<SideBarMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'CURRENT_NODE_PROPERTIES')}
							active={true}
							title={Titles.Properties}
							innerStyle={{ maxHeight: 600, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('CURRENT_NODE_PROPERTIES');
							}}
						>
							{Object.keys(nodeProperties).sort().map((key) => {
								return (
									<TreeViewMenu
										title={`${key}: ${JSON.stringify(nodeProperties[key])}`}
										key={`component-props-${key}`}
										hideArrow={true}
										onClick={() => {
											console.log(JSON.stringify(nodeProperties[key]));
											this.props.graphOperation([
												{
													operation: UIA.UPDATE_NODE_DIRTY,
													options: {
														id: currentNode.id,
														prop: key,
														value: !!!UIA.GetNodePropDirty(currentNode, key)
													}
												}
											]);
										}}
										icon={
											UIA.GetNodePropDirty(currentNode, key) ? 'fa fa-square' : 'fa fa-square-o'
										}
									/>
								);
							})}
						</TreeViewMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'CURRENT_NODE_PROPERTIES_VERSIONS')}
							active={true}
							title={`Versions`}
							innerStyle={{ maxHeight: 600, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('CURRENT_NODE_PROPERTIES_VERSIONS');
							}}
						>
							{Object.keys(nodeProperties).sort().map((key) => {
								return (
									<TreeViewMenu
										title={`${key}: ${JSON.stringify(nodePropertyVersions[key])}`}
										key={`component-props-${key}`}
										hideArrow={true}
										onClick={() => {
											console.log(JSON.stringify(nodePropertyVersions[key]));
										}}
										icon={
											UIA.GetNodePropDirty(currentNode, key) ? 'fa fa-square' : 'fa fa-square-o'
										}
									/>
								);
							})}
						</TreeViewMenu>

						<TreeViewMenu
							open={UIA.Visual(state, 'CURRENT_LINK_PROPERTIES')}
							active={true}
							title={Titles.LinkProperties}
							innerStyle={{ maxHeight: 600, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('CURRENT_LINK_PROPERTIES');
							}}
						>
							{Object.keys(linkProperties).sort().map((key) => {
								return (
									<TreeViewMenu
										title={`${key}: ${JSON.stringify(linkProperties[key])}`}
										key={`link-props-${key}`}
										hideArrow
										onClick={() => {
											console.log(JSON.stringify(linkProperties[key], null, 4));
										}}
										icon="fa fa-square-o"
									/>
								);
							})}
						</TreeViewMenu>
					</SideBarMenu>
				</SideBar>
			</MainSideBar>
		);
	}
}

export default UIConnect(CurrentNodeProperties);
