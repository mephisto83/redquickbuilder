// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	PermissionConfig,
	StaticParameter,
	StaticParameters,
	createStaticParameters,
	createStaticParameter,
	StaticParameterPurpose
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ValidationComponentItem from './validationcomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { NodeTypeColors, NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';
import SelectInput from './selectinput';
import { NodesByType } from '../methods/graph_methods';

export default class StaticParameterComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let staticParameter: StaticParameter = this.props.staticParameter;
		if (!staticParameter) {
			return <span />;
		}
		let enumerations: { id: string; value: string }[] = [];
		if (staticParameter && staticParameter.enumerationType) {
			enumerations = UIA.GetNodeProp(staticParameter.enumerationType, NodeProperties.Enumeration);
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				greyed={!staticParameter.enabled}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={staticParameter.name || Titles.StaticParamter}
			>
				<TreeViewItemContainer>
					<TextInput
						value={staticParameter.name}
						label={Titles.Name}
						onChange={(val: string) => {
							staticParameter.name = val;
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange;
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={`${Titles.Enumeration} Type`}
						options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Enumeration).toNodeSelect()}
						value={staticParameter.enumerationType}
						onChange={(val: string) => {
							staticParameter.enumerationType = val;
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
						options={enumerations.map((v) => ({ title: v.value, value: v.id }))}
						value={staticParameter.enumeration}
						label={Titles.Enumeration}
						onChange={(val: string) => {
							staticParameter.enumeration = val;
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
						options={Object.values(StaticParameterPurpose).map((v) => ({ value: v, title: v }))}
						value={staticParameter.purpose}
						label={Titles.Purpose}
						onChange={(val: StaticParameterPurpose) => {
							staticParameter.purpose = val;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Delete}`}
						onClick={() => {
							if (this.props.onDelete) {
								this.props.onDelete();
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
						}}
						icon="fa fa-minus"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
