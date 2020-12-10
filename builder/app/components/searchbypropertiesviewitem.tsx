// @flow
import React, { Component } from 'react';

import TreeViewMenu from './treeviewmenu';
import TextInput from './textinput';
import FormControl from './formcontrol';
import * as Titles from './titles';
import { NodeProperties } from '../constants/nodetypes';
import TreeViewItemContainer from './treeviewitemcontainer';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';

export default class SearchByPropertiesViewItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			filter: ''
		};
	}
	render() {
		let item: SearchPropertyViewItem = this.props.item;
		return (
			<TreeViewMenu
				title={`${item.property}: ${item.excludedProperty ? 'excluded' : item.value}`}
				icon={'fa fa-object-group'}
				open={this.state.open}
				active
				onClick={() => {
					this.setState({ open: !this.state.open })
				}}
			>
				<TreeViewItemContainer>
					<SelectInput
						title={'Property'}
						label={'Property'}
						options={Object.keys(NodeProperties).map((x) => ({
							title: x,
							value: NodeProperties[x],
							id: NodeProperties[x]
						}))}
						onChange={(val: string) => {
							item.property = val
							this.setState({ property: val })
						}}
						value={item.property}
					/>
				</TreeViewItemContainer>{item.excludedProperty ? null :
					<FormControl sidebarform={true}>
						<TextInput
							value={item.value}
							immediate={false}
							onChange={(v: string) => {
								item.value = v;
								this.setState({ value: v })
							}}
							inputgroup={true}
							placeholder={Titles.Filter}
						/>
					</FormControl>}
				<TreeViewItemContainer>
					<CheckBox
						title={'Not In Properties'}
						label={'Not In Properties'}
						onChange={(val: boolean) => {
							item.excludedProperty = val;
							this.setState({ excludedProperty: val })
						}}
						value={item.excludedProperty}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`Remove`}
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
export interface SearchPropertyViewItem {
	property: string;
	excludedProperty: boolean
	value: string;
	id: string
}