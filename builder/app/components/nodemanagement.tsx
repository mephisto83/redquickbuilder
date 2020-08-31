// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';

import TreeViewMenu from './treeviewmenu';
import TextInput from './textinput';
import TreeViewItem from './treeviewitem';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import { NodeProperties, NodeTypes } from '../constants/nodetypes';
import TreeViewItemContainer from './treeviewitemcontainer';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import { NodesByType, GetNodesByProperties, GetNodeProp } from '../methods/graph_methods';

const NODE_MANAGEMENT_MENU = 'NODE_MANAGEMENT_MENU';
const NODE_MANAGEMENT = 'NODE_MANAGEMENT';
class NodeManagement extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			filter: ''
		};
	}
	toFilterString(node) {
		return `${UIA.GetNodeProp(node, NodeProperties.CodeName)} ${node.id} ${UIA.GetNodeProp(
			node,
			NodeProperties.UIText
		)} ${UIA.GetNodeProp(node, NodeProperties.NODEType)}`.toLowerCase();
	}
	render() {
		let me = this;
		let { state } = me.props;

		var graph = UIA.GetCurrentGraph(state);
		let filter = (this.state.filter || '').toLowerCase();
		let args: any = {};
		if (this.state.agent) {
			args[NodeProperties.Agent] = this.state.agent;
		}
		if (this.state.nodeType) {
			args[NodeProperties.NODEType] = this.state.nodeType;
		}

		let nodes_ = this.state.searchByProperties
			? GetNodesByProperties(args, graph).filter(
					(x) => UIA.GetNodeProp(x, NodeProperties.IsDashboard) === this.state.isDashboard
				)
			: UIA.GetNodes(state);
		if (this.state.isShared) {
			nodes_ = nodes_.filter((nod: any) => GetNodeProp(nod, NodeProperties.SharedComponent));
		}
		let groups = nodes_
			.filter((x) => {
				if (!filter || !x) {
					return false;
				}

				var str = this.toFilterString(x);
				return str.indexOf(filter) !== -1;
			})
			.groupBy((x) => UIA.GetNodeProp(x, NodeProperties.NODEType));
		let body = [];
		body = Object.keys(groups)
			.sort((a, b) => a.localeCompare(b))
			.filter((group) => groups[group].length)
			.map((group, gi) => {
				let groupKey = `NodeManagement-${group}`;
				let groupNodes = UIA.Visual(state, groupKey)
					? groups[group]
							.subset(0, 100)
							.sort((a, b) =>
								UIA.GetNodeProp(a, NodeProperties.UIText).localeCompare(
									UIA.GetNodeProp(b, NodeProperties.UIText)
								)
							)
							.map((gn, gni) => {
								return (
									<TreeViewMenu
										key={`node-${group}-${gi}-${gni}`}
										hideArrow={true}
										title={UIA.GetNodeProp(gn, NodeProperties.UIText)}
										icon={
											!UIA.GetNodeProp(gn, NodeProperties.Pinned) ? (
												'fa fa-circle-o'
											) : (
												'fa fa-check-circle-o'
											)
										}
										toggle={() => {
											this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
												prop: UIA.NodeProperties.Pinned,
												id: gn.id,
												value: !UIA.GetNodeProp(gn, NodeProperties.Pinned)
											});
										}}
									/>
								);
							})
					: [];
				return (
					<TreeViewMenu
						title={group}
						key={`node-${group}-${gi}`}
						icon="fa fa-dot-circle-o"
						open={UIA.Visual(state, groupKey)}
						innerStyle={{ maxHeight: 400, overflowY: 'auto' }}
						active={UIA.Visual(state, groupKey)}
						right={<span className="label label-primary ">{groups[group].length}</span>}
						toggle={() => {
							this.props.toggleVisual(groupKey);
						}}
					>
						{groupNodes}
					</TreeViewMenu>
				);
			});
		return (
			<TreeViewMenu
				title={`${Titles.Nodes} ${graph ? Object.keys(graph.visibleNodes || {}).length : ''}`}
				icon={'fa fa-object-group'}
				open={UIA.Visual(state, NODE_MANAGEMENT)}
				active={UIA.Visual(state, NODE_MANAGEMENT)}
				onClick={() => {
					this.props.toggleVisual(NODE_MANAGEMENT);
				}}
			>
				<TreeViewMenu
					icon="fa fa-dot-circle-o"
					title={Titles.Menu}
					open={UIA.Visual(state, NODE_MANAGEMENT_MENU)}
					active={UIA.Visual(state, NODE_MANAGEMENT_MENU)}
					onClick={() => {
						this.props.toggleVisual(NODE_MANAGEMENT_MENU);
					}}
				>
					<TreeViewMenu
						hideArrow={true}
						title={Titles.ClearPinned}
						icon={'fa fa-times'}
						onClick={() => {
							this.props.graphOperation(
								UIA.GetNodes(state)
									.filter((x) => UIA.GetNodeProp(x, NodeProperties.Pinned))
									.subset(0, 100)
									.map((node) => {
										return {
											operation: UIA.CHANGE_NODE_PROPERTY,
											options: {
												prop: UIA.NodeProperties.Pinned,
												id: node.id,
												value: false
											}
										};
									})
							);
						}}
					/>
				</TreeViewMenu>
				<TreeViewItemContainer>
					<CheckBox
						title={'Search By Properties'}
						label={'Search By Properties'}
						onChange={(val: boolean) => {
							this.setState({ searchByProperties: val });
						}}
						value={this.state.searchByProperties}
					/>
				</TreeViewItemContainer>
				{!this.state.searchByProperties ? null : (
					<TreeViewItemContainer>
						<SelectInput
							title={'Node Type'}
							label={'Node Type'}
							options={Object.keys(NodeTypes).map((x) => ({
								title: x,
								value: NodeTypes[x],
								id: NodeTypes[x]
							}))}
							onChange={(val: boolean) => {
								this.setState({ nodeType: val });
							}}
							value={this.state.nodeType}
						/>
					</TreeViewItemContainer>
				)}
				{!this.state.searchByProperties ? null : (
					<TreeViewItemContainer>
						<SelectInput
							title={Titles.Agents}
							label={Titles.Agents}
							options={GetNodesByProperties({ [NodeProperties.IsAgent]: true }, graph).toNodeSelect()}
							onChange={(val: boolean) => {
								this.setState({ agent: val });
							}}
							value={this.state.agent}
						/>
					</TreeViewItemContainer>
				)}
				{!this.state.searchByProperties ? null : (
					<TreeViewItemContainer>
						<CheckBox
							title={'Is Dashboard'}
							label={'Is Dashboard'}
							onChange={(val: boolean) => {
								this.setState({ isDashboard: val });
							}}
							value={this.state.isDashboard}
						/>
					</TreeViewItemContainer>
				)}
				<TreeViewItemContainer>
					<CheckBox
						title={'Is Shared'}
						label={'Is Shared'}
						onChange={(val: boolean) => {
							this.setState({ isShared: val });
						}}
						value={this.state.isShared}
					/>
				</TreeViewItemContainer>
				<FormControl sidebarform={true}>
					<TextInput
						value={this.state.filter}
						immediate={false}
						onChange={(value: any) => {
							this.setState({ filter: value });
						}}
						inputgroup={true}
						placeholder={Titles.Filter}
					/>
				</FormControl>
				{body}
			</TreeViewMenu>
		);
	}
}
export default UIConnect(NodeManagement);
