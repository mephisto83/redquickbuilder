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
	CheckCopyConfig,
	CopyConfig,
	AreEqualConfig
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import RelativeTypeComponent from './relativetypecomponent';

export default class EqualityConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let areEqual: AreEqualConfig = this.props.config;
		let methodDescription: MethodDescription = this.props.methodDescription;
		let ok = false;

		if (!areEqual) {
			return <span />;
		}

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={
					areEqual.enabled && (areEqual.agentProperty || areEqual.modelProperty) ? (
						'fa fa-check-circle-o'
					) : (
						'fa fa-circle-o'
					)
				}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={!areEqual.enabled}
				title={Titles.IsEqualTo}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={areEqual.enabled}
						onChange={(value: boolean) => {
							areEqual.enabled = value;
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
					relations={areEqual}
					valid={areEqual.enabled}
					enabled={areEqual.enabled}
					properties={this.props.properties}
					dataChainType={this.props.dataChainType}
					targetProperties={this.props.targetProperties}
					hideTargetProperty
				/>
			</TreeViewMenu>
		);
	}
}
