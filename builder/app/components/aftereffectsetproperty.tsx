// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import FormControl from './formcontrol';
import CheckBoxProperty from './checkboxproperty';
import { ViewTypes } from '../constants/viewtypes';
import TreeViewMenu from './treeviewmenu';
import {
	CheckSetProperty,
	SetProperty,
	SetPropertyType,
	TargetMethodType,
	RelationType
} from '../interface/methodprops';
import * as Titles from './titles';
import TreeViewItemContainer from './treeviewitemcontainer';
import SelectInput from './selectinput';
import TextInput from './textinput';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { NodeProperties } from '../constants/nodetypes';

export default class AfterEffectSetupProperty extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let setProperty: SetProperty = this.props.setProperty;
		if (!setProperty) {
			return <span />;
		}
		let value: string = '';
		let showSetProperty = false;
		let showValueInput = false;
		let showParentProperty = false;
		let showEnumeration = false;
		let enumerationOptions: any[] = [];
		let valueTitle = '';
		let targetProperty: string | null = null;
		switch (setProperty.setPropertyType) {
			case SetPropertyType.Double:
				value = setProperty.doubleValue;
				showValueInput = true;
				valueTitle = Titles.Double;
				break;
			case SetPropertyType.Enumeration:
				value = setProperty.enumeration;
				valueTitle = Titles.Enumeration;
				showEnumeration = true;
				let enumNode = UIA.GetNodeProp(value, NodeProperties.Enumeration);
				if (enumNode) {
					enumerationOptions = enumNode.map((v: { value: string; id: string }) => {
						return {
							title: v.value,
							value: v.id
						};
					});
				}
				break;
			case SetPropertyType.Float:
				value = setProperty.floatValue;
				showValueInput = true;
				valueTitle = Titles.Float;
				break;
			case SetPropertyType.Integer:
				value = setProperty.integerValue;
				showValueInput = true;
				valueTitle = Titles.Integer;
				break;
			case SetPropertyType.Property:
				showSetProperty = true;
				switch (setProperty.relationType) {
					case RelationType.Agent:
						value = setProperty.agentProperty;
						break;
					case RelationType.Model:
						value = setProperty.modelProperty;
						break;
					case RelationType.ModelOutput:
						value = setProperty.modelOutputProperty;
						break;
					case RelationType.Parent:
						value = setProperty.parentProperty;
						break;
				}

				targetProperty = setProperty.targetProperty;
				valueTitle = Titles.Property;
				break;
			case SetPropertyType.String:
				value = setProperty.stringValue;
				showValueInput = true;
				valueTitle = Titles.String;
				break;
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={!CheckSetProperty(setProperty) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={UIA.GetNodeTitle(setProperty.targetProperty) || Titles.GetExisting}
			>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.SetPropertyType}
						options={Object.values(SetPropertyType).map((v) => ({ title: v, value: v }))}
						value={setProperty.setPropertyType}
						onChange={(value: SetPropertyType) => {
							setProperty.setPropertyType = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{showSetProperty ? (
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.RelationType}
							options={Object.values(RelationType).map((v) => ({ title: v, value: v }))}
							value={setProperty.relationType}
							onChange={(value: RelationType) => {
								setProperty.relationType = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showSetProperty && setProperty.relationType === RelationType.Agent ? (
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.Agents}
							options={this.props.agentProperties || []}
							value={setProperty.agentProperty}
							onChange={(value: string) => {
								setProperty.agentProperty = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showSetProperty && setProperty.relationType === RelationType.Model ? (
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.Model}
							options={this.props.modelProperties || []}
							value={setProperty.modelProperty}
							onChange={(value: string) => {
								setProperty.modelProperty = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showSetProperty && setProperty.relationType === RelationType.Parent ? (
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.Parent}
							options={this.props.parentProperties || []}
							value={setProperty.parentProperty}
							onChange={(value: string) => {
								setProperty.parentProperty = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showSetProperty && setProperty.relationType === RelationType.ModelOutput ? (
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.ModelOutput}
							options={this.props.modelOutputProperties || []}
							value={setProperty.modelOutputProperty}
							onChange={(value: string) => {
								setProperty.modelOutputProperty = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showSetProperty || showEnumeration ? (
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.Property}
							options={this.props.targetProperties || []}
							value={setProperty.targetProperty}
							onChange={(value: string) => {
								setProperty.targetProperty = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showEnumeration ? (
					<TreeViewItemContainer>
						<SelectInput
							label={Titles.Enumeration}
							options={this.props.enumerations || []}
							value={setProperty.enumeration}
							onChange={(value: string) => {
								setProperty.enumeration = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showEnumeration ? (
					<TreeViewItemContainer>
						<SelectInput
							label={UIA.GetNodeTitle(setProperty.enumeration) || Titles.Enumeration}
							options={enumerationOptions || []}
							value={setProperty.enumerationValue}
							onChange={(value: string) => {
								setProperty.enumerationValue = value;
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
						/>
					</TreeViewItemContainer>
				) : null}
				{showValueInput ? (
					<TreeViewItemContainer>
						<TextInput
							label={valueTitle}
							value={value}
							onChange={(value: string) => {
								switch (setProperty.setPropertyType) {
									case SetPropertyType.Double:
										setProperty.doubleValue = value;
										break;
									case SetPropertyType.Float:
										setProperty.floatValue = value;
										break;
									case SetPropertyType.Integer:
										setProperty.integerValue = value;
										break;
									case SetPropertyType.String:
										setProperty.stringValue = value;
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
				) : null}
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Remove}`}
						onClick={() => {
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onDelete) {
								this.props.onDelete();
							}
						}}
						icon="fa fa-times"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
