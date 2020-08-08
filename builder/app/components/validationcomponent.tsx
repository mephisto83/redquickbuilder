// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import { AfterEffect, TargetMethodType, MountingDescription, ValidationConfig } from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectComponent from './aftereffectcomponent';
import ValidationComponentItem from './validationcomponentitem';

export default class ValidationComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		let { validations } = mountingItem;

		return (
			<TreeViewMenu
				open={this.state.open}
				innerStyle={{ maxHeight: 300, overflowY: 'auto' }}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.Validations}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddAfterMethods}`}
						onClick={() => {
							validations.push({
								id: UIA.GUID(),
								name: '',
								dataChain: '',
								dataChainOptions: {}
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(validations || []).map((validationConfig: ValidationConfig, index: number) => {
					return (
						<ValidationComponentItem
							key={validationConfig.id}
							methodDescription={index && mountingItem ? null : mountingItem.methodDescription}
							mountingItem={mountingItem}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = validations.findIndex((v) => v.id === validationConfig.id);
								if (index !== -1 && validations) {
									validations.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							validationConfig={validationConfig}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}