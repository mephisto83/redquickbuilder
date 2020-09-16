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
	ExistenceCheckConfig,
	CheckExistenceCheck,
	HalfRelation,
	ConnectionChainItem,
	CheckConnectionChain
} from '../interface/methodprops';
import ConnectionChainItemComponent from './connectionchainitemcomponent';

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
				{chain.map((v) => <ConnectionChainItemComponent key={v.id} item={v} />)}
			</TreeViewMenu>
		);
	}
}
