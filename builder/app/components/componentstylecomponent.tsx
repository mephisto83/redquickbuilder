// @flow
import React, { Component } from 'react';
import TreeViewMenu from './treeviewmenu';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';
import * as Titles from './titles';
import { GUID, NodeTypes } from '../actions/uiactions';
import CheckBox from './checkbox';
import { NodesByType } from '../methods/graph_methods';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';
import SelectInput from './selectinput';
export default class ComponentStyleComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
	}
	render() {
    let componentStyle = this.props.componentStyle;
		return (
			<TreeViewMenu
				open={this.state.open}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={componentStyle.name || Titles.ComponentType}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={componentStyle.name}
						onChange={(value: string) => {
							componentStyle.name = value;
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
						label={Titles.DeepDownTree}
						value={componentStyle.passDeep}
						onChange={(value: boolean) => {
							componentStyle.passDeep = value;
							this.setState({
								turn:  GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.DataChain}
						options={NodesByType(null, NodeTypes.DataChain).toNodeSelect()}
						value={componentStyle.dataChain}
						onChange={(value: string) => {
							componentStyle.dataChain = value;
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
