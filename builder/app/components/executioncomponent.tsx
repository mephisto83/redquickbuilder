// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	ExecutionConfig,
	ValidationColors,
	CheckValidationConfigs,
	MethodDescription,
	CreateCopyConfig,
	RelationType
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ExecutionComponentItem, { autoNameExecutionConfig, buildDataChain } from './executioncomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import TreeViewItemContainer from './treeviewitemcontainer';
import CheckBox from './checkbox';
import { NodeProperties, NEW_LINE } from '../constants/nodetypes';
import TextInput from './textinput';
import { Node } from '../methods/graph_types';
import { GetNLMeaning, setupRelation } from './validationcomponentitem';
import { NLMeaning, NLMethodType } from '../service/naturallang';

export default class ExecutionComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = { sentence: false, sentences: '' };
	}
	autoUpdateSentences({ sentences, mountingItem }: { sentences: string; mountingItem: MountingDescription }) {
		while (mountingItem.executions && mountingItem.executions.length) {
			deleteExecutions(mountingItem.executions, mountingItem.executions[0]);
		}
		if (mountingItem.methodDescription) {
			let nlMeaning: NLMeaning[] = GetNLMeaning({ sentences, methodDescription: mountingItem.methodDescription });
			nlMeaning.forEach((meaning: NLMeaning) => {
				let executionConfig: ExecutionConfig = {
					id: UIA.GUID(),
					name: '',
					dataChain: '',
					enabled: true,
					dataChainOptions: {},
					autoCalculate: true
				};
				let skip = false;
				switch (meaning.methodType) {
					case NLMethodType.CopyTo:
						let copyConfig = CreateCopyConfig();
						if (meaning.actorClause.relationType) {
							copyConfig.relationType = meaning.actorClause.relationType;
							setupRelation(copyConfig, meaning.actorClause);
							if (meaning.targetClause.property)
								copyConfig.targetProperty = meaning.targetClause.property;
							executionConfig.dataChainOptions.copyConfig = copyConfig;
							executionConfig.summary = meaning.text;
							copyConfig.enabled = true;
							executionConfig.name = `Copy ${UIA.GetNodeTitle(meaning.targetClause.property)}`;
						}
						break;
					case NLMethodType.IncrementBy:
					default:
						skip = true;
						break;
				}
				if (!skip) {
					mountingItem.executions.push(executionConfig);
				}
			});
			autoName(mountingItem, this.props.methods);
			this.setState({ turn: UIA.GUID() });
			if (this.props.onChange) {
				this.props.onChange();
			}
		}
	}

	componentWillReceiveProps() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		if (mountingItem) {
			mountingItem.executions = mountingItem.executions || [];
			let { executions } = mountingItem;
			if (executions) {
				this.setState({
					sentences: executions.map((v) => v.summary).filter((v) => v).join(NEW_LINE)
				});
			}
		}
	}

	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		mountingItem.executions = mountingItem.executions || [];
		let { executions } = mountingItem;

		let valid = CheckValidationConfigs(executions);
		return (
			<TreeViewMenu
				open={this.state.open}
				color={executions && executions.length ? ValidationColors.Ok : ValidationColors.Neutral}
				active
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.Executions}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Add} Execution `}
						onClick={() => {
							executions.push({
								id: UIA.GUID(),
								name: '',
								dataChain: '',
								enabled: true,
								dataChainOptions: {},
								autoCalculate: false
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
					{this.props.methodDescription ? (
						<TreeViewGroupButton
							title={`${Titles.Copy}`}
							onClick={() => {
								UIA.CopyToContext(
									executions,
									UIA.CopyType.ExecutionConfigs,
									this.props.methodDescription.properties.model,
									this.props.methodDescription.properties.agent,
									mountingItem.name
								);
								this.setState({ turn: UIA.GUID() });
							}}
							icon="fa fa-copy"
						/>
					) : null}
					<TreeViewGroupButton
						title={`Auto Name`}
						onClick={() => {
							autoName(mountingItem, this.props.methods);
							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-amazon"
					/>
					<TreeViewGroupButton
						title={`${Titles.Paste}`}
						onClick={() => {
							let methodDescription = this.props.methodDescription;
							if (methodDescription) {
								let parts = UIA.GetSelectedCopyContext(
									UIA.CopyType.ExecutionConfig,
									methodDescription.properties.model,
									methodDescription.properties.agent
								);
								parts.push(
									...UIA.GetSelectedCopyContext(
										UIA.CopyType.ExecutionConfigs,
										methodDescription.properties.model,
										methodDescription.properties.agent
									)
								);
								parts.map((v) => {
									if (Array.isArray(v.obj)) {
										executions.push(...v.obj);
									} else executions.push(v.obj);
								});
								this.setState({ turn: UIA.GUID() });
							}
						}}
						icon="fa fa-paste"
					/>
				</TreeViewButtonGroup>
				<TreeViewMenu
					open={this.state.sentence}
					active
					title={'Sentence Input'}
					onClick={() => {
						if (!this.state.sentence) {
							if (executions.length) {
								this.setState({
									sentences: executions.map((v) => v.summary).filter((v) => v).join(NEW_LINE)
								});
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
										this.autoUpdateSentences({ sentences: this.state.sentences, mountingItem });
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
							icon="fa fa-copy"
							onClick={() => {
								if (this.props.methodDescription && this.props.methodDescription.properties) {
									let methodDescription: MethodDescription = this.props.methodDescription;
									let targetProperties = methodDescription.properties.model
										? UIA.GetModelCodeProperties(methodDescription.properties.model).filter(
												(v: Node) => !UIA.GetNodeProp(v, NodeProperties.IsDefaultProperty)
											)
										: [];
									let sentences = targetProperties.map((v: Node) => {
										return `The model's ${UIA.GetCodeName(
											v
										).toLowerCase()} property copies to the target's ${UIA.GetCodeName(
											v
										).toLowerCase()}`;
									});
									let tempSentences = [
										...executions.map((v) => v.summary || '').filter((v) => v),
										...`${this.state.setences || ''}`.split(NEW_LINE),
										...sentences
									]
										.filter((v) => v)
										.unique()
										.join(NEW_LINE);
									this.setState({
										turn: UIA.GUID(),
										sentences: tempSentences
									});
									if (this.props.onChange) {
										this.props.onChange();
									}
								}
							}}
						/>
						<TreeViewGroupButton
							icon={'fa fa-user'}
							onClick={() => {
								if (this.props.methodDescription && this.props.methodDescription.properties) {
									this.autoUpdateSentences({
										sentences: [
											...`${this.state.sentences || ''}`.split(NEW_LINE),
											`The agent's id property copies to the target's owner property`
										]
											.unique()
											.join(NEW_LINE),
										mountingItem
									});
									this.setState({
										turn: UIA.GUID()
									});
									if (this.props.onChange) {
										this.props.onChange();
									}
								}
							}}
						/>
					</TreeViewButtonGroup>
				</TreeViewMenu>

				<TreeViewItemContainer>
					<CheckBox
						title={Titles.AutoCopy}
						label={Titles.AutoCopy}
						value={mountingItem.autoSetup && mountingItem.autoSetup.executionAutoCopy}
						onChange={(value: boolean) => {
							mountingItem.autoSetup = mountingItem.autoSetup || {};
							mountingItem.autoSetup.executionAutoCopy = value;
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{(executions || []).map((executionConfig: ExecutionConfig, index: number) => {
					return (
						<ExecutionComponentItem
							key={executionConfig.id}
							onContext={this.props.onContext}
							title={Titles.Execution}
							methodDescription={mountingItem.methodDescription}
							mountingItem={mountingItem}
							dataChainType={DataChainType.Execution}
							functionName={mountingItem.name}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								deleteExecutions(executions, executionConfig);
								this.setState({ turn: UIA.GUID() });
							}}
							executionConfig={executionConfig}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
function autoName(mountingItem: MountingDescription, methods: any) {
	let { methodDescription, viewType } = mountingItem;
	if (methodDescription) {
		mountingItem.executions
			.filter((v) => v.autoCalculate || v.autoCalculate === undefined)
			.forEach((executionConfig: ExecutionConfig) => {
				if (methodDescription) {
					buildDataChain(executionConfig, mountingItem, methods, true);
					buildDataChain(executionConfig, mountingItem, methods, true);
				}
			});
	}
}

function deleteExecutions(executions: ExecutionConfig[], executionConfig: ExecutionConfig) {
	let index: number = executions.findIndex((v) => v.id === executionConfig.id);
	if (index !== -1 && executions) {
		if (executionConfig.dataChain) {
			let originalConfig = UIA.GetNodeProp(executionConfig.dataChain, NodeProperties.OriginalConfig);
			if (originalConfig === executionConfig.dataChain) {
				UIA.removeNodeById(executionConfig.dataChain);
				executionConfig.dataChain = '';
			}
		}
		executions.splice(index, 1);
	}
}
