// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import SelectInput from './selectinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	ValidationConfig,
	CreateAreEqual,
	RelationType,
	AreEqualConfig,
	HalfRelation,
	CreateSimpleValidation,
	CreateOneOf,
	MethodDescription,
	CheckValidationConfig,
  ValidationColors
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties, Methods, NEW_LINE } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import DataChainOptions from './datachainoptions';
import { GetNodeProp } from '../methods/graph_methods';
import Typeahead from './typeahead';
import CheckBox from './checkbox';
import { MethodFunctions } from '../constants/functiontypes';
import getLanguageMeaning, { NLMeaning, NLMethodType, Clause, NLValidationClauses } from '../service/naturallang';

export default class ValidationComponentItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			override: true,
			sentences: ''
		};
	}
	render() {
		let validationConfig: ValidationConfig = this.props.validationConfig;
		if (!validationConfig) {
			return <span />;
		}
		let originalConfig = GetNodeProp(validationConfig.dataChain, NodeProperties.OriginalConfig);
		let mountingItem: MountingDescription = this.props.mountingItem;
		if (validationConfig.autoCalculate === undefined) {
			validationConfig.autoCalculate = true;
		}
		let valid = CheckValidationConfig(validationConfig);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				color={valid ? ValidationColors.Ok : ValidationColors.Neutral}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				error={!valid}
				title={this.props.otitle || validationConfig.name || this.props.title || Titles.Validation}
			>
				<TreeViewMenu
					open={this.state.sentence}
					active
					title={'Sentence Input'}
					onClick={() => {
						if (!this.state.sentence) {
							if (validationConfig.dataChainOptions) {
								let { simpleValidations } = validationConfig.dataChainOptions;
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
										this.autoUpdateSentences(validationConfig, mountingItem);
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
											this.autoUpdateSentences(validationConfig, mountingItem);
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
											this.autoUpdateSentences(validationConfig, mountingItem);
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
											this.autoUpdateSentences(validationConfig, mountingItem);
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
											this.autoUpdateSentences(validationConfig, mountingItem);
										}
									);
								}
							}}
						/>
						<TreeViewGroupButton
							icon="fa fa-dollar"
							title={`Default Permission Setup`}
							onClick={() => {
								let AGENT_IS_NOT_DELETED = `The agent's deleted property is false`;
								let MODEL_IS_NOT_DELETED = `The model's deleted property is false`;
								let AGENT_OWN_THE_MODEL = `The agent's id property is equal to the model's owner property.`;
								if (this.state.sentences.indexOf(AGENT_OWN_THE_MODEL) === -1) {
									this.setState(
										{
											sentences: [
												...`${this.state.sentences}`.split(NEW_LINE),
												AGENT_IS_NOT_DELETED,
												MODEL_IS_NOT_DELETED,
												AGENT_OWN_THE_MODEL
											]
												.unique()
												.filter((x: any) => x)
												.join(NEW_LINE)
										},
										() => {
											if (this.props.methodDescription && this.props.methodDescription.properties)
												if (this.state.sentences) {
													let results: NLMeaning[] = GetNLMeaning({
														methodDescription: this.props.methodDescription,
														sentences: this.state.sentences
													});
													let methods = this.props.methods;
													let routes = this.props.routes;
													let dataChainType = this.props.dataChainType;
													let override = this.props.override;
													updateValidationMethod({
														validationConfig,
														results,
														mountingItem,
														options: { methods, routes, dataChainType, override }
													});
													this.setState({
														turn: UIA.GUID()
													});
													if (this.props.onChange) {
														this.props.onChange();
													}
												}
										}
									);
								}
							}}
						/>
						<TreeViewGroupButton
							icon="fa fa-gbp"
							title={`Default Filter Setup`}
							onClick={() => {
								let AGENT_IS_NOT_DELETED = `The agent's deleted property is false`;
								let MODEL_IS_NOT_DELETED = `The output's deleted property is false`;
								let AGENT_OWN_THE_MODEL = `The agent's id property is equal to the output's owner property.`;
								if (this.state.sentences.indexOf(AGENT_OWN_THE_MODEL) === -1) {
									this.setState(
										{
											sentences: [
												...`${this.state.sentences}`.split(NEW_LINE),
												AGENT_IS_NOT_DELETED,
												MODEL_IS_NOT_DELETED,
												AGENT_OWN_THE_MODEL
											]
												.unique()
												.filter((x: any) => x)
												.join(NEW_LINE)
										},
										() => {
											if (this.props.methodDescription && this.props.methodDescription.properties)
												if (this.state.sentences) {
													let results: NLMeaning[] = GetNLMeaning({
														methodDescription: this.props.methodDescription,
														sentences: this.state.sentences
													});
													let methods = this.props.methods;
													let routes = this.props.routes;
													let dataChainType = this.props.dataChainType;
													let override = this.props.override;
													updateValidationMethod({
														validationConfig,
														results,
														mountingItem,
														options: { methods, routes, dataChainType, override }
													});
													this.setState({
														turn: UIA.GUID()
													});
													if (this.props.onChange) {
														this.props.onChange();
													}
												}
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
					<Typeahead
						label={Titles.DataChain}
						nodeSelect={(v: string) => {
							let node: Node = UIA.GetNodeById(v);
							if (node) {
								return UIA.GetNodeTitle(node);
							}
							return v;
						}}
						options={UIA.NodesByType(null, NodeTypes.DataChain).toNodeSelect()}
						value={validationConfig.dataChain}
						onChange={(value: string) => {
							if (UIA.GetNodeById(value)) {
								validationConfig.dataChain = value;
								validationConfig.name = UIA.GetNodeTitle(value);

								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.AutoCalculate}
						onChange={(val: boolean) => {
							validationConfig.autoCalculate = val;
						}}
						value={validationConfig.autoCalculate}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Delete}`}
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
					{originalConfig && originalConfig !== validationConfig.id ? null : (
						<TreeViewGroupButton
							title={`Build Datachain`}
							onClick={() => {
								let methods = this.props.methods;
								let routes = this.props.routes;
								let dataChainType = this.props.dataChainType;
								let override = this.state.override;
								validationDataChain(
									validationConfig,
									mountingItem,
									dataChainType,
									methods,
									routes,
									override
								);
								this.setState({
									turn: UIA.GUID()
								});
							}}
							icon="fa fa-gears"
						/>
					)}
					<TreeViewGroupButton
						title={`Auto Name`}
						onClick={() => {
							let methods = this.props.methods;
							let routes = this.props.routes;
							let dataChainType = this.props.dataChainType;
							let override = this.state.override;
							autoNameGenerateDataChain(
								validationConfig,
								mountingItem,
								dataChainType,
								methods,
								routes,
								override
							);
							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-amazon"
					/>
					{validationConfig.dataChain ? (
						<TreeViewGroupButton
							icon={'fa fa-hand-grab-o'}
							onClick={() => {
								UIA.SelectNode(validationConfig.dataChain, null)(UIA.GetDispatchFunc());
							}}
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
				</TreeViewButtonGroup>
				{originalConfig && originalConfig !== validationConfig.id ? null : validationConfig &&
				validationConfig.dataChain ? (
					<DataChainOptions
						methods={this.props.methods}
						onContext={this.props.onContext}
						name={validationConfig.name}
						methodDescription={this.props.methodDescription}
						currentDescription={mountingItem}
						onChange={(val: boolean) => {
							this.setState({ turn: Date.now() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						dataChainType={this.props.dataChainType || DataChainType.Validation}
						previousEffect={this.props.previousEffect}
						dataChainOptions={validationConfig.dataChainOptions}
					/>
				) : null}
			</TreeViewMenu>
		);
	}

	private autoUpdateSentences(validationConfig: ValidationConfig, mountingItem: MountingDescription) {
		let results: NLMeaning[] = GetNLMeaning({
			methodDescription: this.props.methodDescription,
			sentences: this.state.sentences
		});

		let methods = this.props.methods;
		let routes = this.props.routes;
		let dataChainType = this.props.dataChainType;
		let override = this.props.override;
		updateValidationMethod({
			validationConfig,
			results,
			mountingItem,
			options: { methods, routes, dataChainType, override }
		});
		this.setState({
			turn: UIA.GUID()
		});
		if (this.props.onChange) {
			this.props.onChange();
		}
	}
}

export function GetNLMeaning(args: { sentences: string; methodDescription: MethodDescription }): NLMeaning[] {
	let { methodDescription, sentences } = args;
	let results: NLMeaning[] = sentences.split(NEW_LINE).filter((v: string) => v).map((line: string) => {
		return getLanguageMeaning(line, {
			...methodDescription.properties
		});
	});
	return results;
}
export function updateValidationMethod({
	validationConfig,
	results,
	mountingItem,
	options
}: {
	validationConfig: ValidationConfig;
	results: NLMeaning[];
	mountingItem: MountingDescription;
	options: { methods: any; routes: any; dataChainType: string; override: boolean };
}) {
	let methods = options.methods;
	let routes = options.routes;
	let dataChainType = options.dataChainType;
	let override = options.override;

	let { simpleValidations } = validationConfig.dataChainOptions;
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
				case NLMethodType.AreEqual:
					let areEqual = CreateAreEqual();
					if (meaning.targetClause.relationType) {
						areEqual.enabled = true;
						areEqual.relationType = meaning.targetClause.relationType;
						setupAreEqual(areEqual, meaning.targetClause);
						simpleValidation.areEqual = areEqual;
					}
					break;
				case NLMethodType.Contains:
				case NLMethodType.MatchEnumeration:
					let oneOf = CreateOneOf();
					if (meaning.targetClause.enumeration) {
						oneOf.enabled = true;
						oneOf.enumerationType = meaning.targetClause.enumeration;
						if (meaning.targetClause.enumerations) {
							oneOf.enumerations = meaning.targetClause.enumerations;
						}
						simpleValidation.oneOf = oneOf;
					}
					break;
				case NLMethodType.Intersects:
					let intersecting = CreateAreEqual();
					if (meaning.targetClause.relationType) {
						intersecting.enabled = true;
						intersecting.relationType = meaning.targetClause.relationType;
						setupAreEqual(intersecting, meaning.targetClause);
						simpleValidation.isIntersecting = intersecting;
					}
					break;
				case NLMethodType.IsFalse:
				case NLMethodType.IsTrue:
				case NLMethodType.IsA:
					if (meaning.validation) {
						Object.entries(meaning.validation).forEach((temp: any) => {
							let [ key, value ] = temp;
							if (!value) return;
							let nlvc: any = NLValidationClauses;
							if (nlvc[key] && nlvc[key].$property) {
								Object.entries(nlvc[key].$property).forEach((entry: any) => {
									let [ key, value ] = entry;
									let proxy: any = simpleValidation;
									proxy[key] = value();
									proxy[key].enabled = true;
								});
							}
						});
					}
					break;
			}
			return simpleValidation;
		});
		if (newSimpleValidations) {
			validationConfig.dataChainOptions.simpleValidations =
				validationConfig.dataChainOptions.simpleValidations || [];
			validationConfig.dataChainOptions.simpleValidations.length = 0;
			validationConfig.dataChainOptions.simpleValidations.push(...newSimpleValidations);

			autoNameGenerateDataChain(validationConfig, mountingItem, dataChainType, methods, routes, override);
		}
	}
}
export function autoNameGenerateDataChain(
	validationConfig: ValidationConfig,
	mountingItem: MountingDescription,
	dataChainType: any,
	methods: any,
	routes: any,
	override: any
) {
	autoName(validationConfig, mountingItem, {
		dataChainType: dataChainType,
		functionName: mountingItem.name
	});
	validationDataChain(validationConfig, mountingItem, dataChainType, methods, routes, override);
}

export function validationDataChain(
	validationConfig: ValidationConfig,
	mountingItem: MountingDescription,
	dataChainType: any,
	methods: any,
	routes: any,
	override: any
) {
	if (validationConfig) {
		if (mountingItem) {
			let { methodDescription } = mountingItem;
			if (methodDescription) {
				BuildDataChainAfterEffectConverter(
					{
						name: validationConfig.name,
						from: methodDescription,
						dataChain: validationConfig.dataChain,
						type: dataChainType || DataChainType.Validation,
						afterEffectOptions: validationConfig.dataChainOptions,
						methods: methods,
						routes: routes,
						override: override,
						validationConfig
					},
					(dataChain: Node) => {
						if (dataChain && UIA.GetNodeById(dataChain.id)) {
							validationConfig.dataChain = dataChain.id;
							if (!GetNodeProp(dataChain.id, NodeProperties.OriginalConfig)) {
								UIA.updateComponentProperty(
									dataChain.id,
									NodeProperties.OriginalConfig,
									validationConfig.id
								);
							}
						}
					}
				);
			}
		}
	}
}

export function autoName(
	validationConfig: ValidationConfig,
	mountingItem: MountingDescription,
	props: {
		dataChainType: DataChainType;
		functionName: string;
	}
) {
	let { functionName } = props;
	if (validationConfig) {
		if (mountingItem) {
			let { methodDescription, viewType } = mountingItem;
			if (methodDescription && MethodFunctions[methodDescription.functionType]) {
				let { method } = MethodFunctions[methodDescription.functionType];

				switch (props.dataChainType || DataChainType.Validation) {
					case DataChainType.Permission:
						if (functionName) {
							validationConfig.name = `Can ${functionName} Permission For ${viewType}`;
						} else {
							validationConfig.name = `Can ${MethodFunctions[
								methodDescription.functionType
							].titleTemplate(
								UIA.GetNodeTitle(
									methodDescription.properties.model_output || methodDescription.properties.model
								),
								UIA.GetNodeTitle(methodDescription.properties.agent)
							)} Permission For ${viewType}`;
						}
						break;
					case DataChainType.Validation:
						if (functionName) {
							validationConfig.name = `${functionName} Validation For ${viewType}`;
						} else {
							validationConfig.name = `${MethodFunctions[methodDescription.functionType].titleTemplate(
								UIA.GetNodeTitle(
									methodDescription.properties.model_output || methodDescription.properties.model
								),
								UIA.GetNodeTitle(methodDescription.properties.agent)
							)} Validation For ${viewType}`;
						}
						break;
					case DataChainType.Filter:
						if (functionName) {
							validationConfig.name = `${functionName} Filter For ${viewType}`;
						} else {
							validationConfig.name = `${MethodFunctions[methodDescription.functionType].titleTemplate(
								UIA.GetNodeTitle(
									methodDescription.properties.model_output || methodDescription.properties.model
								),
								UIA.GetNodeTitle(methodDescription.properties.agent)
							)} Filter For ${viewType}`;
						}
						break;
				}
			}
		}
	}
}

export function setupRelation(halfRelation: HalfRelation, clause: Clause) {
	switch (halfRelation.relationType) {
		case RelationType.Agent:
			if (clause.agent) {
				halfRelation.agent = clause.agent;
				if (clause.property) {
					halfRelation.agentProperty = clause.property;
				}
			}
			break;
		case RelationType.Model:
			if (clause.agent) {
				halfRelation.model = clause.agent;
				if (clause.property) {
					halfRelation.modelProperty = clause.property;
				}
			}
			break;
		case RelationType.ModelOuput:
			if (clause.agent) {
				halfRelation.modelOutput = clause.agent;
				if (clause.property) {
					halfRelation.modelOutputProperty = clause.property;
				}
			}
			break;
		case RelationType.Parent:
			if (clause.agent) {
				halfRelation.parent = clause.agent;
				if (clause.property) {
					halfRelation.parentProperty = clause.property;
				}
			}
			break;
	}
}
function setupAreEqual(areEqual: AreEqualConfig, clause: Clause) {
	switch (areEqual.relationType) {
		case RelationType.Agent:
			if (clause.agent) {
				areEqual.agent = clause.agent;
				if (clause.property) {
					areEqual.agentProperty = clause.property;
				}
			}
			break;
		case RelationType.Model:
			if (clause.agent) {
				areEqual.model = clause.agent;
				if (clause.property) {
					areEqual.modelProperty = clause.property;
				}
			}
			break;
		case RelationType.ModelOuput:
			if (clause.agent) {
				areEqual.modelOutput = clause.agent;
				if (clause.property) {
					areEqual.modelOutputProperty = clause.property;
				}
			}
			break;
		case RelationType.Parent:
			if (clause.agent) {
				areEqual.parent = clause.agent;
				if (clause.property) {
					areEqual.parentProperty = clause.property;
				}
			}
			break;
	}
}
