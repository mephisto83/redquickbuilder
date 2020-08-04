// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import {
	AfterEffect,
	TargetMethodType,
	EffectDescription,
	MountingDescription,
	MethodDescription,
	DataChainConfiguration,
	CreateCheckExistence,
	RelationType,
	SkipSettings,
	CheckIsExisting,
	CheckExistenceConfig,
	SetupConfigInstanceInformation
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiactions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';
import ReturnSettings from './returnsettings';
import DataChainOptions from './datachainoptions';

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

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={CheckIsExisting(checkExistence) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={checkExistence.enabled}
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
