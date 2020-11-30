// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
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
	HalfRelation
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewButtonGroup from './treeviewbuttongroup';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import ReturnSettings from './returnsettings';
import ConnectionChainComponent from './connectionchain';

export default class CheckExistanceConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let methodDescription: MethodDescription = this.props.methodDescription;
		if (!methodDescription) {
			return <span />;
		}

		let existenceCheck: GetOrExistenceCheckConfig = this.props.existenceCheck;
		if (!existenceCheck) {
			return <span>No existence check</span>;
		}
		let valid = CheckExistenceCheck(existenceCheck);
		let properties = this.getHeadProperties(existenceCheck.head);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={existenceCheck.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				color={existenceCheck && existenceCheck.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
				error={!valid}
				active
				greyed={!existenceCheck.enabled}
				title={this.props.title || Titles.CheckExistence}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						color={
							existenceCheck && existenceCheck.enabled ? ValidationColors.Ok : ValidationColors.Neutral
						}
						value={existenceCheck.enabled}
						greyed={!existenceCheck.enabled}
						error={!valid}
						onChange={(value: boolean) => {
							existenceCheck.enabled = value;
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
					hide={!existenceCheck || !existenceCheck.enabled}
					open={this.state.config && existenceCheck.enabled}
					icon={valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ config: !this.state.config });
					}}
					active
					color={existenceCheck && existenceCheck.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
					value={existenceCheck.enabled}
					greyed={!existenceCheck.enabled}
					error={!valid}
					title={Titles.RelationType}
				>
					<TreeViewItemContainer>
						<SelectInput
							label={this.getLabel(existenceCheck.head)}
							options={Object.values(RelationType).map((v: RelationType) => ({ title: v, value: v }))}
							value={existenceCheck.head.relationType}
							onChange={(value: RelationType) => {
								existenceCheck.head.relationType = value;
								this.applyHeadModelValue({
									head: existenceCheck.head,
									relationType: value,
									methodDescription
								});
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
					<ConnectionChainComponent
						head={this.getHeadModel(existenceCheck.head)}
						chain={existenceCheck.orderedCheck}
					/>
				</TreeViewMenu>
			</TreeViewMenu>
		);
	}
	applyHeadModelValue({
		head,
		relationType,
		methodDescription
	}: {
		head: HalfRelation;
		relationType: RelationType;
		methodDescription: MethodDescription;
	}): void {
		switch (relationType) {
			case RelationType.Agent:
				if (methodDescription.properties.agent) {
					head.agent = methodDescription.properties.agent;
				}
				break;
			case RelationType.Model:
				if (methodDescription.properties.model) {
					head.model = methodDescription.properties.model;
				}
				break;
			case RelationType.ModelOutput:
				if (methodDescription.properties.model_output) {
					head.modelOutput = methodDescription.properties.model_output;
				}
				break;
			case RelationType.Parent:
				if (methodDescription.properties.parent) {
					head.parent = methodDescription.properties.parent;
				}
				break;
		}
	}
	getHeadModel(head: HalfRelation) {
		switch (head.relationType) {
			case RelationType.Agent:
				return head.agent;
			case RelationType.Model:
				return head.model;
			case RelationType.ModelOutput:
				return head.modelOutput;
			case RelationType.Parent:
				return head.parent;
		}
	}
	getHeadProperties(head: HalfRelation) {
		switch (head.relationType) {
			case RelationType.Agent:
				return UIA.GetModelCodeProperties(head.agent).toNodeSelect();
			case RelationType.Model:
				return UIA.GetModelCodeProperties(head.model).toNodeSelect();
			case RelationType.ModelOutput:
				return UIA.GetModelCodeProperties(head.modelOutput).toNodeSelect();
			case RelationType.Parent:
				return UIA.GetModelCodeProperties(head.parent).toNodeSelect();
		}
	}
	getHeadProperty(head: HalfRelation) {
		switch (head.relationType) {
			case RelationType.Agent:
				return head.agentProperty;
			case RelationType.Model:
				return head.modelProperty;
			case RelationType.ModelOutput:
				return head.modelOutputProperty;
			case RelationType.Parent:
				return head.parentProperty;
		}
	}
	getLabel(head: HalfRelation) {
		switch (head.relationType) {
			case RelationType.Agent:
				return UIA.GetNodeTitle(head.agent);
			case RelationType.Model:
				return UIA.GetNodeTitle(head.model);
			case RelationType.ModelOutput:
				return UIA.GetNodeTitle(head.modelOutput);
			case RelationType.Parent:
				return UIA.GetNodeTitle(head.parent);
		}
	}
}
