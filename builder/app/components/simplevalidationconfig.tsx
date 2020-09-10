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
	SimpleValidationsConfiguration,
	CreateAreEqual,
	clearSimpleValidation,
	CreateMaxLength,
	CreateMinLength
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
import { GetNodeProp } from '../methods/graph_methods';

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
		let valid = CheckSimpleValidation(simpleValidation);
		let onchange = () => {
			if (this.props.onChange) {
				this.props.onChange();
			}
		};
		let name = GetSimpleValidationId(simpleValidation, properties);
		let simpleValidationConfiguration: SimpleValidationsConfiguration = this.props.simpleValidationConfiguration;
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				error={!valid}
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
					<TreeViewGroupButton
						title={`${Titles.IsOwnedByAgents}`}
						onClick={() => {
							clearSimpleValidation(simpleValidation);
							simpleValidation.enabled = true;
							simpleValidation.relationType = RelationType.Agent;
							if (methodDescription.properties.agent) {
								simpleValidation.agent = methodDescription.properties.agent;
								let idProp: Node = UIA.GetModelPropertyChildren(simpleValidation.agent).find(
									(v: any) => GetNodeProp(v, NodeProperties.UIText) === 'Id'
								);
								if (idProp) {
									simpleValidation.agentProperty = idProp.id;
								}
							}
							if (methodDescription.properties.model) {
								simpleValidation.areEqual = CreateAreEqual();
								simpleValidation.areEqual.enabled = true;
								simpleValidation.areEqual.model = methodDescription.properties.model;
								let ownerProp: Node = UIA.GetModelPropertyChildren(
									simpleValidation.areEqual.model
								).find((v: any) => GetNodeProp(v, NodeProperties.UIText) === 'Owner');
								simpleValidation.areEqual.modelProperty = ownerProp.id;
								simpleValidation.areEqual.relationType = RelationType.Model;
							}
							simpleValidation.name = `The ${UIA.GetNodeTitle(
								methodDescription.properties.agent
							)} owns the ${UIA.GetNodeTitle(methodDescription.properties.model)}`;
							this.setState({ turn: Date.now() });
						}}
						icon="fa  fa-user-secret"
					/>
					<TreeViewGroupButton
						title={`Agent ${Titles.IsNotDeleted}`}
						onClick={() => {
							clearSimpleValidation(simpleValidation);
							simpleValidation.enabled = true;
							simpleValidation.relationType = RelationType.Agent;
							if (methodDescription.properties.agent) {
								simpleValidation.agent = methodDescription.properties.agent;
								let idProp: Node = UIA.GetModelPropertyChildren(simpleValidation.agent).find(
									(v: any) => GetNodeProp(v, NodeProperties.UIText) === 'Deleted'
								);
								if (idProp) {
									simpleValidation.agentProperty = idProp.id;
								}
							}
							simpleValidation.isFalse = CreateBoolean();
							simpleValidation.isFalse.enabled = true;
							simpleValidation.name = `The ${UIA.GetNodeTitle(
								methodDescription.properties.agent
							)} is not deleted`;
							this.setState({ turn: Date.now() });
						}}
						icon="fa  fa-shekel"
					/>
					<TreeViewGroupButton
						title={`Model ${Titles.IsNotDeleted}`}
						onClick={() => {
							clearSimpleValidation(simpleValidation);
							simpleValidation.enabled = true;
							simpleValidation.relationType = RelationType.Model;
							if (methodDescription.properties.model) {
								simpleValidation.model = methodDescription.properties.model;
								let idProp: Node = UIA.GetModelPropertyChildren(simpleValidation.model).find(
									(v: any) => GetNodeProp(v, NodeProperties.UIText) === 'Deleted'
								);
								if (idProp) {
									simpleValidation.modelProperty = idProp.id;
								}
							}
							simpleValidation.isFalse = CreateBoolean();
							simpleValidation.isFalse.enabled = true;
							simpleValidation.name = `The ${UIA.GetNodeTitle(
								methodDescription.properties.model
							)} is not deleted`;
							this.setState({ turn: Date.now() });
						}}
						icon="fa fa-rouble"
					/>
					<TreeViewGroupButton
						title={`Is Valid ${Titles.Name}`}
						onClick={() => {
							let oldProp = simpleValidation.modelProperty;
							clearSimpleValidation(simpleValidation);
							simpleValidation.modelProperty = oldProp;
							simpleValidation.enabled = true;
							simpleValidation.relationType = RelationType.Model;
							if (methodDescription.properties.model) {
								simpleValidation.model = methodDescription.properties.model;
							}
							simpleValidation.maxLength = CreateMaxLength();
							simpleValidation.maxLength.enabled = true;
							simpleValidation.minLength = CreateMinLength();
							simpleValidation.minLength.enabled = true;
							simpleValidation.alphaOnlyWithSpaces = CreateBoolean();
							simpleValidation.alphaOnlyWithSpaces.enabled = true;
							simpleValidation.name = `The ${UIA.GetNodeTitle(
								methodDescription.properties.model
							)}${simpleValidation.modelProperty ? `'s` : ''} ${simpleValidation.modelProperty
								? UIA.GetNodeTitle(simpleValidation.modelProperty)
								: ''} is a valid name`;
							this.setState({ turn: Date.now() });
						}}
						icon="fa  fa-jpy"
					/>
				</TreeViewButtonGroup>
				<RelativeTypeComponent
					methodDescription={methodDescription}
					relations={simpleValidation}
					valid={valid}
					enabled={simpleValidation.enabled}
					properties={properties}
					dataChainType={this.props.dataChainType}
					targetProperties={targetProperties}
					hideTargetProperty
					onChange={onchange}
				/>
				<NumberConfigComponent
					enabled={simpleValidation.enabled}
					numberConfig={simpleValidation.maxLength}
					title={Titles.MaxLength}
					onChange={onchange}
				/>
				<NumberConfigComponent
					enabled={simpleValidation.enabled}
					numberConfig={simpleValidation.minLength}
					title={Titles.MinLength}
					onChange={onchange}
				/>
				<EqualityConfigComponent
					enabled={simpleValidation.enabled}
					methodDescription={methodDescription}
					dataChainType={this.props.dataChainType}
					targetProperties={targetProperties}
					properties={properties}
					onChange={onchange}
					config={simpleValidation.areEqual}
					title={Titles.AreEqual}
				/>
				<EqualityConfigComponent
					enabled={simpleValidation.enabled}
					methodDescription={methodDescription}
					dataChainType={this.props.dataChainType}
					onChange={onchange}
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
					onChange={onchange}
					properties={properties}
					config={simpleValidation.isIntersecting}
					title={Titles.AreIntersecting}
				/>
				<EqualityConfigComponent
					enabled={simpleValidation.enabled}
					methodDescription={methodDescription}
					onChange={onchange}
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
					onChange={onchange}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.isTrue}
					title={Titles.IsTrue}
					onChange={onchange}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.date}
					title={Titles.Date}
					onChange={onchange}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.isFalse}
					onChange={onchange}
					title={Titles.IsFalse}
				/>

				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					booleanConfig={simpleValidation.alphaNumeric}
					title={Titles.AlphaNumeric}
				/>

				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.alphaOnly}
					title={Titles.AlphaOnly}
					onChange={onchange}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					booleanConfig={simpleValidation.creditCard}
					title={Titles.CreditCard}
				/>
				<BooleanConfigComponent
					onChange={onchange}
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.email}
					title={Titles.Email}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					booleanConfig={simpleValidation.emailEmpty}
					title={Titles.EmailEmpty}
				/>
				<BooleanConfigComponent
					onChange={onchange}
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.numericInt}
					title={Titles.NumericInteger}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.requireLowercase}
					onChange={onchange}
					title={Titles.RequireLowercase}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					booleanConfig={simpleValidation.requireNonAlphanumeric}
					title={Titles.RequireNonAlphaNumeric}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.requireUppercase}
					onChange={onchange}
					title={Titles.RequireUppercase}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.socialSecurity}
					onChange={onchange}
					title={Titles.SocialSecurity}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.url}
					onChange={onchange}
					title={Titles.Url}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					booleanConfig={simpleValidation.urlEmpty}
					title={Titles.UrlEmpty}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.zip}
					onChange={onchange}
					title={Titles.Zip}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					booleanConfig={simpleValidation.zipEmpty}
					title={Titles.ZipEmpty}
				/>

				<OneOfEnumerationComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					enumerationConfig={simpleValidation.oneOf}
					title={Titles.IsOneOf}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					onChange={onchange}
					booleanConfig={simpleValidation.isNull}
					title={Titles.IsNull}
				/>
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.alphaOnlyWithSpaces}
					onChange={onchange}
					title={Titles.AlphaOnlyWithSpaces}
				/>
			</TreeViewMenu>
		);
	}
}
