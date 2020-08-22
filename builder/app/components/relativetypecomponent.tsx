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
	SetupConfigInstanceInformation,
	CheckSimpleValidation,
	SimpleValidationConfig,
	AfterEffectRelations,
	CreateStretchPath,
	SetProperty,
	HalfRelation,
	getRelationProperties
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
import StretchPathComponent from './stretchpathcomponent';

export default class RelativeTypeComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let ok = false;
		let isValidation = false;
		switch (this.props.dataChainType) {
			case DataChainType.Permission:
			case DataChainType.Validation:
			case DataChainType.Filter:
			case DataChainType.Execution:
				isValidation = true;
				ok = true;
				break;
		}
		if (!ok) {
			return <span />;
		}
		let props: any = this.props;
		let {
			methodDescription,
			relations,
			targetProperties
		}: {
			methodDescription: MethodDescription;
			relations: AfterEffectRelations;
			targetProperties: any[];
		} = props;
		// let startModel =
		// 	relations.relationType === RelationType.Agent
		// 		? methodDescription.properties.agent
		// 		: methodDescription.properties.model_output || methodDescription.properties.model;
		let title = '';
		let property = '';
		switch (relations.relationType) {
			case RelationType.Agent:
				title = UIA.GetNodeTitle(methodDescription.properties.agent);
				property = relations.agentProperty;
				break;
			case RelationType.Model:
				title = UIA.GetNodeTitle(
					methodDescription.properties.model_output || methodDescription.properties.model
				);
				property = relations.modelProperty;
				break;
			case RelationType.ModelOuput:
				title = UIA.GetNodeTitle(
					methodDescription.properties.model_output || methodDescription.properties.model
				);
				property = relations.modelOutputProperty;
				break;
			case RelationType.Parent:
				title = UIA.GetNodeTitle(methodDescription.properties.parent);
				property = relations.parentProperty;
				break;
		}
		let properties = getRelationProperties(methodDescription, relations);
		return (
			<TreeViewMenu
				hide={!this.props.enabled}
				open={this.state.config && this.props.enabled}
				icon={this.props.valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ config: !this.state.config });
				}}
				active
				greyed={!this.props.enabled}
				title={Titles.RelationType}
			>
				<TreeViewItemContainer hide={this.props.hideModelAgent}>
					<SelectInput
						label={title}
						options={Object.values(RelationType).map((v: RelationType) => ({ title: v, value: v }))}
						value={relations.relationType}
						onChange={(value: RelationType) => {
							relations.relationType = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer hide={this.props.hideModelAgent}>
					<SelectInput
						label={Titles.Property}
						options={properties}
						value={property}
						onChange={(value: string) => {
							switch (relations.relationType) {
								case RelationType.Agent:
									relations.agentProperty = value;
									if (methodDescription.properties.agent)
										relations.agent = methodDescription.properties.agent;
									break;
								case RelationType.Model:
									relations.modelProperty = value;
									if (methodDescription.properties.model)
										relations.model = methodDescription.properties.model;
									break;
								case RelationType.ModelOuput:
									relations.modelOutputProperty = value;
									if (methodDescription.properties.model_output)
										relations.modelOutput = methodDescription.properties.model_output;
									break;
								case RelationType.Parent:
									relations.parentProperty = value;
									if (methodDescription.properties.parent)
										relations.parent = methodDescription.properties.parent;
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
					<SelectInput
						label={UIA.GetNodeTitle(methodDescription.properties.model)}
						options={targetProperties || []}
						value={relations.targetProperty}
						onChange={(value: string) => {
							relations.targetProperty = value;
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
						value={relations && relations.isStrech}
						onChange={(val: boolean) => {
							relations.isStrech = val;
							if (val) {
								relations.stretchPath = relations.stretchPath || CreateStretchPath();
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
				<StretchPathComponent stretch={relations.stretchPath} show={relations && relations.isStrech} />
			</TreeViewMenu>
		);
	}
}
