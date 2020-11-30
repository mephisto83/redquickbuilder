// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import {
	EnumerationConfig,
	RouteDescription,
	RouteSourceType,
	AfterEffect,
	NextStepConfiguration,
	SetProperty,
	MountingDescription,
	CreateAfterEffect,
	CreateNextStepsConfiguration,
	CreateNextStepConfiguration,
	CreateExistenceCheck,
	CreateConnectionChainItem,
	GetOrExistenceCheckConfig,
	CreateConstructModelConfig,
	RelationType,
	CreateNameSpaceConfig,
	CreateBoolean
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { ValidationColors } from '../interface/methodprops';
import { GetNLMeaning, GetNaturalLanguageMeaning } from './validationcomponentitem';
import { NLMeaning, NLMethodType, SetPropertyClause, QueryResultNL } from '../service/naturallang';
import { ViewTypes } from '../constants/viewtypes';
import { NEW_LINE } from '../constants/nodetypes';
import { CreateSetProperty } from '../interface/methodprops';
import { SetPropertyType } from '../interface/methodprops';
const AFTER_EFFECT_DELIMITER = '----------';

function captureAfterEffectSentence(afterEffect: AfterEffect) {
	if (
		afterEffect &&
		afterEffect.dataChainOptions &&
		afterEffect.dataChainOptions.nextStepsConfiguration &&
		afterEffect.dataChainOptions.nextStepsConfiguration.steps
	) {
		return afterEffect.dataChainOptions.nextStepsConfiguration.steps
			.map((step: NextStepConfiguration) => {
				return captureStepSentences(step).join(NEW_LINE + AFTER_EFFECT_DELIMITER + NEW_LINE);
			})
			.join();
	}
	return '';
}
function captureStepSentences(step: NextStepConfiguration): string[] {
	let result: string[] = [];
	if (step && step.enabled) {
		if (step.existenceCheck && step.existenceCheck.enabled) {
			if (step.existenceCheck.description) result.push(step.existenceCheck.description);
		}
		if (step.nonExistenceCheck && step.nonExistenceCheck.enabled) {
			if (step.nonExistenceCheck.description) result.push(step.nonExistenceCheck.description);
		}

		if (step.getExisting && step.getExisting.enabled) {
			if (step.getExisting.description) result.push(step.getExisting.description);
		}
		if (step.constructModel && step.constructModel.enabled) {
			if (step.constructModel.description) result.push(step.constructModel.description);
			if (step.constructModel.setProperties && step.constructModel.setProperties.properties) {
				step.constructModel.setProperties.properties.forEach((prop: SetProperty) => {
					result.push(prop.description);
				});
			}
		}
	}
	return result;
}
export default class AfterEffectInput extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = { sentences: '' };
	}
	componentWillUpdate(prevProps: any) {
		if (prevProps && prevProps.afterEffects && prevProps.afterEffects.routes) {
			let afterEffects: AfterEffect[] = prevProps.afterEffects;
			let sentences = afterEffects
				.map((afterEffect: AfterEffect) => captureAfterEffectSentence(afterEffect))
				.filter((v) => v)
				.join(NEW_LINE);
			if (this.state.afterEffects !== afterEffects && sentences !== this.state.sentences) {
				this.setState({ sentences, afterEffects: afterEffects });
			}
		}
	}
	getPlausibleContexts(): {}[] {
		let context: {}[] = [];
		if (this.props.methods) {
			let methods: MountingDescription[] = this.props.methods;

			methods.forEach((mount: MountingDescription) => {
				context.push({
					method: mount.name
				});
			});
		}
		if (this.props.afterEffects) {
			let afterEffects: AfterEffect[] = this.props.afterEffects;
			afterEffects.forEach((afterEffect: AfterEffect) => {
				let { nextStepsConfiguration } = afterEffect.dataChainOptions;
				if (nextStepsConfiguration != null) {
					if (nextStepsConfiguration.descriptionId) {
						let methods: MountingDescription[] = this.props.methods;
						let method = methods.find(
							(v) => nextStepsConfiguration && v.id === nextStepsConfiguration.descriptionId
						);
						if (method && method.methodDescription && method.methodDescription.properties) {
							let { properties } = method.methodDescription;
							if (properties.agent) context.push({ agent: properties.agent });
							if (properties.model) context.push({ model: properties.model });
							if (properties.model_output) context.push({ model_output: properties.model_output });
							if (properties.parent) context.push({ parent: properties.parent });
						}
					}
				}
			});
		}
		return context;
	}
	render() {
		let props: any = this.props;
		const { state } = this.props;

		let valid = !!this.state.sentences;

		return (
			<TreeViewMenu
				open={this.state.open}
				color={this.state.sentences ? ValidationColors.Ok : ValidationColors.Neutral}
				active
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.Routing}
			>
				<TreeViewItemContainer>
					<TextInput
						texteditor
						active={this.state.open}
						label={'Sentences'}
						context={{
							agent: this.props.agent,
							model: this.props.model,
							methodContext: this.getPlausibleContexts()
						}}
						immediate
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
							this.buildRoutes();
						}}
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}

	private buildRoutes() {
		let results: NLMeaning[] = GetNaturalLanguageMeaning({
			methodDescription: {
				agent: this.props.agent,
				model: this.props.model
			},
			sentences: this.state.sentences
		});

		if (results) {
			let afterEffects: AfterEffect[] = [];
			let currentAfterEffect: AfterEffect = CreateAfterEffect();
			currentAfterEffect.dataChainOptions.directExecute = true;
			currentAfterEffect.dataChainOptions.nextStepsConfiguration = CreateNextStepsConfiguration();
			currentAfterEffect.dataChainOptions.namespaceConfig = CreateNameSpaceConfig({
				space: [
					'AfterEffect',
					UIA.GetCodeNamespace(this.props.agent),
					UIA.GetCodeNamespace(this.props.model),
					this.props.viewType
				]
			});
			let nextStepConfiguration = CreateNextStepConfiguration();
			currentAfterEffect.dataChainOptions.nextStepsConfiguration.steps.push(nextStepConfiguration);
			results
				.map((meaning: NLMeaning) => {
					let { nextStepsConfiguration } = currentAfterEffect.dataChainOptions;
					switch (meaning.methodType) {
						case NLMethodType.ExecuteFunction:
							if (nextStepsConfiguration) {
								let methods: MountingDescription[] = this.props.methods;
								let method = methods.find((v) => v.name === meaning.functionName);
								if (method) {
									nextStepsConfiguration.descriptionId = method.id;
									if (meaning.functionName) currentAfterEffect.name = meaning.functionName;
									currentAfterEffect.target = method.id;
								}
							}
							break;
						case NLMethodType.CreateNew:
							if (meaning.createNew) {
								nextStepConfiguration.createNew = CreateBoolean();
								nextStepConfiguration.createNew.enabled = true;
							}
							break;
						case NLMethodType.CheckForNonExisting:
							if (meaning.checkForNonExisting) {
								nextStepConfiguration.nonExistenceCheck = CreateExistenceCheck();
								let { nonExistenceCheck } = nextStepConfiguration;
								nonExistenceCheck.opposite = true;
								nonExistenceCheck.description = meaning.text;
								setupGetOrExistenceCheck(nonExistenceCheck, meaning.checkForNonExisting);
							}
							break;
						case NLMethodType.CheckForExisting:
							if (meaning.checkForExisting) {
								nextStepConfiguration.existenceCheck = CreateExistenceCheck();
								let { existenceCheck } = nextStepConfiguration;
								existenceCheck.description = meaning.text;
								setupGetOrExistenceCheck(existenceCheck, meaning.checkForExisting);
							}
							break;
						case NLMethodType.FindAnExisting:
							if (meaning.findAnExisting) {
								nextStepConfiguration.getExisting = CreateExistenceCheck();
								let { getExisting } = nextStepConfiguration;
								getExisting.description = meaning.text;
								setupGetOrExistenceCheck(getExisting, meaning.findAnExisting);
							}
							break;
						case NLMethodType.SetProperty:
							if (meaning.setProperty) {
								let { setProperty } = meaning;
								nextStepConfiguration.constructModel = CreateConstructModelConfig();
								nextStepConfiguration.enabled = true;
								nextStepConfiguration.constructModel.enabled = true;
								nextStepConfiguration.constructModel.description = meaning.text;
								nextStepConfiguration.constructModel.setProperties.enabled = true;
								nextStepConfiguration.constructModel.setProperties.properties.push(
									CreateSetupProperty(setProperty)
								);
							}
							break;
						default:
							if (meaning.text.indexOf(AFTER_EFFECT_DELIMITER) !== -1) {
								afterEffects.push(currentAfterEffect);
								currentAfterEffect = CreateAfterEffect();
								currentAfterEffect.dataChainOptions.nextStepsConfiguration = CreateNextStepsConfiguration();
								nextStepConfiguration = CreateNextStepConfiguration();
								currentAfterEffect.dataChainOptions.nextStepsConfiguration.steps.push(
									nextStepConfiguration
								);
								currentAfterEffect.dataChainOptions.namespaceConfig = CreateNameSpaceConfig({
									space: [
										'AfterEffect',
										UIA.GetCodeNamespace(this.props.agent),
										UIA.GetCodeNamespace(this.props.model),
										this.props.viewType
									]
								});
							} else {
								if (nextStepsConfiguration) {
									nextStepsConfiguration.name = meaning.text;
								}
							}
							break;
					}
					let source: any =
						meaning.targetClause &&
						meaning.targetClause.argument &&
						meaning.targetClause.argument.as &&
						meaning.targetClause.argument.useArgument
							? {
									[meaning.targetClause.argument.as]: {
										model: meaning.targetClause.argument.useArgument,
										type: RouteSourceType.UrlParameter
									}
								}
							: null;
					if (
						!source &&
						meaning.targetClause &&
						meaning.targetClause.argument &&
						meaning.targetClause.argument.subClause &&
						meaning.targetClause.argument.as
					) {
						source = {
							[meaning.targetClause.argument.as]: {
								model: meaning.targetClause.argument.subClause.agent,
								property: meaning.targetClause.argument.subClause.property,
								type:
									meaning.targetClause.argument.subClause.agent === this.props.agent
										? RouteSourceType.Agent
										: RouteSourceType.Model
							}
						};
					}
					let route: RouteDescription = {
						agent: this.props.agent || '',
						model: meaning.targetClause.agent || '',
						viewType: meaning.viewType || '',
						id: UIA.GUID(),
						name: meaning.text
					};
					if (meaning.targetClause && meaning.targetClause.dashboard) {
						route.dashboard = meaning.targetClause.dashboard;
						route.isDashboard = true;
					}
					if (this.props.viewType === ViewTypes.GetAll && meaning.viewType !== ViewTypes.Create) {
						route.isItemized = true;
					}
					if (source) {
						route.source = source;
					}
					return route;
				})
				.filter((v) => v);
			if (this.props.onNewAfterEffects) {
				this.props.onNewAfterEffects(afterEffects);
			}
		}
	}
}
function CreateSetupProperty(clause: SetPropertyClause): SetProperty {
	let setProperty = CreateSetProperty();

	if (clause.targetClause.agent) {
		setProperty.model = clause.targetClause.agent;
		setProperty.modelProperty = clause.targetClause.property || '';
		setProperty.relationType = RelationType.Model;
	}
	if (clause.agentClause.property) {
		setProperty.targetProperty = clause.agentClause.property;
		setProperty.setPropertyType = SetPropertyType.Property;
	}
	return setProperty;
}

function setupGetOrExistenceCheck(existenceCheck: GetOrExistenceCheckConfig, queryResultNL: QueryResultNL) {
	existenceCheck.enabled = true;
	if (queryResultNL && queryResultNL.agentClause.agent) {
		existenceCheck.head.model = queryResultNL.agentClause.agent;
		existenceCheck.head.modelProperty = queryResultNL.agentClause.property || '';
		existenceCheck.head.relationType = RelationType.Model;
		existenceCheck.head.enabled = true;
	}
	let connectionChainItem = CreateConnectionChainItem();
	if (queryResultNL && queryResultNL.targetClause.agent) {
		connectionChainItem.enabled = true;
		connectionChainItem.model = queryResultNL.targetClause.agent;
		connectionChainItem.modelProperty = queryResultNL.targetClause.property || '';
		connectionChainItem.previousModelProperty = existenceCheck.head.modelProperty;
		existenceCheck.orderedCheck.push(connectionChainItem);
	}
}
