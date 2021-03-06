import nlp from 'compromise';
import {
	NodesByType,
	GetNodeProp,
	GetCodeName,
	GetModelCodeProperties,
	GetCurrentGraph,
	GetNodeCode
} from '../actions/uiActions';
import * as monaco from 'monaco-editor';
import { NodeTypes, NodeProperties, MakeConstant, NodeAttributePropertyTypes } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';
import { RelationType, CreateBoolean, CreateMinLength, CreateMaxLength } from '../interface/methodprops';
import { GetNodeTitle } from '../actions/uiActions';
import { ViewTypes } from '../constants/viewtypes';
import { GetNodesByProperties } from '../methods/graph_methods';
let context: any = { world: null };
const AGENT = 'Agent';
const MODEL = 'Model';
const SCREEN_PARAMETER = 'ScreenParameter';
const USER = 'User';
const POSSESIVE = 'Possesive';
const SET_PROPERTY_ACTION = 'SetPropertyAction';
const ViewType = 'ViewType';
const DASHBOARD = 'Dashboard';
const ENUMERATION = 'Enumeration';
const ENUMERATIONVALUE = 'EnumerationValue';
const IS_A = 'IS_A';
const PROPERTY = 'Property';

const _nlp = nlp.extend((Doc: any, world: any) => {
	// add new tags
	world.addTags({
		Model: {
			isA: 'Noun'
		},
		[SCREEN_PARAMETER]: {
			isA: 'Noun'
		},
		SetPropertyAction: {
			isA: 'Verb'
		},
		Comparison: {
			isA: 'Verb'
		},
		Agent: {
			isA: 'Model'
		},
		Dashboard: {
			isA: 'Noun'
		},
		Parent: {
			isA: 'Model'
		},
		Target: {
			isA: 'Model'
		},
		ModelOutput: {
			isA: 'Model'
		},
		User: {
			isA: 'Agent'
		},
		Property: {
			isA: 'Noun'
		},
		Validation: {
			isA: 'BooleanConfig'
		},
		Name: {
			isA: 'Validation'
		},
		Matches: {
			isA: 'Validation'
		},
		Intersects: {
			isA: 'Validation'
		},
		MinLength: {
			isA: 'Validation'
		},
		MaxLength: {
			isA: 'Validation'
		},
		AreEqual: {
			isA: 'Validation'
		},
		IsContained: {
			isA: 'Validation'
		},
		IsTrue: {
			isA: 'Validation'
		},
		IsAlphaOnlyWithSpaces: {
			isA: 'Validation'
		},
		IsNull: {
			isA: 'Validation'
		},
		IsOneOf: {
			isA: 'Validation'
		},
		IsZipEmpty: {
			isA: 'Validation'
		},
		IsZip: {
			isA: 'Validation'
		},
		IsUrlEmpty: {
			isA: 'Validation'
		},
		IsUrl: {
			isA: 'Validation'
		},
		IsSocialSecurity: {
			isA: 'Validation'
		},
		RequireUppercase: {
			isA: 'Validation'
		},
		RequiresNonAlphaNumeric: {
			isA: 'Validation'
		},
		AttributePropertyTypes: {
			isA: 'Validation'
		},
		RequiresLowerCase: {
			isA: 'Validation'
		},
		IsNumericInteger: {
			isA: 'Validation'
		},
		IsEmailEmpty: {
			isA: 'Validation'
		},
		IsEmail: {
			isA: 'Validation'
		},
		IsCreditCard: {
			isA: 'Validation'
		},
		IsAlphaOnly: {
			isA: 'Validation'
		},
		IsAlphaNumeric: {
			isA: 'Validation'
		},
		IsFalse: {
			isA: 'Validation'
		},
		Enumeration: {
			isA: 'Noun'
		},
		ViewType: {
			isA: 'Noun'
		},
		EnumerationValue: {
			isA: 'Nount'
		},
		Method: {},
		IS_A: {
			isA: 'Method'
		}
	});

	// add or change words in the lexicon
	world.addWords({
		Agent: 'Agent',
		Parent: 'Parent',
		Model: 'Model',
		matches: 'Matches',
		intersects: 'Intersects',
		'first name': ['Property', 'Noun'],
		name: ['Name'],
		enumeration: 'Enumeration'
	});
	setNLPWorld(world);
});
function setNLPWorld(_world: any) {
	context.world = _world;
}

export function updateWorld() {
	let webDictionary: { [str: string]: string[] } = {};
	webDictionary['agent'] = [AGENT];
	webDictionary['agents'] = [AGENT, POSSESIVE];
	webDictionary['model'] = [MODEL, SCREEN_PARAMETER];
	webDictionary['output'] = ['ModelOutput', MODEL];
	webDictionary['outputs'] = [MODEL, 'ModelOutput', POSSESIVE];
	webDictionary['parent'] = ['Parent', MODEL, SCREEN_PARAMETER];
	webDictionary['target'] = [MODEL, 'Target'];
	webDictionary['parents'] = [MODEL, 'Parent', POSSESIVE];
	webDictionary['models'] = [MODEL, POSSESIVE];
	webDictionary['is a valid'] = [IS_A];
	webDictionary['must be a valid'] = [IS_A];
	webDictionary['equaling'] = ['Comparison'];
	actionStuff.forEach((action: string) => {
		webDictionary[action] = webDictionary[action] || [];
		webDictionary[action].push(SET_PROPERTY_ACTION);
	});
	Object.keys(ViewTypes).map((v: string) => {
		webDictionary[v] = webDictionary[v] || [];
		webDictionary[v.toLowerCase()] = webDictionary[v.toLowerCase()] || [];
		webDictionary[v.toUpperCase()] = webDictionary[v.toUpperCase()] || [];
		webDictionary[v].push(ViewType, v, v.toLowerCase());
		webDictionary[v.toLowerCase()].push(ViewType, v, v.toLowerCase());
		webDictionary[v.toUpperCase()].push(ViewType, v, v.toLowerCase());
		webDictionary[v] = webDictionary[v].unique();
	});
	Object.entries(NodeAttributePropertyTypes).forEach((d: any) => {
		let [key, value] = d;
		webDictionary[key] = webDictionary[key] || [];
		webDictionary[key].push(key, 'NodeAttributePropertyTypes');
		webDictionary[key] = webDictionary[key].unique();
		webDictionary[key.toLowerCase()] = webDictionary[key.toLowerCase()] || [];
		webDictionary[key.toLowerCase()].push(key, 'NodeAttributePropertyTypes');
		webDictionary[key.toLowerCase()] = webDictionary[key.toLowerCase()].unique();
	});

	Object.entries(NLValidationClauses).forEach((d: any) => {
		let [key, value] = d;
		if (value && value.$def) {
			value.$def.forEach((v: string) => {
				webDictionary[v] = webDictionary[v] || [];
				webDictionary[v].push(key);
				webDictionary[v] = webDictionary[v].unique();
			});
		}
	});
	let nodes: Node[] = NodesByType(null, [
		NodeTypes.Model,
		NodeTypes.Property,
		NodeTypes.Enumeration,
		NodeTypes.NavigationScreen
	]);
	nodes.forEach((node: Node) => {
		let type = GetNodeProp(node, NodeProperties.NODEType);
		[GetNodeTitle(node), GetCodeName(node)].filter((v) => v).forEach((v) => {
			webDictionary[v] = webDictionary[v] || [];
			// webDictionary[v].push(type);
			if (GetNodeProp(node, NodeProperties.IsAgent)) {
				webDictionary[v].push(AGENT);
			}
			if (GetNodeProp(node, NodeProperties.IsUser)) {
				webDictionary[v].push(USER);
			}
			if (type === NodeTypes.Model) {
				webDictionary[v].push(MODEL);
			} else if (type === NodeTypes.Property) {
				webDictionary[v].push(PROPERTY);
			} else if (type === NodeTypes.Enumeration) {
				webDictionary[v].push(ENUMERATION);
			} else if (type === NodeTypes.NavigationScreen) {
				if (GetNodeProp(node, NodeProperties.IsDashboard)) {
					webDictionary[v].push(DASHBOARD);
				}
			}
			webDictionary[v].push(v);
			webDictionary[v] = webDictionary[v].unique();
		});
		switch (type) {
			case NodeTypes.Enumeration:
				let enumeration: { value: string }[] = GetNodeProp(node, NodeProperties.Enumeration) || [];
				enumeration.forEach((enumVal: { value: string }) => {
					[
						enumVal.value.toLocaleLowerCase(),
						MakeConstant(enumVal.value),
						enumVal.value.toLocaleUpperCase()
					]
						.filter((v) => v)
						.forEach((v) => {
							webDictionary[v] = webDictionary[v] || [];
							webDictionary[v].push(ENUMERATIONVALUE);
							webDictionary[v].push(enumVal.value);
							webDictionary[v] = webDictionary[v].unique();
						});
				});
				break;
			case NodeTypes.Property:
				break;
			case NodeTypes.Model:
				break;
		}
	});

	context.world.addWords(webDictionary);
}
export interface NLOptions {
	withSpaces?: boolean;
}
export interface QueryResultNL {
	existingModelType: any;
	agentClause: Clause;
	targetClause: Clause;
}
export interface NLMeaning {
	quickType?: QuickType;
	setProperty?: SetPropertyClause;
	findAnExisting?: QueryResultNL;
	checkForExisting?: QueryResultNL;
	checkForNonExisting?: QueryResultNL;
	createNew?: Clause;
	viewType?: string;
	parameterClauses?: Clause[];
	text: string;
	actorClause: Clause;
	options?: NLOptions;
	targetClause: Clause;
	methodType?: NLMethodType;
	functionName?: string;
	validation: { [str: string]: boolean };
}
export interface RoutingArgs {
	as?: string;
	useArgument?: string;
	subClause?: Clause;
}
let booleanStuff = ['is true', 'is false'];
let equals = ['must match', 'matches', 'is equal to'];
let isA = ['must be a', 'must be an', 'is a', 'is an', ...booleanStuff];
let contains = ['contains a', 'contains an'];
let intersects = ['intersects', 'intersects with'];
let inAEnumeration = ['is in an enumeration', 'is an enumeration', 'is in a set'];
let executionStuff = ['copies to', 'increments by', 'concatenates with', 'concatenates list with'];
let referenceStuff = ['must connect to a real'];
let validationStuff = ['must conform to a'];
let actionStuff = ['Append the', 'Increment the', 'Decrement the', 'Set the'];
let afterEffectStuff = [
	...actionStuff,
	'Execute the function',
	'Check for an existing',
	'Check for a nonexisting',
	'Create a new',
	'Find an existing'
];
let deletedThing = ['has not been deleted'];
let quickOnes = [...deletedThing];
let navigationStuff = ['navigates to'];
let all = [
	...quickOnes,
	...afterEffectStuff,
	...navigationStuff,
	...validationStuff,
	...referenceStuff,
	...executionStuff,
	...inAEnumeration,
	...intersects,
	...equals,
	...isA,
	...contains
].sort((a, b) => a.length - b.length);
export const Cache: any = { context: {} };
export function cacheSuggestionData() {
	let nodes: Node[] = NodesByType(null, [
		NodeTypes.Model,
		NodeTypes.Property,
		NodeTypes.Enumeration,
		NodeTypes.NavigationScreen
	]);
	let context: any = {
		models: [],
		screens: [],
		agents: [],
		enumerations: []
	};
	nodes.forEach((node: Node) => {
		switch (GetNodeProp(node, NodeProperties.NODEType)) {
			case NodeTypes.Model:
				context.models.push(node);
				if (GetNodeProp(node, NodeProperties.IsAgent)) {
					context.agents.push(node);
				}
				break;
			case NodeTypes.NavigationScreen:
				if (GetNodeProp(node, NodeProperties.IsDashboard)) {
					context.screens.push(node);
				}
				break;
			case NodeTypes.Enumeration:
				context.enumerations.push(node);
				break;
		}
	});
	Cache.context = context;
}

export function getTextEditorSuggestions(text: string, editorContext: string, context: any) {
	let temp = _nlp(text);

	let suggestions: any[] = [];
	if (context) {
		if (context.model) {
			suggestions.push({
				label: `model: ${GetCodeName(context.model)}`,
				kind: monaco.languages.CompletionItemKind.Text,
				insertText: GetCodeName(context.model)
			});
		}
		if (context.agent) {
			suggestions.push({
				label: `agent: ${GetCodeName(context.agent)}`,
				kind: monaco.languages.CompletionItemKind.Text,
				insertText: GetCodeName(context.agent)
			});
		}
		if (context.methodContext) {
			context.methodContext.forEach((item: any) => {
				if (item) {
					if (item.agent) {
						suggestions.push({
							label: `agent: ${GetCodeName(item.agent)}`,
							kind: monaco.languages.CompletionItemKind.Text,
							insertText: GetCodeName(item.agent)
						});
					}
					if (item.method) {
						suggestions.push({
							label: `method: ${item.method}`,
							kind: monaco.languages.CompletionItemKind.Text,
							insertText: item.method
						});
					}
					if (item.model) {
						suggestions.push({
							label: `model: ${GetCodeName(item.model)}`,
							kind: monaco.languages.CompletionItemKind.Text,
							insertText: GetCodeName(item.model)
						});
					}
					if (item.parent) {
						suggestions.push({
							label: `parent: ${GetCodeName(item.parent)}`,
							kind: monaco.languages.CompletionItemKind.Text,
							insertText: GetCodeName(item.parent)
						});
					}
					if (item.model_output) {
						suggestions.push({
							label: `output: ${GetCodeName(item.model_output)}`,
							kind: monaco.languages.CompletionItemKind.Text,
							insertText: GetCodeName(item.model_output)
						});
					}
				}
			});
		}
	}
	if (Cache.context)
		if (Cache.context.agents && temp.has(`agent`)) {
			Cache.context.agents.map((agent: Node) => {
				suggestions.push({
					label: `agent: ${GetCodeName(agent)}`,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: GetCodeName(agent)
				});
			});
		} else if (Cache.context.models && temp.has(`model`)) {
			Cache.context.models.map((model: Node) => {
				suggestions.push({
					label: `model: ${GetCodeName(model)}`,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: GetCodeName(model)
				});
			});
		} else if (Cache.context.agents && temp.has(`dashboard`)) {
			Cache.context.screens.map((agent: Node) => {
				suggestions.push({
					label: `dashboard: ${GetCodeName(agent)}`,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: GetCodeName(agent)
				});
			});
		} else if (temp.has('viewtype')) {
			Object.keys(ViewTypes).forEach((viewType: string) => {
				suggestions.push({
					label: `viewtype: ${viewType}`,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: viewType
				});
			});
		} else if (temp.has('argtype')) {
			['model', 'property'].forEach((argtype: string) => {
				suggestions.push({
					label: `argtype: ${argtype}`,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: argtype
				});
			});
		} else if (temp.has('property')) {
			let context = _nlp(editorContext);
			if (context.has('#Model')) {
				let modelTerms: any = context.match('#Model').terms().map((v: any): string => v.text().trim());
				if (modelTerms && modelTerms.length) {
					let models = NodesByType(null, NodeTypes.Model);
					modelTerms.forEach((text: string) => {
						let model = models.find((vnode: Node) => {
							return (
								text === GetNodeTitle(vnode) ||
								text === GetCodeName(vnode) ||
								text === GetCodeName(vnode).toLocaleLowerCase() ||
								text === GetCodeName(vnode).toLocaleUpperCase()
							);
						});
						if (model) {
							let properties = GetModelCodeProperties(model.id);
							properties.forEach((prop: Node) => {
								suggestions.push({
									label: `property: ${GetCodeName(model)} ${GetCodeName(prop)}`,
									kind: monaco.languages.CompletionItemKind.Text,
									insertText: GetCodeName(prop)
								});
							});
						}
					});
				}
			}
		}
	return suggestions;
}

export default function getLanguageMeaning(
	text: string,
	context?: { agent?: string; model?: string; parent?: string; model_output?: string }
): NLMeaning {
	let temp = _nlp(text);
	console.log(JSON.stringify(temp.possessives().json(), null, 4));

	let result: NLMeaning = { actorClause: {}, targetClause: {}, validation: {}, text };
	let understandableClause = all.find((item: string) => {
		return temp.has(item);
	});
	if (understandableClause) {
		let temp_: any = temp.match(understandableClause);
		let firstClause = temp_.lookBehind().text();
		let secondClause = temp_.lookAhead().text();
		if (equals.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.AreEqual;
		} else if (inAEnumeration.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.MatchEnumeration;
			if (_nlp(secondClause).has(`#Enumeration`)) {
				let enumeration = NodesByType(null, NodeTypes.Enumeration)
					.sort((a: Node, b: Node) => {
						return GetNodeTitle(a).length - GetNodeTitle(b).length;
					})
					.find(
						(vnode: Node) =>
							_nlp(secondClause).has(GetNodeTitle(vnode)) ||
							_nlp(secondClause).has(GetCodeName(vnode)) ||
							_nlp(secondClause).has(GetCodeName(vnode).toLocaleLowerCase()) ||
							_nlp(secondClause).has(GetCodeName(vnode).toLocaleUpperCase())
					);
				temp_ = temp.match('with a');
				let temp__: any = temp.match('with an');
				let enumerationClause = temp_.lookAhead().text() || temp__.lookAhead().text();
				if (enumeration && enumerationClause) {
					result.targetClause.enumeration = enumeration.id;
					let possibleEnumerations = GetNodeProp(enumeration, NodeProperties.Enumeration) || [];
					result.targetClause.enumerations = possibleEnumerations
						.filter(
							(v: any) =>
								_nlp(enumerationClause).has(v.value) ||
								_nlp(enumerationClause).has(v.value.toLocaleLowerCase()) ||
								_nlp(enumerationClause).has(v.value.toLocaleUpperCase())
						)
						.map((v: any) => v.id);
				}
			}
		} else if (isA.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.IsA;
			let isAClause = understandableClause; //temp.lookAhead(understandableClause).text();
			Object.entries(NLValidationClauses).forEach((item: any) => {
				let [key, value] = item;
				result.validation[`${key}`] = _nlp(isAClause).has(`#${key}`);
			});
		} else if (deletedThing.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.QuickMethod;
			result.quickType = QuickType.IsNotDeleted;
		}
		else if (contains.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.Contains;
		} else if (booleanStuff.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.IsTrue;
		} else if (intersects.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.Intersects;
		} else if (afterEffectStuff.find((item: string) => temp.has(item))) {
			if (temp.has('Execute the function')) {
				result.methodType = NLMethodType.ExecuteFunction;
				result.functionName = secondClause.trim();
			}
			if (temp.has('Check for an existing')) {
				result.methodType = NLMethodType.CheckForExisting;
				let afterExistingClause: string = temp_.match('Check for an existing').lookAfter().text();
				result.checkForExisting = checkExistingParse(afterExistingClause, buildClause);
			}
			if (temp.has('Check for a nonexisting')) {
				result.methodType = NLMethodType.CheckForNonExisting;
				let afterExistingClause: string = temp_.match('Check for a nonexisting').lookAfter().text();
				result.checkForNonExisting = checkExistingParse(afterExistingClause, buildClause);
			}
			if (temp.has('Create a new')) {
				result.methodType = NLMethodType.CreateNew;
				let afterExistingClause: string = temp_.match('Create a new').lookAfter().text();
				result.createNew = buildClause(afterExistingClause, {});
			}
			if (temp.has('Find an existing')) {
				result.methodType = NLMethodType.FindAnExisting;
				let afterExistingClause: string = temp_.match('Find an existing').lookAfter().text();
				result.findAnExisting = checkExistingParse(afterExistingClause, buildClause);
			}
			if (actionStuff.find((v) => temp.has(v))) {
				result.methodType = NLMethodType.SetProperty;
				result.setProperty = CreateSetPropertyNL(actionStuff.find((v) => temp.has(v)) || '', temp, buildClause);
			}
		} else if (executionStuff.find((item: string) => temp.has(item))) {
			if (temp.has('copies to')) {
				result.methodType = NLMethodType.CopyTo;
			} else if (temp.has('increments by')) {
				result.methodType = NLMethodType.IncrementBy;
			} else if (temp.has('concatenates list with')) {
				result.methodType = NLMethodType.ConcatenateCollection;
				result.parameterClauses = captureParameters('concatenates list with', temp.text(), []);
				result.options = {};
			} else if (temp.has('concatenates with')) {
				result.methodType = NLMethodType.ConcatenateString;
				result.parameterClauses = captureParameters('concatenates with', temp.text(), ['with spaces']);
				result.options = {
					withSpaces: temp.text().split('concatenates with').subset(1).join().indexOf('with spaces') !== -1
				};
			}
		} else if (validationStuff.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.ComplexValidations;
		} else if (referenceStuff.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.Reference;
		} else if (navigationStuff.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.Navigate;
		}
		function captureParameters(splitPhrase: string, phrase: string, remove?: string[]): Clause[] {
			let parameterPhrase = phrase.split(splitPhrase).subset(1).join('');
			if (remove) {
				remove.forEach((item: string) => {
					parameterPhrase = parameterPhrase.split(item).join();
				});
			}
			let parts = parameterPhrase.split(',').join(' and ');
			let clauses = parts.split('and').map((v: string) => v.trim()).map((v: string) => buildClause(v, {}));
			return clauses;
		}
		function buildClause(subClause: string, clause: Clause): Clause {
			let targetProperties: Node[] = [];
			let nlpSubClause = _nlp(subClause);
			if (nlpSubClause.has(`#Agent`)) {
				clause.relationType = RelationType.Agent;
				clause.agent = context ? context.agent : '';
				targetProperties = findPotentialProperties(context && context.agent ? context.agent : undefined);
			} else if (nlpSubClause.has(`#Model`)) {
				clause.relationType = RelationType.Model;
				clause.agent = context ? context.model : '';
				let bestModel = nlpSubClause
					.termList()
					.map((v) => ({ text: v.text, tags: v.tags }))
					.find((v) => v.tags.Model && !v.tags.Property);
				if (bestModel) {
					let node = findModelByName(bestModel.text);
					if (node && node.id !== clause.agent) {
						clause.agent = node.id;
					}
				}
				targetProperties = findPotentialProperties(clause.agent);
			}
			if (nlpSubClause.has(`#Parent`)) {
				clause.relationType = RelationType.Parent;
				clause.agent = context ? context.parent : '';
				targetProperties = findPotentialProperties(context && context.parent ? context.parent : undefined);
			}
			if (nlpSubClause.has(`#Target`)) {
				clause.relationType = RelationType.Model;
				clause.agent = context ? context.model : '';
				targetProperties = findPotentialProperties(context && context.model ? context.model : undefined);
			}
			clause.property = findProperty(targetProperties, subClause);
			return clause;
		}
		function findProperty(properties: Node[], clauseString: string) {
			let property: string = '';
			if (properties && properties.length) {
				let aprop = properties.find(
					(vnode: Node) =>
						_nlp(clauseString).has(GetNodeTitle(vnode)) ||
						_nlp(clauseString).has(GetCodeName(vnode)) ||
						_nlp(clauseString).has(GetCodeName(vnode).toLocaleLowerCase()) ||
						_nlp(clauseString).has(GetCodeName(vnode).toLocaleUpperCase())
				);
				if (aprop) {
					property = aprop.id;
				}
			} else {
				property = _nlp(clauseString).match(`#${PROPERTY}`).text();
			}
			return property;
		}
		function findPotentialProperties(modelId?: string): Node[] {
			let result: Node[] = [];

			if (modelId) {
				result = GetModelCodeProperties(modelId).sort((a: Node, b: Node) => {
					return GetNodeTitle(a).length - GetNodeTitle(b).length;
				});
			}

			return result;
		}
		let targetProperties: Node[] = [];
		let actorProperties: Node[] = [];
		if (_nlp(secondClause).has(`#Agent`)) {
			result.targetClause.relationType = RelationType.Agent;
			result.targetClause.agent = context ? context.agent : '';
			targetProperties = findPotentialProperties(context && context.agent ? context.agent : undefined);
		} else if (_nlp(secondClause).has(`#Model`)) {
			result.targetClause.relationType = RelationType.Model;
			result.targetClause.agent = context ? context.model : '';
			if (!result.targetClause.agent) {
				let modelName = _nlp(secondClause).match('#Model').text();
				let modelNameNode = NodesByType(null, NodeTypes.Model).find((v: Node) => GetCodeName(v) === modelName);
				if (modelNameNode) {
					result.targetClause.agent = modelNameNode.id;
				}
			}
			targetProperties = findPotentialProperties(context && context.model ? context.model : undefined);
		}
		if (_nlp(secondClause).has(`#Parent`)) {
			result.targetClause.relationType = RelationType.Parent;
			result.targetClause.agent = context ? context.parent : '';
			targetProperties = findPotentialProperties(context && context.parent ? context.parent : undefined);
		}
		if (_nlp(secondClause).has(`#Target`)) {
			result.targetClause.relationType = RelationType.Model;
			result.targetClause.agent = context ? context.model : '';
			targetProperties = findPotentialProperties(context && context.model ? context.model : undefined);
		}
		if (result.methodType === NLMethodType.Navigate) {
			if (_nlp(secondClause).has(`#ViewType`)) {
				result.viewType = Object.keys(ViewTypes).find(
					(v) =>
						_nlp(secondClause).has(v) ||
						_nlp(secondClause).has(v) ||
						_nlp(secondClause).has(v.toLocaleLowerCase()) ||
						_nlp(secondClause).has(v.toLocaleUpperCase())
				);

				if (_nlp(secondClause).has('with the')) {
					let postArgs = _nlp(secondClause).match('with the').lookAhead('').text();
					if (_nlp(postArgs).has('model argument')) {
						result.targetClause.argument = {
							useArgument: 'model'
						};
					} else if (_nlp(postArgs).has('parent argument')) {
						result.targetClause.argument = {
							useArgument: 'parent'
						};
					} else {
						result.targetClause.argument = {
							subClause: {}
						};
						buildClause(postArgs, result.targetClause.argument.subClause || {});
					}
					if (_nlp(postArgs).has('as model')) {
						result.targetClause.argument.as = 'model';
					} else if (_nlp(postArgs).has('as parent')) {
						result.targetClause.argument.as = 'parent';
					}
				}
			}
			if (_nlp(secondClause).has('the dashboard')) {
				let postArgs = _nlp(secondClause).match('the dashboard').lookAhead('').text();
				if (_nlp(postArgs).has(`#${DASHBOARD}`)) {
					let screen = GetNodesByProperties(
						{
							[NodeProperties.IsDashboard]: true,
							[NodeProperties.NODEType]: NodeTypes.NavigationScreen
						},
						GetCurrentGraph()
					).find(
						(v: Node) =>
							_nlp(secondClause).has(GetCodeName(v)) ||
							_nlp(secondClause).has(GetNodeTitle(v)) ||
							_nlp(secondClause).has(GetCodeName(v).toLocaleLowerCase()) ||
							_nlp(secondClause).has(GetNodeTitle(v).toLocaleUpperCase()) ||
							_nlp(secondClause).has(GetNodeTitle(v).toLocaleLowerCase()) ||
							_nlp(secondClause).has(GetCodeName(v).toLocaleUpperCase())
					);
					if (screen) result.targetClause.dashboard = screen.id;
				}
			}
		}

		if (_nlp(secondClause).has(`#NodeAttributePropertyTypes`)) {
			Object.entries(NodeAttributePropertyTypes).forEach((d: any) => {
				let [key, value] = d;

				if (_nlp(secondClause).has(`#${key}`)) {
					{
						result.targetClause.propertyAttributeType = key;
					}
				}

				// webDictionary[key] = webDictionary[key] || [];
				// webDictionary[key].push(key, 'NodeAttributePropertyTypes');
				// webDictionary[key] = webDictionary[key].unique();
				// webDictionary[key.toLowerCase()].push(key, 'NodeAttributePropertyTypes');
				// webDictionary[key.toLowerCase()] = webDictionary[key.toLowerCase()].unique();
			});
		}
		if (_nlp(secondClause).has(`#ModelOutput`)) {
			result.targetClause.relationType = RelationType.ModelOutput;
			result.targetClause.agent = context ? context.model_output : '';
			targetProperties = findPotentialProperties(
				context && context.model_output ? context.model_output : undefined
			);
		}

		let possessive: any = _nlp(firstClause).possessives().termList().find(v => _nlp(v.clean).possessives().length);
		if (possessive && _nlp(possessive.clean).has(`#Agent`)) {
			result.actorClause.relationType = RelationType.Agent;
			result.actorClause.agent = context ? context.agent : '';
			actorProperties = findPotentialProperties(context && context.agent ? context.agent : undefined);
		} else if (possessive && _nlp(possessive.clean).has(`#Model`)) {
			result.actorClause.relationType = RelationType.Model;
			result.actorClause.agent = context ? context.model : '';
			actorProperties = findPotentialProperties(context && context.model ? context.model : undefined);
		}
		if (possessive && _nlp(possessive.clean).has(`#Target`)) {
			result.actorClause.relationType = RelationType.Model;
			result.actorClause.agent = context ? context.model : '';
			targetProperties = findPotentialProperties(context && context.model ? context.model : undefined);
		}
		if (possessive && _nlp(possessive.clean).has(`#Parent`)) {
			result.actorClause.relationType = RelationType.Parent;
			result.actorClause.agent = context ? context.parent : '';
			actorProperties = findPotentialProperties(context && context.parent ? context.parent : undefined);
		}
		if (possessive && _nlp(possessive.clean).has(`#ModelOutput`)) {
			result.actorClause.relationType = RelationType.ModelOutput;
			result.actorClause.agent = context ? context.model_output : '';
			actorProperties = findPotentialProperties(
				context && context.model_output ? context.model_output : undefined
			);
		}
		if (actorProperties && actorProperties.length) {
			let aprop = actorProperties.find(
				(vnode: Node) =>
					_nlp(firstClause).has(GetNodeTitle(vnode)) ||
					_nlp(firstClause).has(GetCodeName(vnode)) ||
					_nlp(firstClause).has(GetCodeName(vnode).toLocaleLowerCase()) ||
					_nlp(firstClause).has(GetCodeName(vnode).toLocaleUpperCase())
			);
			if (aprop) result.actorClause.property = aprop.id;
		} else {
			result.actorClause.property = _nlp(firstClause).match(`#${PROPERTY}`).text();
		}
		if (targetProperties && targetProperties.length) {
			let aprop = targetProperties.find(
				(vnode: Node) =>
					_nlp(secondClause).has(GetNodeTitle(vnode)) ||
					_nlp(secondClause).has(GetCodeName(vnode)) ||
					_nlp(secondClause).has(GetCodeName(vnode).toLocaleLowerCase()) ||
					_nlp(secondClause).has(GetCodeName(vnode).toLocaleUpperCase())
			);
			if (aprop) {
				result.targetClause.property = aprop.id;
			}
		} else {
			result.targetClause.property = _nlp(secondClause).match(`#${PROPERTY}`).text();
		}
	}
	return result;
}

export interface Clause {
	dashboard?: string;
	propertyAttributeType?: string;
	relationType?: RelationType;
	agent?: string;
	property?: string;
	enumerations?: any;
	argument?: RoutingArgs;
	enumeration?: string;
}
export enum NLMethodType {
	AreEqual = 'AreEqual',
	IsA = 'IsA',
	Contains = 'Contains',
	QuickMethod = 'QuickMethod',
	IsTrue = 'IsTrue',
	Intersects = 'Intersects',
	IsFalse = 'IsFalse',
	MatchEnumeration = 'MatchEnumeration',
	CopyTo = 'CopyTo',
	ExecuteFunction = 'ExecuteFunction',
	IncrementBy = 'IncrementBy',
	Reference = 'Reference',
	ComplexValidations = 'ComplexValidations',
	ConcatenateString = 'ConcatenateString',
	ConcatenateCollection = 'ConcatenateCollection',
	CheckForExisting = 'CheckForExisting',
	CheckForNonExisting = 'CheckForNonExisting',
	CreateNew = 'CreateNew',
	FindAnExisting = 'FindAnExisting',
	SetProperty = 'SetProperty',
	Navigate = 'Navigate'
}
export enum QuickType {
	IsNotDeleted = "IsNotDeleted"
}
export const NLValidationClauses = {
	Name: {
		isA: 'Validation',
		$def: ['is a name'],
		$property: {
			isNotNull: () => {
				return CreateBoolean();
			},
			minLength: () => {
				return CreateMinLength('2');
			},
			maxLength: () => {
				return CreateMaxLength('50');
			},
			alphaOnlyWithSpaces: () => {
				return CreateBoolean();
			}
		}
	},
	Matches: {
		isA: 'Validation'
	},
	Intersects: {
		isA: 'Validation',
		$def: ['intersects', 'intersects with']
	},
	MinLength: {
		isA: 'Validation',
		minLength: () => {
			return CreateMinLength('2');
		}
	},
	MaxLength: {
		isA: 'Validation'
	},
	AreEqual: {
		isA: 'Validation'
	},
	IsContained: {
		isA: 'Validation'
	},
	IsTrue: {
		isA: 'Validation',
		$property: {
			isTrue: () => {
				return CreateBoolean();
			}
		}
	},
	IsAlphaOnlyWithSpaces: {
		isA: 'Validation',
		$def: ['is alpha only', 'are alpha only'],
		$property: {
			alphaOnlyWithSpaces: () => {
				return CreateBoolean();
			}
		}
	},
	IsNull: {
		isA: 'Validation',
		$def: ['is null', 'are null'],
		$property: {
			isNull: () => {
				return CreateBoolean();
			}
		}
	},
	IsOneOf: {
		isA: 'Validation'
	},
	IsZipEmpty: {
		isA: 'Validation',
		$def: ['is an empty zip code'],
		$property: {
			zipEmpty: () => {
				return CreateBoolean();
			}
		}
	},
	IsZip: {
		isA: 'Validation',
		$def: ['is a zip code'],
		$property: {
			zip: () => {
				return CreateBoolean();
			}
		}
	},
	IsUrlEmpty: {
		isA: 'Validation',
		$def: ['is an empty url'],
		$property: {
			urlEmpty: () => {
				return CreateBoolean();
			}
		}
	},
	IsUrl: {
		isA: 'Validation',
		$def: ['is a url'],
		$property: {
			url: () => {
				return CreateBoolean();
			}
		}
	},
	IsSocialSecurity: {
		isA: 'Validation',
		$def: ['is a social security', 'is a social security number'],
		$property: {
			socialSecurity: () => {
				return CreateBoolean();
			}
		}
	},
	RequireUppercase: {
		isA: 'Validation',
		$property: {
			requireUppercase: () => {
				return CreateBoolean();
			}
		}
	},
	RequiresNonAlphaNumeric: {
		isA: 'Validation',
		$property: {
			requireNonAlphanumeric: () => {
				return CreateBoolean();
			}
		}
	},
	RequiresLowerCase: {
		isA: 'Validation',
		$property: {
			requireLowercase: () => {
				return CreateBoolean();
			}
		}
	},
	IsNumericInteger: {
		isA: 'Validation',
		$def: ['is an integer'],
		$property: {
			numericInt: () => {
				return CreateBoolean();
			}
		}
	},
	IsEmailEmpty: {
		isA: 'Validation',
		$def: ['is an empty email'],
		$property: {
			emailEmpty: () => {
				return CreateBoolean();
			}
		}
	},
	IsEmail: {
		isA: 'Validation',
		$def: ['is an email'],
		$property: {
			email: () => {
				return CreateBoolean();
			}
		}
	},
	IsCreditCard: {
		isA: 'Validation',
		$def: ['is a credit card'],
		$property: {
			creditCard: () => {
				return CreateBoolean();
			}
		}
	},
	IsAlphaOnly: {
		isA: 'Validation',
		$def: ['is alpha only'],
		$property: {
			alphaOnly: () => {
				return CreateBoolean();
			}
		}
	},
	IsAlphaNumeric: {
		isA: 'Validation',
		$def: ['is alpha numeric'],
		$property: {
			alphaNumeric: () => {
				return CreateBoolean();
			}
		}
	},
	IsFalse: {
		isA: 'Validation',
		$def: ['is false'],
		$property: {
			isFalse: () => {
				return CreateBoolean();
			}
		}
	}
};
function checkExistingParse(
	afterExistingClause: string,
	buildClause: (subClause: string, clause: Clause) => Clause
): QueryResultNL {
	let afterTemp: any = _nlp(afterExistingClause);
	let existingModelType = afterTemp.match('instance').lookAfter().text();
	let comparison = _nlp(afterExistingClause).match('#Comparison');
	let t: any = _nlp(existingModelType);
	let firstCompareClause = t.match('equaling').lookBefore();
	let fcc = buildClause(firstCompareClause.text(), {});
	let secondCompareClause = t.match('equaling').lookAfter();
	let scc = buildClause(secondCompareClause.text(), {});
	return {
		existingModelType,
		agentClause: fcc,
		targetClause: scc
	};
}

function CreateSetPropertyNL(
	actionClause: string,
	temp: any,
	buildClause: (subClause: string, clause: Clause) => Clause
): SetPropertyClause {
	let secondClauseText = '';
	let firstClauseText = '';
	let tvx = actionStuff.find((v) => actionClause.startsWith(v));
	if (tvx) {
		secondClauseText = temp.match(tvx).lookAfter().match('to the').lookAfter().text();
		let t: any = _nlp(temp.match(tvx).lookAfter().text()).match('to the');
		firstClauseText = t.lookBefore().text();
	}

	let scc = buildClause(secondClauseText, {});
	let fcc = buildClause(firstClauseText, {});

	return {
		targetClause: fcc,
		agentClause: scc
	};
}

export interface SetPropertyClause {
	targetClause: Clause;
	agentClause: Clause;
}

function findModelByName(txt: string) {
	return NodesByType(null, NodeTypes.Model).find(
		(vnode: Node) =>
			GetNodeTitle(vnode) === txt ||
			GetCodeName(vnode) === txt ||
			GetCodeName(vnode).toLocaleLowerCase() === txt ||
			GetCodeName(vnode).toLocaleUpperCase() === txt
	);
}
