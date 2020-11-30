// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiActions';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import { GetLinkBetween } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { Node } from '../methods/graph_types';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TextInput from './textinput';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewItemContainer from './treeviewitemcontainer';
import { CommandCenter } from '../jobs/interfaces';

export default class CommandCenterConfiguration extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		var { state } = this.props;

		let commandCenter: CommandCenter = this.props.commandCenter;
		return (
			<TreeViewMenu
				open={this.state.open}
				active={true}
				title={`${commandCenter.commandCenterHost} ${commandCenter.commandCenterPort}`}
				innerStyle={{ maxHeight: 600, overflowY: 'auto' }}
				toggle={() => {
					this.setState({ open: !this.state.open });
				}}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Host}
						value={commandCenter.commandCenterHost}
						onChange={(value: string) => {
							commandCenter.commandCenterHost = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Host}
						value={commandCenter.commandCenterPort}
						onChange={(value: string) => {
							commandCenter.commandCenterPort = value;
							this.setState({
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
						title={`${Titles.Remove}`}
						onClick={() => {
							if (this.props.onRemove) {
								this.props.onRemove();
							}
						}}
						icon="fa fa-minus"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
