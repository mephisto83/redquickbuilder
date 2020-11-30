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
	ValidationColors
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewButtonGroup from './treeviewbuttongroup';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import ReturnSettings from './returnsettings';

export default class CheckExistanceConfig extends Component<any, any> {
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

		let {
			checkExistence,
			methodDescription,
			properties,
			targetProperties
		}: {
			checkExistence: CheckExistenceConfig;
			methodDescription: MethodDescription;
			properties: any[];
			targetProperties: any[];
		} = this.setupInstanceInfo(dataChainOptions);
		let valid = CheckIsExisting(checkExistence);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={checkExistence.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				color={checkExistence && checkExistence.enabled ? ValidationColors.Ok : ValidationColors.Neutral}
				error={!valid}
				active
				greyed={!checkExistence.enabled}
				title={Titles.CheckExistence}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={checkExistence.enabled}
						onChange={(value: boolean) => {
							checkExistence.enabled = value;
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
					hide={!checkExistence || !checkExistence.enabled}
					open={this.state.config && checkExistence.enabled}
					icon={CheckIsExisting(checkExistence) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ config: !this.state.config });
					}}
					active
					greyed={checkExistence.enabled}
					title={Titles.RelationType}
				>
					<TreeViewItemContainer>
						<SelectInput
							label={
								checkExistence.relationType === RelationType.Agent ? (
									UIA.GetNodeTitle(methodDescription.properties.agent)
								) : (
									UIA.GetNodeTitle(
										methodDescription.properties.model_output || methodDescription.properties.model
									)
								)
							}
							options={Object.values(RelationType).map((v: RelationType) => ({ title: v, value: v }))}
							value={checkExistence.relationType}
							onChange={(value: RelationType) => {
								checkExistence.relationType = value;
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
								checkExistence.relationType === RelationType.Agent ? (
									checkExistence.agentProperty
								) : (
									checkExistence.modelProperty
								)
							}
							onChange={(value: string) => {
								switch (checkExistence.relationType) {
									case RelationType.Agent:
										checkExistence.agentProperty = value;
										break;
									case RelationType.Model:
										checkExistence.modelProperty = value;
										break;
									case RelationType.Parent:
										checkExistence.parentProperty = value;
										break;
									case RelationType.ModelOutput:
										checkExistence.modelOutputProperty = value;
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
							value={checkExistence.targetProperty}
							onChange={(value: string) => {
								checkExistence.targetProperty = value;
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
					checkExistence={checkExistence}
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
					icon={CheckIsExisting(checkExistence) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ skipopen: !this.state.skipopen });
					}}
					hide={!checkExistence || !checkExistence.enabled}
					active={isValidation && (!checkExistence.returnSetting || !checkExistence.returnSetting.enabled)}
					greyed={checkExistence.enabled}
					title={Titles.SkipSettings}
				>
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.SkipSetting}
							options={Object.values(SkipSettings).map((v: string) => ({ title: v, value: v }))}
							value={checkExistence.skipSettings}
							onChange={(value: SkipSettings) => {
								checkExistence.skipSettings = value;
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

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		dataChainOptions.checkExistence = dataChainOptions.checkExistence || CreateCheckExistence();
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
