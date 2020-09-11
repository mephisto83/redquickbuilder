// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	PermissionConfig,
	CheckValidationConfigs,
	ValidationColors
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ValidationComponentItem from './validationcomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { NodeTypeColors, NodeTypes, NodeProperties } from '../constants/nodetypes';

export default class PermissionComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		mountingItem.permissions = mountingItem.permissions || [];
		let { permissions } = mountingItem;

		let valid = CheckValidationConfigs(permissions);
		return (
			<TreeViewMenu
				open={this.state.open}
				color={permissions && permissions.length ? ValidationColors.Ok : ValidationColors.Neutral}
				active
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.PermissionType}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddAfterMethods}`}
						onClick={() => {
							permissions.push({
								id: UIA.GUID(),
								enabled: true,
								name: '',
								dataChain: '',
								dataChainOptions: {},
								autoCalculate: true
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(permissions || []).map((permissionConfig: PermissionConfig, index: number) => {
					return (
						<ValidationComponentItem
							title={Titles.PermissionType}
							onContext={this.props.onContext}
							key={permissionConfig.id}
							methodDescription={this.props.methodDescription}
							mountingItem={mountingItem}
							dataChainType={DataChainType.Permission}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
								this.setState({
									turn: UIA.GUID()
								});
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = permissions.findIndex((v) => v.id === permissionConfig.id);
								if (index !== -1 && permissions) {
									if (permissionConfig.dataChain) {
										let originalConfig = UIA.GetNodeProp(
											permissionConfig.dataChain,
											NodeProperties.OriginalConfig
										);
										if (originalConfig == permissionConfig.id) {
											UIA.removeNodeById(permissionConfig.dataChain);
										}
									}
									permissions.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							validationConfig={permissionConfig}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
