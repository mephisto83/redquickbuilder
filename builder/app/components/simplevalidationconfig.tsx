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
	CreateSimpleValidation
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
import RelativeTypeComponent from './relativetypecomponent';
import BooleanConfigComponent from './booleanconfigcomponent';
import NumberConfigComponent from './numberconfigcomponent';

export default class SimpleValidationComponent extends Component<any, any> {
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
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}

		let {
			methodDescription,
			simpleValidation,
			properties,
			targetProperties
		}: {
			methodDescription: MethodDescription;
			simpleValidation: SimpleValidationConfig;
			properties: any[];
			targetProperties: any[];
		} = this.setupInstanceInfo(dataChainOptions);

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={CheckSimpleValidation(simpleValidation) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={simpleValidation.enabled}
				title={Titles.SimpleValidation}
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
				<RelativeTypeComponent
					methodDescription={methodDescription}
					relations={simpleValidation}
					valid={
						dataChainOptions &&
						dataChainOptions.simpleValidation &&
						dataChainOptions.simpleValidation.enabled &&
						((dataChainOptions.simpleValidation.relationType === RelationType.Agent &&
							dataChainOptions.simpleValidation.agentProperty) ||
							(dataChainOptions.simpleValidation.relationType === RelationType.Model &&
								dataChainOptions.simpleValidation.modelProperty))
					}
					dataChainOptions={dataChainOptions}
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
				<BooleanConfigComponent
					enabled={simpleValidation.enabled}
					booleanConfig={simpleValidation.isNotNull}
					title={Titles.IsNotNull}
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
			</TreeViewMenu>
		);
	}

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		dataChainOptions.simpleValidation = dataChainOptions.simpleValidation || CreateSimpleValidation();
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
