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
				title={executionConfig.name || Titles.Execution}
			>
				<TreeViewMenu
					open={this.state.sentence}
					active
					title={'Sentence Input'}
					onClick={() => {
						if (!this.state.sentence) {
							if (executionConfig.dataChainOptions) {
								let { simpleValidations } = executionConfig.dataChainOptions;
								if (simpleValidations) {
									this.setState({
										sentences: simpleValidations.map((v) => v.name).filter((v) => v).join(NEW_LINE)
									});
								}
							}
						}
						this.setState({
							sentence: !this.state.sentence
						});
					}}
				>
					<TreeViewItemContainer>
						<TextInput
							textarea
							label={'Sentences'}
							value={this.state.sentences}
							onChange={(val: string) => {
								this.setState({ sentences: val });
							}}
						/>
					</TreeViewItemContainer>
					<TreeViewButtonGroup>
						<TreeViewGroupButton
							icon="fa fa-star"
							onClick={() => {
								if (this.props.methodDescription && this.props.methodDescription.properties)
									if (this.state.sentences) {
										this.autoUpdateSentences(executionConfig, mountingItem);
										this.setState({
											turn: UIA.GUID()
										});
										if (this.props.onChange) {
											this.props.onChange();
										}
									}
							}}
						/>
						<TreeViewGroupButton
							icon="fa  fa-shekel"
							title={`Agent ${Titles.IsNotDeleted}`}
							onClick={() => {
								let AGENT_IS_NOT_DELETED = `The agent's deleted property is false`;
								if (this.state.sentences.indexOf(AGENT_IS_NOT_DELETED) === -1) {
									this.setState(
										{
											sentences: [ this.state.sentences, AGENT_IS_NOT_DELETED ]
												.filter((x) => x)
												.join(NEW_LINE)
										},
										() => {
											this.autoUpdateSentences(executionConfig, mountingItem);
										}
									);
								}
							}}
						/>
						<TreeViewGroupButton
							icon="fa fa-rouble"
							title={`Model ${Titles.IsNotDeleted}`}
							onClick={() => {
								let MODEL_IS_NOT_DELETED = `The model's deleted property is false`;
								if (this.state.sentences.indexOf(MODEL_IS_NOT_DELETED) === -1) {
									this.setState(
										{
											sentences: [ this.state.sentences, MODEL_IS_NOT_DELETED ]
												.filter((x) => x)
												.join(NEW_LINE)
										},
										() => {
											this.autoUpdateSentences(executionConfig, mountingItem);
										}
									);
								}
							}}
						/>
						<TreeViewGroupButton
							icon="fa  fa-inr"
							title={`Model Output ${Titles.IsNotDeleted}`}
							onClick={() => {
								let MODEL_IS_NOT_DELETED = `The output's deleted property is false`;
								if (this.state.sentences.indexOf(MODEL_IS_NOT_DELETED) === -1) {
									this.setState(
										{
											sentences: [ this.state.sentences, MODEL_IS_NOT_DELETED ]
												.filter((x) => x)
												.join(NEW_LINE)
										},
										() => {
											this.autoUpdateSentences(executionConfig, mountingItem);
										}
									);
								}
							}}
						/>
						<TreeViewGroupButton
							icon="fa fa-rmb"
							title={`Agent owns the model`}
							onClick={() => {
								let AGENT_OWN_THE_MODEL = `The agent's id property is equal to the model's owner property.`;
								if (this.state.sentences.indexOf(AGENT_OWN_THE_MODEL) === -1) {
									this.setState(
										{
											sentences: [ this.state.sentences, AGENT_OWN_THE_MODEL ]
												.filter((x) => x)
												.join(NEW_LINE)
										},
										() => {
											this.autoUpdateSentences(executionConfig, mountingItem);
										}
									);
								}
							}}
						/>
					</TreeViewButtonGroup>
				</TreeViewMenu>
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
  autoUpdateSentences(executionConfig: ExecutionConfig, mountingItem: MountingDescription) {
    throw new Error("Method not implemented.");
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
export function updateValidationMethod({
	executionConfig,
	results,
	mountingItem,
	viewType,
	methodDescription,
	functionName,
	options
}: {
	executionConfig: ExecutionConfig;
	results: NLMeaning[];
	methodDescription: MethodDescription;
	viewType: string;
	functionName: string;
	mountingItem: MountingDescription;
	options: { methods: any; routes: any; dataChainType: string; override: boolean };
}) {
	let methods = options.methods;
	let routes = options.routes;
	let dataChainType = options.dataChainType;
	let override = options.override;

	let { simpleValidations } = executionConfig.dataChainOptions;
	if (simpleValidations) {
		let newSimpleValidations: any[] = results.map((meaning: NLMeaning) => {
			let simpleValidation = CreateSimpleValidation();
			simpleValidation.enabled = true;
			simpleValidation.name = meaning.text;
			if (meaning.actorClause.relationType) {
				simpleValidation.relationType = meaning.actorClause.relationType;
				setupRelation(simpleValidation, meaning.actorClause);
			}
			switch (meaning.methodType) {
			}
			return simpleValidation;
		});
		if (newSimpleValidations) {
			executionConfig.dataChainOptions.simpleValidations =
				executionConfig.dataChainOptions.simpleValidations || [];
			executionConfig.dataChainOptions.simpleValidations.length = 0;
			executionConfig.dataChainOptions.simpleValidations.push(...newSimpleValidations);

			autoNameExecutionConfig(
				executionConfig,
				viewType,
				mountingItem,
				methodDescription,
				functionName,
				methods,
				override
			);
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
