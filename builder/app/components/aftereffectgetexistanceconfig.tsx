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
	CreateGetExistence,
	CheckGetExisting
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

export default class AfterEffectGetExistanceConfig extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		if (!dataChainOptions) {
			return <span />;
		}
		dataChainOptions.getExisting = dataChainOptions.getExisting || CreateGetExistence();
		let previousMethodDescription: MethodDescription = this.props.previousMethodDescription;
		let currentMethodDescription: MethodDescription = this.props.currentMethodDescription;
		let getExisting = dataChainOptions.getExisting;
		let properties: any[] = [];
		let targetProperties: any[] = [];
		if (previousMethodDescription && getExisting && getExisting.relationType) {
			switch (getExisting.relationType) {
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
				greyed={!getExisting || !getExisting.enabled}
				icon={CheckGetExisting(getExisting) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
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
									UIA.GetNodeTitle(previousMethodDescription.properties.agent)
								) : (
									UIA.GetNodeTitle(
										previousMethodDescription.properties.model_output ||
											previousMethodDescription.properties.model
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
							label={UIA.GetNodeTitle(currentMethodDescription.properties.model)}
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
