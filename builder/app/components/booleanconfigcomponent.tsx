// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import { BooleanConfig } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';

export default class BooleanConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let props: any = this.props;
		let { booleanConfig }: { booleanConfig: BooleanConfig } = props;
		if (!booleanConfig) {
			return <span />;
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={booleanConfig.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				hide={!this.props.enabled}
				greyed={!booleanConfig.enabled}
				title={this.props.title}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={booleanConfig.enabled}
						onChange={(value: boolean) => {
							booleanConfig.enabled = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
			</TreeViewMenu>
		);
	}
}
