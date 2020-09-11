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
	RelationType,
	CreateGetExistence,
	CheckGetExisting,
	ValidationColors
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewButtonGroup from './treeviewbuttongroup';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';

export default class GetExistanceConfig extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		let ok = false;
		switch (this.props.dataChainType) {
			case DataChainType.AfterEffect:
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}

		dataChainOptions.getExisting = dataChainOptions.getExisting || CreateGetExistence();
		let methodDescription: MethodDescription = this.props.methodDescription;
		let getExisting = dataChainOptions.getExisting;
		let properties: any[] = [];
		let targetProperties: any[] = [];
		if (methodDescription && getExisting && getExisting.relationType) {
			switch (getExisting.relationType) {
				case RelationType.Agent:
					if (methodDescription.properties && methodDescription.properties.agent) {
						properties = UIA.GetModelPropertyChildren(methodDescription.properties.agent).toNodeSelect();
					}
					break;
				case RelationType.Model:
					if (
						methodDescription.properties &&
						(methodDescription.properties.model_output || methodDescription.properties.model)
					) {
						properties = UIA.GetModelPropertyChildren(
							methodDescription.properties.model_output || methodDescription.properties.model || ''
						).toNodeSelect();
					}
					break;
			}
		}
		if (methodDescription && methodDescription.properties && methodDescription.properties.model) {
			targetProperties = UIA.GetModelPropertyChildren(methodDescription.properties.model).toNodeSelect();
		}
		let valid = CheckGetExisting(getExisting);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={getExisting.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				color={getExisting && getExisting.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={Titles.GetExisting}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={getExisting.enabled}
						onChange={(value: boolean) => {
							getExisting.enabled = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewMenu
					open={this.state.config && getExisting.enabled}
					icon={CheckGetExisting(getExisting) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ config: !this.state.config });
					}}
					active={getExisting.enabled}
					title={Titles.RelationType}
				>
					<TreeViewItemContainer>
						<SelectInput
							label={
								getExisting.relationType === RelationType.Agent ? (
									UIA.GetNodeTitle(methodDescription.properties.agent)
								) : (
									UIA.GetNodeTitle(
										methodDescription.properties.model_output || methodDescription.properties.model
									)
								)
							}
							options={Object.values(RelationType).map((v: RelationType) => ({ title: v, value: v }))}
							value={getExisting.relationType}
							onChange={(value: RelationType) => {
								getExisting.relationType = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>{' '}
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.Property}
							options={properties}
							value={
								getExisting.relationType === RelationType.Agent ? (
									getExisting.agentProperty
								) : (
									getExisting.modelProperty
								)
							}
							onChange={(value: string) => {
								switch (getExisting.relationType) {
									case RelationType.Agent:
										getExisting.agentProperty = value;
										break;
									case RelationType.Model:
										getExisting.modelProperty = value;
										break;
								}
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
							label={UIA.GetNodeTitle(methodDescription.properties.model)}
							options={targetProperties}
							value={getExisting.targetProperty}
							onChange={(value: string) => {
								getExisting.targetProperty = value;
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
				<TreeViewButtonGroup />
			</TreeViewMenu>
		);
	}
}
