// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	AfterEffect,
	TargetMethodType,
	MountingDescription,
	ValidationConfig,
	FilterConfig,
	ValidationColors,
  CheckValidationConfigs
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectComponent from './aftereffectcomponent';
import ValidationComponentItem from './validationcomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { NodeProperties } from '../constants/nodetypes';

export default class FilterComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		mountingItem.filters = mountingItem.filters || [];
    let { filters } = mountingItem;

		let valid = CheckValidationConfigs(filters);

		return (
			<TreeViewMenu
				open={this.state.open}
				color={filters && filters.length ? ValidationColors.Ok : ValidationColors.Neutral}
				active
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.Filter}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddModelItemFilter}`}
						onClick={() => {
							filters.push({
								enabled: true,
								id: UIA.GUID(),
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
				{(filters || []).map((filterConfig: FilterConfig, index: number) => {
					return (
						<ValidationComponentItem
							key={filterConfig.id}
							methodDescription={index && mountingItem ? null : mountingItem.methodDescription}
							mountingItem={mountingItem}
							title={Titles.Filter}
							dataChainType={DataChainType.Filter}
							onContext={this.props.onContext}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = filters.findIndex((v) => v.id === filterConfig.id);
								if (index !== -1 && filters) {
									if (filterConfig.dataChain) {
										let originalConfig = UIA.GetNodeProp(
											filterConfig.dataChain,
											NodeProperties.OriginalConfig
										);
										if (originalConfig === filterConfig.id)
											UIA.removeNodeById(filterConfig.dataChain);
									}
									filters.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							validationConfig={filterConfig}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
