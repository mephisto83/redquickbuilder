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
import { removeNode } from '../methods/graph_methods';

export default class ValidationComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		mountingItem.validations = mountingItem.validations || [];
		let { validations } = mountingItem;

		return (
			<TreeViewMenu
				open={this.state.open}
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
								enabled: true,
								name: '',
								dataChain: '',
								dataChainOptions: {}
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
					<TreeViewGroupButton title={`${Titles.Copy}`} onClick={() => {}} icon="fa fa-copy" />
					<TreeViewGroupButton title={`${Titles.Paste}`} onClick={() => {}} icon="fa fa-paste" />
				</TreeViewButtonGroup>
				{(validations || []).map((validationConfig: ValidationConfig, index: number) => {
					return (
						<ValidationComponentItem
							key={validationConfig.id}
							methodDescription={index && mountingItem ? null : mountingItem.methodDescription}
							mountingItem={mountingItem}
							onContext={this.props.onContext}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = validations.findIndex((v) => v.id === validationConfig.id);
								if (index !== -1 && validations) {
									if (validationConfig.dataChain) {
										UIA.removeNodeById(validationConfig.dataChain);
									}
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
