// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import {
	CopyEnumerationConfig,
	DataChainConfiguration,
	MethodDescription,
	SetupConfigInstanceInformation,
  ValidationColors,
  CheckCopyEnumeration
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import SelectInput from './selectinput';
import { NodesByType, GetNodeProp } from '../methods/graph_methods';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';

export default class CopyEnumeration extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let props: any = this.props;

		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		let ok = false;
		switch (this.props.dataChainType) {
			case DataChainType.Execution:
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}

		let {
			copyEnumeration,
			methodDescription,
			targetProperties,
			properties
		}: {
			copyEnumeration: CopyEnumerationConfig;
			methodDescription: MethodDescription;
			targetProperties: any[];
			properties: any[];
		} = this.setupInstanceInfo(dataChainOptions);

		let enumerations: { id: string; value: string }[] = [];
		if (copyEnumeration && copyEnumeration.enumerationType) {
			enumerations = GetNodeProp(copyEnumeration.enumerationType, NodeProperties.Enumeration);
		}
		let valid = CheckCopyEnumeration(copyEnumeration);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={copyEnumeration.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				color={copyEnumeration && copyEnumeration.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={!copyEnumeration.enabled}
				title={this.props.title || Titles.CopyEnumeration}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={copyEnumeration.enabled}
						onChange={(value: boolean) => {
							copyEnumeration.enabled = value;
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
						label={`${Titles.Enumeration} Type`}
						options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Enumeration).toNodeSelect()}
						value={copyEnumeration.enumerationType}
						onChange={(val: string) => {
							copyEnumeration.enumerationType = val;
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
						value={copyEnumeration.enumeration}
						label={Titles.Enumeration}
						onChange={(val: string) => {
							copyEnumeration.enumeration = val;
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
						label={Titles.Property}
						options={targetProperties || []}
						value={copyEnumeration.targetProperty}
						onChange={(value: string) => {
							copyEnumeration.targetProperty = value;
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
	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
