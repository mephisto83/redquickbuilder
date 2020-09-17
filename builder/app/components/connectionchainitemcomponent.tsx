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
	CheckConnectionChainItem
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewButtonGroup from './treeviewbuttongroup';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import ReturnSettings from './returnsettings';
import { NodesByType } from '../methods/graph_methods';
import { NodeTypes } from '../constants/nodetypes';
import TreeViewGroupButton from './treeviewgroupbutton';

export default class ConnectionChainItemComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let item: ConnectionChainItem = this.props.item;
		let previousModel: string = this.props.previousModel;
		if (!item) {
			return <span>No existence check</span>;
		}
		let valid = CheckConnectionChainItem(item);
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
				title={`${UIA.GetNodeTitle(previousModel)}.${UIA.GetNodeTitle(
					item.previousModelProperty
				)} => ${UIA.GetNodeTitle(item.model)}.${UIA.GetNodeTitle(item.modelProperty)}`}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Delete}`}
						onClick={() => {
							if (this.props.onDelete) {
								this.props.onDelete();
							}
						}}
						icon="fa fa-minus"
					/>
				</TreeViewButtonGroup>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Property}
						options={UIA.GetModelCodeProperties(previousModel).toNodeSelect()}
						value={item.previousModelProperty}
						onChange={(value: string) => {
							item.previousModelProperty = value;
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
					<SelectInput
						label={Titles.Model}
						options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Model).toNodeSelect()}
						value={item.model}
						onChange={(value: string) => {
							item.model = value;
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
					<SelectInput
						label={Titles.Model}
						options={UIA.GetModelCodeProperties(item.model).toNodeSelect()}
						value={item.modelProperty}
						onChange={(value: string) => {
							item.modelProperty = value;
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
