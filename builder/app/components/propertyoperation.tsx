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
	ValidationColors,
	ValueOperationConfig,
	CheckValueOperationConfigConfig
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import RelativeTypeComponent from './relativetypecomponent';
import RelativeTypeComponents from './relativetypecomponents';

export default class PropertyOperation extends Component<any, any> {
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
			methodDescription,
			targetProperties,
			properties
		}: {
			methodDescription: MethodDescription;
			targetProperties: any[];
			properties: any[];
		} = this.setupInstanceInfo(dataChainOptions);

		let valueOperationConfig: ValueOperationConfig = this.props.getOperationConfig(dataChainOptions);
		let valid = CheckValueOperationConfigConfig(valueOperationConfig);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={valueOperationConfig.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				color={
					valueOperationConfig && valueOperationConfig.enabled ? (
						ValidationColors.Ok
					) : (
						ValidationColors.Neutral
					)
				}
				active
				error={!valid}
				greyed={!valueOperationConfig.enabled}
				title={this.props.title || Titles.Concatenate}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={valueOperationConfig.enabled}
						onChange={(value: boolean) => {
							valueOperationConfig.enabled = value;
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
					relations={valueOperationConfig}
					valid={valid}
					onChange={() => {
						this.setState({
							turn: UIA.GUID()
						});
						if (this.props.onChange) {
							this.props.onChange();
						}
					}}
					dataChainOptions={dataChainOptions}
					enabled={valueOperationConfig.enabled}
					properties={properties}
					targetProperties={targetProperties}
					dataChainType={this.props.dataChainType}
				/>
				<RelativeTypeComponents
					methodDescription={methodDescription}
					parameters={valueOperationConfig.parameters}
					valid={valid}
					onChange={() => {
						this.setState({
							turn: UIA.GUID()
						});
						if (this.props.onChange) {
							this.props.onChange();
						}
					}}
					dataChainOptions={dataChainOptions}
					enabled={valueOperationConfig.enabled}
					properties={properties}
					targetProperties={targetProperties}
					dataChainType={this.props.dataChainType}
				/>
			</TreeViewMenu>
		);
	}

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
