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
	CheckSetter,
	CopyConfig,
	Setter,
	ValidationColors
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import RelativeTypeComponent from './relativetypecomponent';

export default class SetterComponent extends Component<any, any> {
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

		let info = this.setupInstanceInfo(dataChainOptions);
		let {
			methodDescription,
			targetProperties,
			properties
		}: {
			copyConfig: CopyConfig;
			methodDescription: MethodDescription;
			targetProperties: any[];
			properties: any[];
		} = info;
		let setter: Setter = this.props.getFromInfo(info);
		let valid = CheckSetter(setter);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={setter.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				color={setter && setter.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={!setter.enabled}
				title={this.props.title}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={setter.enabled}
						onChange={(value: boolean) => {
							setter.enabled = value;
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
					relations={setter}
					valid={
						dataChainOptions &&
						setter.enabled &&
						((setter.relationType === RelationType.Agent && setter.agentProperty) ||
							(setter.relationType === RelationType.Model && setter.modelProperty))
					}
					hideModelAgent
					dataChainOptions={dataChainOptions}
					enabled={setter.enabled}
					properties={properties}
					targetProperties={targetProperties}
					dataChainType={this.props.dataChainType}
				/>
				{this.props.children}
			</TreeViewMenu>
		);
	}

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
