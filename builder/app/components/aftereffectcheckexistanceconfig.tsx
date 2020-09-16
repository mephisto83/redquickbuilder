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
	CreateBranch,
	CreateStretchPath
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewButtonGroup from './treeviewbuttongroup';
import StretchPathComponent from './stretchpathcomponent';
import BranchConfigComponent from './aftereffectbranchconfigcomponent';

export default class AfterEffectCheckExistanceConfig extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		if (!dataChainOptions) {
			return <span />;
		}
		dataChainOptions.checkExistence = dataChainOptions.checkExistence || CreateCheckExistence();
		dataChainOptions.checkExistence.ifTrue = dataChainOptions.checkExistence.ifTrue || CreateBranch();
		dataChainOptions.checkExistence.ifFalse = dataChainOptions.checkExistence.ifFalse || CreateBranch();
		let previousMethodDescription: MethodDescription = this.props.previousMethodDescription;
		let currentMethodDescription: MethodDescription = this.props.currentMethodDescription;
		let checkExistence = dataChainOptions.checkExistence;
		let properties: any[] = [];
		let targetProperties: any[] = [];
		if (previousMethodDescription && checkExistence && checkExistence.relationType) {
			switch (checkExistence.relationType) {
				case RelationType.Agent:
					if (previousMethodDescription.properties && previousMethodDescription.properties.agent) {
						properties = UIA.GetModelPropertyChildren(
							previousMethodDescription.properties.agent
						).toNodeSelect();
					}
					break;
				case RelationType.Model:
					if (
						previousMethodDescription.properties &&
						(previousMethodDescription.properties.model_output ||
							previousMethodDescription.properties.model)
					) {
						properties = UIA.GetModelPropertyChildren(
							previousMethodDescription.properties.model_output ||
								previousMethodDescription.properties.model ||
								''
						).toNodeSelect();
					}
					break;
			}
		}
		if (
			currentMethodDescription &&
			currentMethodDescription.properties &&
			currentMethodDescription.properties.model
		) {
			targetProperties = UIA.GetModelPropertyChildren(currentMethodDescription.properties.model).toNodeSelect();
		}
		let model =
			checkExistence.relationType === RelationType.Agent
				? previousMethodDescription.properties.agent
				: previousMethodDescription.properties.model_output || previousMethodDescription.properties.model;
		let property =
			checkExistence.relationType === RelationType.Agent
				? checkExistence.agentProperty
				: checkExistence.modelProperty;
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={CheckIsExisting(checkExistence) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				greyed={!checkExistence || !checkExistence.enabled}
				active
				title={Titles.ChexkExistence}
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
					open={this.state.config && checkExistence.enabled}
					icon={CheckIsExisting(checkExistence) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ config: !this.state.config });
					}}
					active={checkExistence.enabled}
					title={Titles.RelationType}
				>
					<TreeViewItemContainer>
						<SelectInput
							label={checkExistence.relationType}
							options={Object.values(RelationType).map((v: RelationType) => ({
								title:
									v === RelationType.Agent
										? UIA.GetNodeTitle(previousMethodDescription.properties.agent)
										: UIA.GetNodeTitle(
												previousMethodDescription.properties.model_output ||
													previousMethodDescription.properties.model
											),
								value: v
							}))}
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
									case RelationType.ModelOutput:
										checkExistence.modelOutputProperty = value;
										break;
									case RelationType.Parent:
										checkExistence.parentProperty = value;
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
					<TreeViewItemContainer hide={this.props.hideTargetProperty}>
						<CheckBox
							label={Titles.Stretch}
							value={checkExistence && checkExistence.isStrech}
							onChange={(val: boolean) => {
								checkExistence.isStrech = val;
								checkExistence.stretchPath = checkExistence.stretchPath || CreateStretchPath();
								this.setState({
									turn: UIA.GUID()
								});
							}}
						/>
					</TreeViewItemContainer>
					<StretchPathComponent
						stretch={checkExistence.stretchPath}
						model={model}
						property={property}
						show={checkExistence && checkExistence.isStrech}
					/>
					<TreeViewItemContainer>
						<SelectInput
							label={UIA.GetNodeTitle(currentMethodDescription.properties.model)}
							options={UIA.GetModelPropertyChildren(
								currentMethodDescription.properties.model || ''
							).toNodeSelect()}
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
				<BranchConfigComponent
					previousMethodDescription={previousMethodDescription}
					currentMethodDescription={currentMethodDescription}
					branchConfig={checkExistence.ifFalse}
					routes={this.props.routes}
					title={Titles.IfFalse}
				/>
				<BranchConfigComponent
					previousMethodDescription={previousMethodDescription}
					currentMethodDescription={currentMethodDescription}
					branchConfig={checkExistence.ifTrue}
					routes={this.props.routes}
					title={Titles.IfTrue}
				/>
			</TreeViewMenu>
		);
	}
}
