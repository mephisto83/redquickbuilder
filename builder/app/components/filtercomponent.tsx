// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	AfterEffect,
	TargetMethodType,
	MountingDescription,
	ValidationConfig,
	FilterConfig
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectComponent from './aftereffectcomponent';
import ValidationComponentItem from './validationcomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';

export default class FilterComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		mountingItem.filters = mountingItem.filters || [];
		let { filters } = mountingItem;

		return (
			<TreeViewMenu
				open={this.state.open}
				active
				color={filters && filters.length ? '#DD4B39' : ''}
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
								dataChainOptions: {}
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
