// @flow
import React, { Component } from 'react';
import TreeViewMenu from './treeviewmenu';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';
import * as Titles from './titles';
import { GUID, NodeTypes, GetNodeTitle } from '../actions/uiActions';
import CheckBox from './checkbox';
import { NodesByType, GetNodesLinkedTo } from '../methods/graph_methods';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';
import SelectInput from './selectinput';
import ComponentStyle from './componentstyle';
export default class ComponentStyleComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let componentStyle: ComponentStyle = this.props.componentStyle;
		let parentId: string = this.props.parentId;
		return (
			<TreeViewMenu
				open={this.state.open}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={
					`${GetNodeTitle(componentStyle.componentApi)}: ${GetNodeTitle(componentStyle.styleComponent)}` ||
					Titles.ComponentType
				}
			>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.ComponentApi}
						options={GetNodesLinkedTo(this.props.state, {
							id: parentId,
							componentType: NodeTypes.ComponentApi
						}).toNodeSelect()}
						value={componentStyle.componentApi}
						onChange={(value: string) => {
							componentStyle.componentApi = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Style}
						options={GetNodesLinkedTo(this.props.state, {
							id: parentId,
							componentType: NodeTypes.Style
						}).toNodeSelect()}
						value={componentStyle.styleComponent}
						onChange={(value: string) => {
							componentStyle.styleComponent = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.ComponentApi}
						value={componentStyle.onComponent}
						onChange={(value: boolean) => {
							componentStyle.onComponent = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
        <TreeViewItemContainer>
					<CheckBox
						label={Titles.Negate}
						value={componentStyle.negate}
						onChange={(value: boolean) => {
							componentStyle.negate = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.RemoveScrenEffect}`}
						onClick={() => {
							if (this.props.onDelete) {
								this.props.onDelete();
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
						}}
						icon="fa fa-minus"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
