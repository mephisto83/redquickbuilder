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
	AfterEffectDataChainConfiguration,
	CreateCheckExistence,
	RelationType,
	SkipSettings,
	CheckIsExisting
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiactions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';

export default class AfterEffectCheckExistanceConfig extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let dataChainOptions: AfterEffectDataChainConfiguration = this.props.dataChainOptions;
		if (!dataChainOptions) {
			return <span />;
		}
		dataChainOptions.checkExistence = dataChainOptions.checkExistence || CreateCheckExistence();
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
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={CheckIsExisting(checkExistence) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
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
							label={
								checkExistence.relationType === RelationType.Agent ? (
									UIA.GetNodeTitle(previousMethodDescription.properties.agent)
								) : (
									UIA.GetNodeTitle(
										previousMethodDescription.properties.model_output ||
											previousMethodDescription.properties.model
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
							label={UIA.GetNodeTitle(currentMethodDescription.properties.model)}
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
				<TreeViewButtonGroup />
			</TreeViewMenu>
		);
	}
}
