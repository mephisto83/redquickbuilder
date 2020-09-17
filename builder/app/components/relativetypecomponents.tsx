// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
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
	CheckConcatenateStringConfig,
	CheckRelation
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import RelativeTypeComponent from './relativetypecomponent';
import DirectRelationComponent from './directrelationcomponent';

export default class RelativeTypeComponents extends Component<any, any> {
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

		let valid = !(this.props.parameters || []).find((r: any) => !CheckRelation(r));
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
				title={Titles.DirectType}
			>
				{(this.props.parameters || []).map((relation: any) => {
					return (
						<DirectRelationComponent
							key={relation.id}
							methodDescription={methodDescription}
							relation={relation}
							valid={CheckRelation(relation)}
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
					);
				})}
			</TreeViewMenu>
		);
	}

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
