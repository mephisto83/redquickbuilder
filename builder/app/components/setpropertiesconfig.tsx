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
	CreateGetExistence,
	CheckGetExisting,
	CreateSetProperties,
	CheckSetProperties,
	CreateSetProperty
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';
import AfterEffectSetProperty from './aftereffectsetproperty';
import AfterEffectSetupProperty from './aftereffectsetproperty';
import { NodesByType } from '../methods/graph_methods';

export default class SetPropertiesConfig extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		let ok = false;
		switch (this.props.dataChainType) {
			case DataChainType.AfterEffect:
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}
		dataChainOptions.setProperties = dataChainOptions.setProperties || CreateSetProperties();
		let methodDescription: MethodDescription = this.props.methodDescription;
		let setProperties = dataChainOptions.setProperties;
		let agentProperties: any[] = [];
		let modelProperties: any[] = [];
		let targetProperties: any[] = [];
		let enumerations: any[] = NodesByType(UIA.GetCurrentGraph(), NodeTypes.Enumeration).toNodeSelect();
		if (methodDescription) {
			if (methodDescription.properties && methodDescription.properties.agent) {
				agentProperties = UIA.GetModelPropertyChildren(
					methodDescription.properties.agent
				).toNodeSelect();
			}
			if (
				methodDescription.properties &&
				(methodDescription.properties.model_output || methodDescription.properties.model)
			) {
				modelProperties = UIA.GetModelPropertyChildren(
					methodDescription.properties.model_output ||
						methodDescription.properties.model ||
						''
				).toNodeSelect();
			}
		}

		if (
			methodDescription &&
			methodDescription.properties &&
			methodDescription.properties.model
		) {
			targetProperties = UIA.GetModelPropertyChildren(methodDescription.properties.model).toNodeSelect();
		}
		let onchange = () => {
			this.setState({
				turn: UIA.GUID()
			});
			if (this.props.onChange) {
				this.props.onChange();
			}
		};
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={CheckSetProperties(setProperties) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={Titles.SetPropertiesConfig}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={setProperties.enabled}
						onChange={(value: boolean) => {
							setProperties.enabled = value;
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
					open={this.state.config && setProperties.enabled}
					icon={CheckSetProperties(setProperties) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ config: !this.state.config });
					}}
					active={setProperties.enabled}
					title={Titles.Properties}
				>
					{setProperties.properties.map((setProperty, index: number) => {
						return (
							<AfterEffectSetupProperty
								agentProperties={agentProperties}
								modelProperties={modelProperties}
								targetProperties={targetProperties}
								enumerations={enumerations}
								key={index}
								setProperty={setProperty}
								onDelete={() => {
                  setProperties.properties.splice(index, 1);
                  onchange();
								}}
								onChange={onchange}
							/>
						);
					})}
				</TreeViewMenu>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Add} Property Setter`}
						onClick={() => {
							setProperties.properties.push(CreateSetProperty());
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
