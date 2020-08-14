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
	CreateOneOf
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
import OneOfEnumerationComponent from './oneofenumeration';
import SimpleValidationComponent from './simplevalidationconfig';

export default class SimpleValidationsComponent extends Component<any, any> {
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
			case DataChainType.Permission:
				isValidation = true;
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}

		let {
			methodDescription,
			simpleValidations,
			properties,
			targetProperties
		}: {
			methodDescription: MethodDescription;
			simpleValidations: SimpleValidationConfig[];
			properties: any[];
			targetProperties: any[];
		} = this.setupInstanceInfo(dataChainOptions);

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={
					!simpleValidations.some((v) => !CheckSimpleValidation(v)) ? (
						'fa fa-check-circle-o'
					) : (
						'fa fa-circle-o'
					)
				}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={!simpleValidations.some((v) => v.enabled)}
				title={Titles.SimpleValidation}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Add}`}
						onClick={() => {
							simpleValidations.push(CreateSimpleValidation());
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{simpleValidations.map((simpleValidation: SimpleValidationConfig, index: number) => {
					return (
						<SimpleValidationComponent
							key={`${index}-simple-validations`}
							dataChainType={this.props.dataChainType}
							simpleValidation={simpleValidation}
							methodDescription={methodDescription}
							properties={properties}
							targetProperties={targetProperties}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		dataChainOptions.simpleValidation = dataChainOptions.simpleValidation || CreateSimpleValidation();
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
