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
	CreateSimpleValidation,
	CreateOneOf,
	CreateBoolean,
	GetSimpleValidationId,
	SimpleValidationsConfiguration
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation, GetNodeCode } from '../actions/uiactions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';
import ReturnSettings from './returnsettings';
import DataChainOptions from './datachainoptions';
import RelativeTypeComponent from './relativetypecomponent';
import BooleanConfigComponent from './booleanconfigcomponent';
import NumberConfigComponent from './numberconfigcomponent';
import OneOfEnumerationComponent from './oneofenumeration';
import EqualityConfigComponent from './equalityconfigcomponent';
import TreeViewItem from './treeviewitem';

export default class SimpleValidationComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let ok = false;
		let isValidation = false;
		switch (this.props.dataChainType) {
			case DataChainType.Validation:
			case DataChainType.Permission:
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
			simpleValidation,
			properties,
			targetProperties
		}: {
			simpleValidation: SimpleValidationConfig;
			methodDescription: MethodDescription;
			properties: any[];
			targetProperties: any[];
		} = props;
		simpleValidation.oneOf = simpleValidation.oneOf || CreateOneOf();
		simpleValidation.isTrue = simpleValidation.isTrue || CreateBoolean();
		simpleValidation.isFalse = simpleValidation.isFalse || CreateBoolean();
		let valid =
			simpleValidation &&
			simpleValidation.enabled &&
			((simpleValidation.relationType === RelationType.Agent && simpleValidation.agentProperty) ||
				(simpleValidation.relationType === RelationType.ModelOuput && simpleValidation.modelOutputProperty) ||
				(simpleValidation.relationType === RelationType.Parent && simpleValidation.parentProperty) ||
				(simpleValidation.relationType === RelationType.Model && simpleValidation.modelProperty));

		let name = GetSimpleValidationId(simpleValidation, properties);
		let simpleValidationConfiguration: SimpleValidationsConfiguration = this.props.simpleValidationConfiguration;
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={CheckSimpleValidation(simpleValidation) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={!simpleValidation.enabled}
				title={name || Titles.SimpleValidation}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={simpleValidation.enabled}
						onChange={(value: boolean) => {
							simpleValidation.enabled = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer hide={!simpleValidation.enabled}>
					<TextBox
						title={Titles.Name}
						label={Titles.Name}
						value={simpleValidation.name}
						onChange={(val: string) => {
							simpleValidation.name = val;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange(simpleValidation.id);
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItem
					hide={
						!simpleValidation.enabled ||
						!simpleValidationConfiguration ||
						!simpleValidationConfiguration.enabled
					}
					icon={'fa fa-plus-square'}
					title={Titles.AddValidationItem}
					onClick={() => {
						if (this.props.onValidationAdd) {
							this.props.onValidationAdd(simpleValidation.id);
						}
					}}
				/>
				<RelativeTypeComponent
					methodDescription={methodDescription}
					relations={simpleValidation}
					valid={valid}
					enabled={simpleValidation.enabled}
					properties={properties}
					dataChainType={this.props.dataChainType}
					targetProperties={targetProperties}
					hideTargetProperty
				/>
				<NumberConfigComponent
					enabled={simpleValidation.enabled}
					numberConfig={simpleValidation.maxLength}
					title={Titles.MaxLength}
				/>
				<NumberConfigComponent
					enabled={simpleValidation.enabled}
					numberConfig={simpleValidation.minLength}
					title={Titles.MinLength}
				/>
				<EqualityConfigComponent
					enabled={simpleValidation.enabled}
					methodDescription={methodDescription}
					dataChainType={this.props.dataChainType}
					targetProperties={targetProperties}
					properties={properties}
					config={simpleValidation.areEqual}
					title={Titles.AreEqual}
				/>
				<EqualityConfigComponent
					enabled={simpleValidation.enabled}
					methodDescription={methodDescription}
					dataChainType={this.props.dataChainType}
					targetProperties={targetProperties}
					properties={properties}
					config={simpleValidation.isContained}
					title={Titles.IsContained}
				/>
				<EqualityConfigComponent
					enabled={simpleValidation.enabled}
					methodDescription={methodDescription}
					dataChainType={this.props.dataChainType}
					targetProperties={targetProperties}
					properties={properties}
					config={simpleValidation.isIntersecting}
					title={Titles.AreIntersecting}
				/>
				<EqualityConfigComponent
					enabled={simpleValidation.enabled}
					methodDescription={methodDescription}
					dataChainType={this.props.dataChainType}
					targetProperties={targetProperties}
					properties={properties}
					config={simpleValidation.isNotContained}
					title={Titles.IsNotContained}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.isNotNull}
					title={Titles.IsNotNull}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.isTrue}
					title={Titles.IsTrue}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.isFalse}
					title={Titles.IsFalse}
				/>

				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.alphaNumeric}
					title={Titles.AlphaNumeric}
				/>

				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.alphaOnly}
					title={Titles.AlphaOnly}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.creditCard}
					title={Titles.CreditCard}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.email}
					title={Titles.Email}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.emailEmpty}
					title={Titles.EmailEmpty}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.numericInt}
					title={Titles.NumericInteger}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.requireLowercase}
					title={Titles.RequireLowercase}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.requireNonAlphanumeric}
					title={Titles.RequireNonAlphaNumeric}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.requireUppercase}
					title={Titles.RequireUppercase}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.socialSecurity}
					title={Titles.SocialSecurity}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.url}
					title={Titles.Url}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.urlEmpty}
					title={Titles.UrlEmpty}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.zip}
					title={Titles.Zip}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.zipEmpty}
					title={Titles.ZipEmpty}
				/>

				<OneOfEnumerationComponent
					enabled={simpleValidation.enabled}
					enumerationConfig={simpleValidation.oneOf}
					title={Titles.IsOneOf}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.isNull}
					title={Titles.IsNull}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.alphaOnlyWithSpaces}
					title={Titles.AlphaOnlyWithSpaces}
				/>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Delete}`}
						onClick={() => {
							if (this.props.onDelete) {
								this.props.onDelete();
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
						}}
						icon="fa fa-minus"
					/>
					<TreeViewGroupButton
						title={`${Titles.Copy}`}
						onClick={() => {
							UIA.CopyToContext(
								simpleValidation,
								UIA.CopyType.SimpleValidation,
								methodDescription.properties.model,
								methodDescription.properties.agent,
								simpleValidation.name
							);
						}}
						icon="fa fa-copy"
					/>
					<TreeViewGroupButton
						title={`${Titles.Paste}`}
						onClick={() => {
							let parts = UIA.GetSelectedCopyContext(
								UIA.CopyType.SimpleValidation,
								methodDescription.properties.model,
								methodDescription.properties.agent
							);
							let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
							dataChainOptions.simpleValidations = dataChainOptions.simpleValidations || [];
							dataChainOptions.simpleValidations.push(...parts.map((v) => v.obj));
						}}
						icon="fa fa-paste"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
