// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TreeViewMenu from './treeviewmenu';
import {
	MethodDescription,
	DataChainConfiguration,
	CreateCheckExistence,
	RelationType,
	SkipSettings,
	CheckIsExisting,
	CheckExistenceConfig,
	SetupConfigInstanceInformation,
	ValidationColors,
	GetOrExistenceCheckConfig,
	CheckExistenceCheck,
	HalfRelation,
	ConnectionChainItem,
	CheckConnectionChain,
	CreateConnectionChainItem
} from '../interface/methodprops';
import ConnectionChainItemComponent from './connectionchainitemcomponent';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { head } from './editor.main.css';

export default class ConnectionChainComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let chain: ConnectionChainItem[] = this.props.chain;
		if (!chain) {
			return <span>No existence check</span>;
		}
		let head: string = this.props.head;
		if (!head) {
			return <span>No Head set</span>;
		}
		let valid = CheckConnectionChain(chain);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				color={valid ? ValidationColors.Ok : ValidationColors.Neutral}
				error={!valid}
				active
				greyed={!valid}
				title={Titles.CheckExistence}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.NextStep}`}
						onClick={() => {
							chain.push(CreateConnectionChainItem());
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{chain.map((v, index) => (
					<ConnectionChainItemComponent

						previousModel={index ? chain[index - 1].model : head}
						onChange={() => {
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						onDelete={() => {
							chain.splice(index, 1);
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						key={v.id}
						item={v}
					/>
				))}
			</TreeViewMenu>
		);
	}
}
