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
	GetSimpleValidationId
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
				(simpleValidation.relationType === RelationType.Model && simpleValidation.modelProperty));

		let name = GetSimpleValidationId(simpleValidation, properties);

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
					hide={!simpleValidation.enabled}
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
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
