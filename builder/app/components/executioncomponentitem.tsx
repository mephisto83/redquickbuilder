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
	ExecutionConfig,
	CreateNameSpaceConfig
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties, NEW_LINE } from '../constants/nodetypes';
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
import { MethodFunctions } from '../constants/functiontypes';
import { NLMeaning, NLMethodType } from '../service/naturallang';
import { GetNLMeaning } from './validationcomponentitem';

export default class ExecutionComponentItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = { override: true, sentences: '' };
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
				title={
					`${executionConfig.name}${executionConfig.summary ? `(${executionConfig.summary})` : ''}` ||
					Titles.Execution
				}
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
						onContext={this.props.onContext}
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
							buildDataChain(executionConfig, mountingItem, this.props.methods, this.state.override);
						}}
						icon="fa fa-gears"
					/>
					<TreeViewGroupButton
						title={`Auto Name`}
						onClick={() => {
							this.autoName(executionConfig, mountingItem);
						}}
						icon="fa fa-amazon"
					/>

					{this.props.methodDescription ? (
						<TreeViewGroupButton
							title={`${Titles.Copy}`}
							onClick={() => {
								UIA.CopyToContext(
									executionConfig,
									UIA.CopyType.ExecutionConfig,
									this.props.methodDescription.properties.model,
									this.props.methodDescription.properties.agent,
									executionConfig.name
								);
								this.setState({ turn: UIA.GUID() });
							}}
							icon="fa fa-copy"
						/>
					) : null}
					<TreeViewItemContainer>
						<CheckBox
							label={'Override'}
							value={this.state.override}
							onChange={(val: boolean) => {
								this.setState({ override: val });
							}}
						/>
					</TreeViewItemContainer>
					{executionConfig.dataChain ? (
						<TreeViewGroupButton
							icon={'fa fa-hand-grab-o'}
							onClick={() => {
								UIA.SelectNode(executionConfig.dataChain, null)(UIA.GetDispatchFunc());
							}}
						/>
					) : null}
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
	private autoName(executionConfig: ExecutionConfig, mountingItem: MountingDescription) {
		if (executionConfig) {
			if (mountingItem) {
				let { methodDescription, viewType } = mountingItem;
				if (methodDescription && MethodFunctions[methodDescription.functionType]) {
					switch (this.props.dataChainType || DataChainType.Validation) {
						case DataChainType.Execution:
							autoNameExecutionConfig(
								executionConfig,
								viewType,
								mountingItem,
								methodDescription,
								this.props.functionName,
								this.props.methods,
								this.state.override
							);
							this.setState({ turn: UIA.GUID() });
							break;
					}
				}
			}
		}
	}
}
export function autoNameExecutionConfig(
	executionConfig: ExecutionConfig,
	viewType: string,
	mountingItem: MountingDescription,
	methodDescription: MethodDescription,
	functionName: string,
	methods: any,
	override: any
) {
	setExecutionConfigName(executionConfig, viewType, methodDescription, functionName);
	buildDataChain(executionConfig, mountingItem, methods, override);
}
export function setExecutionConfigName(
	executionConfig: ExecutionConfig,
	viewType: string,
	methodDescription: MethodDescription,
	functionName: string
) {
	let targetProp: string = '';
	if (executionConfig.dataChain) {
		targetProp = UIA.GetNodeProp(executionConfig.dataChain, NodeProperties.TargetProperty);
		if (targetProp) {
			targetProp = UIA.GetNodeTitle(targetProp);
			if (targetProp) {
				targetProp = `Set ${targetProp}`;
			}
		}
	}
	if (functionName) {
		executionConfig.name = `${functionName} Execute For ${viewType} ${targetProp}`;
	} else {
		executionConfig.name = `${MethodFunctions[methodDescription.functionType].titleTemplate(
			UIA.GetNodeTitle(methodDescription.properties.model_output || methodDescription.properties.model),
			UIA.GetNodeTitle(methodDescription.properties.agent)
		)} Execute For ${viewType} ${targetProp}`;
	}
}

export function buildDataChain(
	executionConfig: ExecutionConfig,
	mountingItem: MountingDescription,
	methods: any,
	override: any
) {
	if (executionConfig) {
		if (mountingItem) {
			let { methodDescription } = mountingItem;
			if (methodDescription) {
				executionConfig.dataChainOptions.namespaceConfig = CreateNameSpaceConfig({
					space: [
						methodDescription.properties.agent,
						methodDescription.properties.model_output || methodDescription.properties.model,
						mountingItem.viewType,
						MethodFunctions[methodDescription.functionType].method
					]
				});

				BuildDataChainAfterEffectConverter(
					{
						name: executionConfig.name,
						routes: [],
						from: methodDescription,
						dataChain: executionConfig.dataChain,
						type: DataChainType.Execution,
						afterEffectOptions: executionConfig.dataChainOptions,
						methods,
						override
					},
					(dataChain: Node) => {
						executionConfig.dataChain = dataChain.id;
					}
				);
			}
		}
	}
}
