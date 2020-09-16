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
	CreateCheckExistence,
	RelationType,
	SkipSettings,
	CheckIsExisting,
	CheckExistenceConfig,
	SetupConfigInstanceInformation,
	ValidationColors,
	ExistenceCheckConfig,
	CheckExistenceCheck,
	HalfRelation
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewButtonGroup from './treeviewbuttongroup';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import ReturnSettings from './returnsettings';

export default class CheckExistanceConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		let ok = false;
		let isValidation = false;
		switch (this.props.dataChainType) {
			case DataChainType.Validation:
				isValidation = true;
				ok = true;
				break;
			case DataChainType.AfterEffect:
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}
		let methodDescription: MethodDescription = this.props.methodDescription;
		if (!methodDescription) {
			return <span />;
		}

		let existenceCheck: ExistenceCheckConfig = this.props.existenceCheck;
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
				title={Titles.ChexkExistence}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={existenceCheck.enabled}
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
					greyed={existenceCheck.enabled}
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
					</TreeViewItemContainer>{' '}
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.Property}
							options={properties}
							value={this.getHeadProperty(existenceCheck.head)}
							onChange={(value: string) => {
								let { head } = existenceCheck;
								switch (head.relationType) {
									case RelationType.Agent:
										head.agentProperty = value;
										break;
									case RelationType.Model:
										head.modelProperty = value;
										break;
									case RelationType.Parent:
										head.parentProperty = value;
										break;
									case RelationType.ModelOutput:
										head.modelOutputProperty = value;
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
							value={existenceCheck.targetProperty}
							onChange={(value: string) => {
								existenceCheck.targetProperty = value;
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
				<ReturnSettings
					existenceCheck={existenceCheck}
					onChange={() => {
						this.setState({
							turn: UIA.GUID()
						});
						if (this.props.onChange) {
							this.props.onChange();
						}
					}}
				/>
				<TreeViewMenu
					open={this.state.skipopen}
					icon={CheckIsExisting(existenceCheck) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ skipopen: !this.state.skipopen });
					}}
					hide={!existenceCheck || !existenceCheck.enabled}
					active={isValidation && (!existenceCheck.returnSetting || !existenceCheck.returnSetting.enabled)}
					greyed={existenceCheck.enabled}
					title={Titles.SkipSettings}
				>
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.SkipSetting}
							options={Object.values(SkipSettings).map((v: string) => ({ title: v, value: v }))}
							value={existenceCheck.skipSettings}
							onChange={(value: SkipSettings) => {
								existenceCheck.skipSettings = value;
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
				return head.modelOutput;
			case RelationType.Parent:
				if (methodDescription.properties.parent) {
					head.parent = methodDescription.properties.parent;
				}
				break;
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
				return head.agent;
			case RelationType.Model:
				return head.model;
			case RelationType.ModelOutput:
				return head.modelOutput;
			case RelationType.Parent:
				return head.parent;
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
