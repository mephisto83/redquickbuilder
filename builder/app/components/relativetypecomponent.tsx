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
	AfterEffectRelations
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

export default class RelativeTypeComponent extends Component<any, any> {
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
			case DataChainType.Execution:
				isValidation = true;
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}
		let props: any = this.props;
		let {
			methodDescription,
			relations,
			properties,
			targetProperties
		}: {
			methodDescription: MethodDescription;
			relations: AfterEffectRelations;
			properties: any[];
			targetProperties: any[];
		} = props;

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
				<TreeViewItemContainer>
					<SelectInput
						label={
							relations.relationType === RelationType.Agent ? (
								UIA.GetNodeTitle(methodDescription.properties.agent)
							) : (
								UIA.GetNodeTitle(
									methodDescription.properties.model_output || methodDescription.properties.model
								)
							)
						}
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
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Property}
						options={properties}
						value={
							relations.relationType === RelationType.Agent ? (
								relations.agentProperty
							) : (
								relations.modelProperty
							)
						}
						onChange={(value: string) => {
							switch (relations.relationType) {
								case RelationType.Agent:
									relations.agentProperty = value;
									break;
								case RelationType.Model:
									relations.modelProperty = value;
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
			</TreeViewMenu>
		);
	}
}
