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
	ValidationConfig
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
import AfterEffectDataChainOptions from './aftereffectdatachainoptions';
import DataChainOptions from './datachainoptions';

export default class ValidationComponentItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let validationConfig: ValidationConfig = this.props.validationConfig;
		if (!validationConfig) {
			return <span />;
		}
		let mountingItem: MountingDescription = this.props.mountingItem;
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={validationConfig.name || Titles.Validation}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={validationConfig.name}
						onChange={(value: string) => {
							validationConfig.name = value;
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
						label={Titles.DataChain}
						options={UIA.NodesByType(null, NodeTypes.DataChain).toNodeSelect()}
						value={validationConfig.dataChain}
						onChange={(value: string) => {
							validationConfig.dataChain = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{validationConfig && validationConfig.dataChain ? (
					<DataChainOptions
						methods={this.props.methods}
						methodDescription={this.props.methodDescription}
            currentDescription={mountingItem}
            dataChainType={DataChainType.Validation}
						previousEffect={this.props.previousEffect}
						dataChainOptions={validationConfig.dataChainOptions}
					/>
				) : null}
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.RemoveScrenEffect}`}
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
						title={`Build Datachain`}
						onClick={() => {
							if (validationConfig) {
								if (mountingItem) {
									let { methodDescription } = mountingItem;
									if (methodDescription) {
										BuildDataChainAfterEffectConverter(
											{
												name: validationConfig.name,
												from: methodDescription,
												dataChain: validationConfig.dataChain,
												type: DataChainType.Validation,
												afterEffectOptions: validationConfig.dataChainOptions
											},
											(dataChain: Node) => {
												validationConfig.dataChain = dataChain.id;
												this.setState({
													turn: UIA.GUID()
												});
											}
										);
									}
								}
							}
						}}
						icon="fa fa-gears"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
