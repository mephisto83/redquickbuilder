// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import SelectInput from './selectinput';
import TreeViewMenu from './treeviewmenu';
import { StretchPath, StretchPathItem, CreateStretchPathItem } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { Node } from '../methods/graph_types';
import TreeViewItem from './treeviewitem';
import { NodesByType } from '../methods/graph_methods';
import TextInput from './textinput';

class StretchPathComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let ok = this.props.show;
		if (!ok) {
			return <span />;
		}
		let props: any = this.props;
		let {
			stretch
		}: {
			stretch: StretchPath;
		} = props;
		if (!stretch) {
			return <span />;
		}

		let properties = UIA.GetModelPropertyChildren(this.state.model);
		let fromProperties =
			stretch.path && stretch.path.length
				? UIA.GetModelPropertyChildren(stretch.path[stretch.path.length - 1].model)
				: UIA.GetModelPropertyChildren(this.props.model) || [];
		let selectedProperty = stretch.path && stretch.path.length ? this.state.fromModel : this.props.property;
		return (
			<TreeViewMenu
				open={this.state.config}
				icon={this.props.valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ config: !this.state.config });
				}}
				active
				greyed={!this.props.enabled}
				title={Titles.Stretch}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={stretch.name}
						onChange={(val: string) => {
							stretch.name = val;
							this.setState({
								turn: UIA.GUID()
							});
						}}
					/>
				</TreeViewItemContainer>
				{stretch.path.map((pathItem: StretchPathItem, index: number) => {
					let prev = '';
					if (index) {
						prev = `${UIA.GetNodeTitle(stretch.path[index - 1].model)}.${UIA.GetNodeTitle(
							pathItem.fromProperty
						)} => `;
					}

					return (
						<TreeViewItem
							key={pathItem.id}
							icon={this.props.selected === pathItem.id ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
							title={`${prev} ${UIA.GetNodeTitle(pathItem.model)}.${UIA.GetNodeTitle(pathItem.property)}`}
							onClick={() => {
								this.setState({ selected: pathItem.id });
							}}
						/>
					);
				})}
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.FromProperty}
						options={fromProperties.toNodeSelect()}
						value={selectedProperty}
						onChange={(value: string) => {
							this.setState({
								fromModel: value,
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Model}
						options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Model).toNodeSelect()}
						value={this.state.model}
						onChange={(value: string) => {
							this.setState({
								model: value,
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer hide={!!!this.state.model}>
					<SelectInput
						label={Titles.Property}
						options={properties.toNodeSelect()}
						value={this.state.property}
						onChange={(value: string) => {
							this.setState({
								property: value,
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						onClick={() => {
							if (this.state.model && this.state.property) {
								if (properties.find((v: Node) => v.id === this.state.property)) {
									let stretchItem = CreateStretchPathItem(
										this.state.model,
										this.state.property,
										this.state.fromModel
									);
									stretch.path.push(stretchItem);
									this.setState({
										turn: UIA.GUID()
									});
								}
							}
						}}
						icon="fa fa-plus"
					/>
					<TreeViewGroupButton
						hide={!this.state.selected}
						onClick={() => {
							stretch.path = stretch.path.filter((v) => v.id !== this.state.selected);
							this.setState({
								turn: UIA.GUID(),
								selected: null
							});
						}}
						icon="fa fa-minus"
					/>
					<TreeViewGroupButton
						hide={!this.state.selected}
						onClick={() => {
							let index = stretch.path.findIndex((v) => v.id !== this.state.selected);
							if (index != -1) {
								let item = stretch.path[index];
								stretch.path.splice(index, 1);
								stretch.path.splice(index - 1, 0, item);
							}
							this.setState({
								turn: UIA.GUID()
							});
						}}
						icon="fa  fa-arrow-circle-up"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}

export default UIConnect(StretchPathComponent);
