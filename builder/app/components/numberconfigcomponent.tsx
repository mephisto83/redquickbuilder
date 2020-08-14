// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import { BooleanConfig, NumberConfig } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';

export default class NumberConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let props: any = this.props;
		let { numberConfig }: { numberConfig: NumberConfig } = props;

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={numberConfig.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
        active
        hide={!this.props.enabled}
				greyed={!numberConfig.enabled}
				title={this.props.title}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={numberConfig.enabled}
						onChange={(value: boolean) => {
							numberConfig.enabled = value;
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
						label={this.props.title}
						value={numberConfig.value}
						onChange={(value: string) => {
							numberConfig.value = value;
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
					<CheckBox
						label={Titles.UseEqual}
						value={numberConfig.equal}
						onChange={(value: boolean) => {
							numberConfig.equal = value;
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
