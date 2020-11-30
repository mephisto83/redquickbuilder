// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
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
	getRelationProperties,
	DirectRelation
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';
import ReturnSettings from './returnsettings';
import DataChainOptions from './datachainoptions';
import StretchPathComponent from './stretchpathcomponent';

export default class DirectRelationComponent extends Component<any, any> {
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
			relation: relation
		}: {
			methodDescription: MethodDescription;
			relation: DirectRelation;
		} = props;
		// let startModel =
		// 	relations.relationType === RelationType.Agent
		// 		? methodDescription.properties.agent
		// 		: methodDescription.properties.model_output || methodDescription.properties.model;
		let title = '';
		let property = '';
		switch (relation.relationType) {
			case RelationType.Agent:
				title = UIA.GetNodeTitle(methodDescription.properties.agent);
				property = relation.property;
				break;
			case RelationType.Model:
				title = UIA.GetNodeTitle(
					methodDescription.properties.model_output || methodDescription.properties.model
				);
				property = relation.property;
				break;
			case RelationType.ModelOutput:
				title = UIA.GetNodeTitle(
					methodDescription.properties.model_output || methodDescription.properties.model
				);
				property = relation.property;
				break;
			case RelationType.Parent:
				title = UIA.GetNodeTitle(methodDescription.properties.parent);
				property = relation.property;
				break;
		}
		let properties = getRelationProperties(methodDescription, relation);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={this.props.valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={property && title ? `${title}${UIA.GetNodeTitle(property)}` : Titles.RelationType}
			>
				<TreeViewItemContainer hide={this.props.hideModelAgent}>
					<SelectInput
						label={title}
						options={Object.values(RelationType).map((v: RelationType) => ({ title: v, value: v }))}
						value={relation.relationType}
						onChange={(value: RelationType) => {
							relation.relationType = value;
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
							switch (relation.relationType) {
								case RelationType.Agent:
									relation.property = value;
									if (methodDescription.properties.agent)
										relation.agent = methodDescription.properties.agent;
									break;
								case RelationType.Model:
									relation.property = value;
									if (methodDescription.properties.model)
										relation.agent = methodDescription.properties.model;
									break;
								case RelationType.ModelOutput:
									relation.property = value;
									if (methodDescription.properties.model_output)
										relation.agent = methodDescription.properties.model_output;
									break;
								case RelationType.Parent:
									relation.property = value;
									if (methodDescription.properties.parent)
										relation.agent = methodDescription.properties.parent;
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
			</TreeViewMenu>
		);
	}
}
