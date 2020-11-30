// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
import SelectInput from './selectinput';
import { UIConnect } from '../utils/utils';
import {
	REMOVE_LINK_BETWEEN_NODES,
	CHANGE_NODE_PROPERTY,
	ADD_LINK_BETWEEN_NODES,
	LinkProperties,
	GetNodeProp,
	GUID
} from '../actions/uiActions';
import { NodeProperties } from '../constants/nodetypes';
import TreeViewMenu from './treeviewmenu';
import TreeViewItemContainer from './treeviewitemcontainer';
import CheckBox from './checkbox';

export default class MountingItemConfig extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let { state, value, model, valueObj } = this.props;
		let currentNode = this.props.node;
		if (typeof valueObj === 'object') {
			value = valueObj;
		}
		let { mountingDescription } = this.props;
		return (
			<TreeViewMenu
				title={'Method Props'}
				open={this.state.methodProps}
				active
				onClick={() => {
					this.setState({ methodProps: !this.state.methodProps });
				}}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.ExcludeFromController}
						onChange={(value: boolean) => {
							mountingDescription.excludeFromController = value;
							this.setState({ turn: GUID() });
						}}
						value={mountingDescription.excludeFromController}
					/>
				</TreeViewItemContainer>
			</TreeViewMenu>
		);
	}
}
