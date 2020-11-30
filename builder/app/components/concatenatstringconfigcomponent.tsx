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
	CheckConcatenateStringConfig,
  ValueOperationConfig
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import RelativeTypeComponent from './relativetypecomponent';
import RelativeTypeComponents from './relativetypecomponents';

export default class ConcatenateStringConfigComponent extends Component<any, any> {
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
			concatenateString,
			methodDescription,
			targetProperties,
			properties
		}: {
			concatenateString: ValueOperationConfig;
			methodDescription: MethodDescription;
			targetProperties: any[];
			properties: any[];
		} = this.setupInstanceInfo(dataChainOptions);

		let valid = CheckConcatenateStringConfig(concatenateString);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={concatenateString.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				color={concatenateString && concatenateString.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
				active
				error={!valid}
				greyed={!concatenateString.enabled}
				title={Titles.Concatenate}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={concatenateString.enabled}
						onChange={(value: boolean) => {
							concatenateString.enabled = value;
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
					relations={concatenateString}
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
					enabled={concatenateString.enabled}
					properties={properties}
					targetProperties={targetProperties}
					dataChainType={this.props.dataChainType}
				/>
				<RelativeTypeComponents
					methodDescription={methodDescription}
					parameters={concatenateString.parameters}
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
					enabled={concatenateString.enabled}
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
