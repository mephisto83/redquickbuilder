// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties, NodeTypes, LinkEvents, LinkType, LinkProperties } from '../constants/nodetypes';
import {
	addValidatator,
	TARGET,
	createEventProp,
	GetNode,
	GetLinkChain,
	GetLinkChainItem,
	createExecutor
} from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';

class ModelFilterItemActivityMenu extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ModelItemFilter);
		if (!active) {
			return <div />;
		}
		var propertyNodes = [];
		var graph = UIA.GetCurrentGraph(state);
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (currentNode) {
			var methodNode = GetLinkChainItem(state, {
				id: currentNode.id,
				links: [
					{
						direction: TARGET,
						type: LinkType.ModelItemFilter
					}
				]
			});
			var node = null;
			var methodProps = UIA.GetMethodProps(methodNode);
			if (methodProps) {
				switch (UIA.GetFunctionType(methodNode)) {
					case FunctionTypes.Get_ManyToMany_Agent_Value__IListChild:
						node = GetNode(graph, methodProps[FunctionTemplateKeys.ManyToManyModel]);
						break;
					case FunctionTypes.Create_Object_Agent_Value__IListObject:
					case FunctionTypes.Get_Parent$Child_Agent_Value__IListChild:
					case FunctionTypes.Create_Parent$Child_Agent_Value__IListChild:
					case FunctionTypes.Create_Parent_Child_Agent_Value__Child:
					default:
						node = GetNode(
							graph,
							methodProps[FunctionTemplateKeys.ModelOutput] || methodProps[FunctionTemplateKeys.Model]
						);
						break;
				}
			}
			if (node) {
				let property_nodes = UIA.GetModelPropertyChildren(node.id);
				propertyNodes = [ ...property_nodes.toNodeSelect() ];
			}
		}
		return (
			<TabPane active={active}>
				{currentNode ? (
					<FormControl>
						<TextInput
							label={Titles.NodeLabel}
							value={UIA.GetNodeProp(currentNode, NodeProperties.UIText)}
							onChange={(value) => {
								this.props.graphOperation(UIA.CHANGE_NODE_TEXT, { id: currentNode.id, value });
							}}
						/>
						<TextInput
							label={Titles.NodeType}
							value={UIA.GetNodeProp(currentNode, NodeProperties.NODEType)}
							disabled={true}
						/>
						<SelectInput
							options={propertyNodes}
							defaultSelectText={Titles.SelectProperty}
							label={Titles.Property}
							onChange={(value) => {
								var id = currentNode.id;
								let filterModel =
									UIA.GetNodeProp(currentNode, NodeProperties.FilterModel) || createExecutor();
								filterModel = addValidatator(filterModel, { id: value });
								this.props.graphOperation([
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											id,
											prop: NodeProperties.FilterModel,
											value: filterModel
										}
									},
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											id,
											prop: NodeProperties.ModelItemFilter,
											value: node.id
										}
									}
								]);

								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: {
										...UIA.LinkProperties.ModelItemFilter,
										...createEventProp(LinkEvents.Remove, {
											function: 'OnRemoveModelFilterPropConnection'
										})
									}
								});
							}}
							value={''}
						/>
					</FormControl>
				) : null}
				<button
					type="submit"
					className="btn btn-primary"
					onClick={() => {
						this.props.graphOperation(UIA.NEW_CONDITION_NODE, {
							parent: UIA.Visual(state, UIA.SELECTED_NODE),
							groupProperties: {},
							linkProperties: {
								properties: { ...LinkProperties.ConditionLink }
							}
						});
					}}
				>
					{Titles.AddCondition}
				</button>
			</TabPane>
		);
	}
}

export default UIConnect(ModelFilterItemActivityMenu);
