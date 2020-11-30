// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import {
	MethodDescription,
	DataChainConfiguration,
	CreateCheckExistence,
	RelationType,
	SetupConfigInstanceInformation,
	CheckHalfRelation,
	CopyConfig,
	CheckCopyConfig,
	ValidationColors
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import RelativeTypeComponent from './relativetypecomponent';

export default class CopyConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
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
			copyConfig,
			methodDescription,
			targetProperties,
			properties
		}: {
			copyConfig: CopyConfig;
			methodDescription: MethodDescription;
			targetProperties: any[];
			properties: any[];
		} = this.setupInstanceInfo(dataChainOptions);

		let valid = CheckCopyConfig(copyConfig);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={copyConfig.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				color={copyConfig && copyConfig.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
				active
				error={!valid}
				greyed={!copyConfig.enabled}
				title={Titles.Copy}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={copyConfig.enabled}
						onChange={(value: boolean) => {
							copyConfig.enabled = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<RelativeTypeComponent
					methodDescription={methodDescription}
					relations={copyConfig}
					valid={
						dataChainOptions &&
						copyConfig.enabled &&
						((copyConfig.relationType === RelationType.Agent && copyConfig.agentProperty) ||
							(copyConfig.relationType === RelationType.Model && copyConfig.modelProperty))
					}
					onChange={() => {
						this.setState({
							turn: UIA.GUID()
						});
						if (this.props.onChange) {
							this.props.onChange();
						}
					}}
					dataChainOptions={dataChainOptions}
					enabled={copyConfig.enabled}
					properties={properties}
					targetProperties={targetProperties}
					dataChainType={this.props.dataChainType}
				/>
			</TreeViewMenu>
		);
	}

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		dataChainOptions.copyConfig = dataChainOptions.copyConfig || CreateCheckExistence();
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
