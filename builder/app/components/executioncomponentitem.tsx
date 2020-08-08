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
	ValidationConfig,
  ExecutionConfig
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

export default class ExecutionComponentItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let executionConfig: ExecutionConfig = this.props.executionConfig;
		if (!executionConfig) {
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
				title={executionConfig.name || Titles.Execution}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={executionConfig.name}
						onChange={(value: string) => {
							executionConfig.name = value;
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
						value={executionConfig.dataChain}
						onChange={(value: string) => {
							executionConfig.dataChain = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{executionConfig && executionConfig.dataChain ? (
					<DataChainOptions
						methods={this.props.methods}
						methodDescription={this.props.methodDescription}
            currentDescription={mountingItem}
            dataChainType={DataChainType.Execution}
						previousEffect={this.props.previousEffect}
						dataChainOptions={executionConfig.dataChainOptions}
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
							if (executionConfig) {
								if (mountingItem) {
									let { methodDescription } = mountingItem;
									if (methodDescription) {
										BuildDataChainAfterEffectConverter(
											{
												name: executionConfig.name,
												from: methodDescription,
												dataChain: executionConfig.dataChain,
												type: DataChainType.Execution,
												afterEffectOptions: executionConfig.dataChainOptions
											},
											(dataChain: Node) => {
												executionConfig.dataChain = dataChain.id;
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
