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
	CreateFilterConfig,
	ValidationColors,
	CheckValidationConfigs
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectComponent from './aftereffectcomponent';
import ValidationComponentItem from './validationcomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { Node } from '../methods/graph_types';
import TreeViewItemContainer from './treeviewitemcontainer';
import CheckBox from './checkbox';
import { GetNode } from '../methods/graph_methods';

export default class FilterItemsComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		mountingItem.filterItem = mountingItem.filterItem || {};
		let { filterItem } = mountingItem;
		if (!mountingItem || !mountingItem.methodDescription || !mountingItem.methodDescription.properties) {
			return <span>No method description</span>;
		}
		let model =
			mountingItem.methodDescription.properties.model_output || mountingItem.methodDescription.properties.model;
		if (!model) {
			return <span>No model/output</span>;
		}
		let properties: Node[] = UIA.GetModelPropertyChildren(model);
		let valid = CheckValidationConfigs(Object.values(filterItem));
		return (
			<TreeViewMenu
				color={filterItem && Object.keys(filterItem).length ? ValidationColors.Ok : ValidationColors.Neutral}
				open={this.state.open}
				active
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.FilterModelItem}
			>
				<TreeViewMenu
					open={this.state.popen}
					active
					onClick={() => {
						this.setState({ popen: !this.state.popen });
					}}
					title={Titles.Properties}
				>
					{properties.map((prop: Node) => {
						filterItem[prop.id] = filterItem[prop.id] || CreateFilterConfig();
						return (
							<TreeViewItemContainer>
								<CheckBox
									value={filterItem[prop.id].enabled}
									label={UIA.GetNodeTitle(prop)}
									onChange={(val: boolean) => {
										filterItem[prop.id].enabled = val;
										this.setState({ turn: UIA.GUID() });
									}}
								/>
							</TreeViewItemContainer>
						);
					})}
				</TreeViewMenu>
				{Object.keys(filterItem || {})
					.filter((propertyKey: string) => {
						let node = GetNode(UIA.GetCurrentGraph(), propertyKey);
						if (!node) {
							delete filterItem[propertyKey];
						}

						return node;
					})
					.filter((propertyKey: string) => {
						return filterItem && filterItem[propertyKey] && filterItem[propertyKey].enabled;
					})
					.map((propertyKey: string) => {
						let filterConfig = filterItem[propertyKey];
						return (
							<ValidationComponentItem
								key={filterConfig.id}
								methodDescription={mountingItem.methodDescription}
								mountingItem={mountingItem}
								otitle={UIA.GetNodeTitle(propertyKey) || Titles.Filter}
								dataChainType={DataChainType.Filter}
								onContext={this.props.onContext}
								onChange={() => {
									if (this.props.onChange) {
										this.props.onChange();
									}
								}}
								agent={this.props.agent}
								validationConfig={filterConfig}
							/>
						);
					})}
			</TreeViewMenu>
		);
	}
}
