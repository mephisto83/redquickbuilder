import nlp from 'compromise';
import {
	NodesByType,
	GetNodeProp,
	GetCodeName,
	GetModelCodeProperties,
	GetCurrentGraph,
	GetNodeCode
} from '../actions/uiactions';
import * as monaco from 'monaco-editor';
import { NodeTypes, NodeProperties, MakeConstant, NodeAttributePropertyTypes } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';
import { RelationType, CreateBoolean, CreateMinLength, CreateMaxLength } from '../interface/methodprops';
import { GetNodeTitle } from '../actions/uiactions';
import { ViewTypes } from '../constants/viewtypes';
import { GetNodesByProperties } from '../methods/graph_methods';
let context: any = { world: null };
const AGENT = 'Agent';
const MODEL = 'Model';
const SCREEN_PARAMETER = 'ScreenParameter';
const USER = 'User';
const POSSESIVE = 'Possesive';
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
		'first name': [ 'Property', 'Noun' ],
		name: [ 'Name' ],
		enumeration: 'Enumeration'
	});
	setNLPWorld(world);
});
function setNLPWorld(_world: any) {
	context.world = _world;
}

export function updateWorld() {
	let webDictionary: { [str: string]: string[] } = {};
	webDictionary['agent'] = [ AGENT ];
	webDictionary['agents'] = [ AGENT, POSSESIVE ];
	webDictionary['model'] = [ MODEL, SCREEN_PARAMETER ];
	webDictionary['output'] = [ 'ModelOutput', MODEL ];
	webDictionary['outputs'] = [ MODEL, 'ModelOutput', POSSESIVE ];
	webDictionary['parent'] = [ 'Parent', MODEL, SCREEN_PARAMETER ];
	webDictionary['target'] = [ MODEL, 'Target' ];
	webDictionary['parents'] = [ MODEL, 'Parent', POSSESIVE ];
	webDictionary['models'] = [ MODEL, POSSESIVE ];
	webDictionary['is a valid'] = [ IS_A ];
	webDictionary['must be a valid'] = [ IS_A ];
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
		let [ key, value ] = d;
		webDictionary[key] = webDictionary[key] || [];
		webDictionary[key].push(key, 'NodeAttributePropertyTypes');
		webDictionary[key] = webDictionary[key].unique();
		webDictionary[key.toLowerCase()] = webDictionary[key.toLowerCase()] || [];
		webDictionary[key.toLowerCase()].push(key, 'NodeAttributePropertyTypes');
		webDictionary[key.toLowerCase()] = webDictionary[key.toLowerCase()].unique();
	});

	Object.entries(NLValidationClauses).forEach((d: any) => {
		let [ key, value ] = d;
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
		[ GetNodeTitle(node), GetCodeName(node) ].filter((v) => v).forEach((v) => {
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
export interface NLMeaning {
	viewType?: string;
	parameterClauses?: Clause[];
	text: string;
	actorClause: Clause;
	options?: NLOptions;
	targetClause: Clause;
	methodType?: NLMethodType;
	validation: { [str: string]: boolean };
}
export interface RoutingArgs {
	as?: string;
	useArgument?: string;
	subClause?: Clause;
}
let booleanStuff = [ 'is true', 'is false' ];
let equals = [ 'must match', 'matches', 'is equal to' ];
let isA = [ 'must be a', 'must be an', 'is a', 'is an', ...booleanStuff ];
let contains = [ 'contains a', 'contains an' ];
let intersects = [ 'intersects', 'intersects with' ];
let inAEnumeration = [ 'is in an enumeration', 'is an enumeration', 'is in a set' ];
let executionStuff = [ 'copies to', 'increments by', 'concatenates with' ];
let referenceStuff = [ 'must connect to a real' ];
let validationStuff = [ 'must conform to a' ];
let navigationStuff = [ 'navigates to' ];
let all = [
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

export function getTextEditorSuggestions(text: string, editorContext?: { model: string }) {
	let temp = _nlp(text);

	let suggestions: any[] = [];
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
			[ 'model', 'property' ].forEach((argtype: string) => {
				suggestions.push({
					label: `argtype: ${argtype}`,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: argtype
				});
			});
		} else if (Cache.context.properties && temp.has('property')) {
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
				let [ key, value ] = item;
				result.validation[`${key}`] = _nlp(isAClause).has(`#${key}`);
			});
		} else if (contains.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.Contains;
		} else if (booleanStuff.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.IsTrue;
		} else if (intersects.find((item: string) => temp.has(item))) {
			result.methodType = NLMethodType.Intersects;
		} else if (executionStuff.find((item: string) => temp.has(item))) {
			if (temp.has('copies to')) {
				result.methodType = NLMethodType.CopyTo;
			} else if (temp.has('increments by')) {
				result.methodType = NLMethodType.IncrementBy;
			} else if (temp.has('concatenates with')) {
				result.methodType = NLMethodType.ConcatenateString;
				result.parameterClauses = captureParameters('concatenates with', temp.text(), [ 'with spaces' ]);
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
			if (_nlp(subClause).has(`#Agent`)) {
				clause.relationType = RelationType.Agent;
				clause.agent = context ? context.agent : '';
				targetProperties = findPotentialProperties(context && context.agent ? context.agent : undefined);
			} else if (_nlp(subClause).has(`#Model`)) {
				clause.relationType = RelationType.Model;
				clause.agent = context ? context.model : '';
				targetProperties = findPotentialProperties(context && context.model ? context.model : undefined);
			}
			if (_nlp(subClause).has(`#Parent`)) {
				clause.relationType = RelationType.Parent;
				clause.agent = context ? context.parent : '';
				targetProperties = findPotentialProperties(context && context.parent ? context.parent : undefined);
			}
			if (_nlp(subClause).has(`#Target`)) {
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
				let [ key, value ] = d;

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
			result.targetClause.relationType = RelationType.ModelOuput;
			result.targetClause.agent = context ? context.model_output : '';
			targetProperties = findPotentialProperties(
				context && context.model_output ? context.model_output : undefined
			);
		}
		if (_nlp(firstClause).has(`#Agent`)) {
			result.actorClause.relationType = RelationType.Agent;
			result.actorClause.agent = context ? context.agent : '';
			actorProperties = findPotentialProperties(context && context.agent ? context.agent : undefined);
		} else if (_nlp(firstClause).has(`#Model`)) {
			result.actorClause.relationType = RelationType.Model;
			result.actorClause.agent = context ? context.model : '';
			actorProperties = findPotentialProperties(context && context.model ? context.model : undefined);
		}
		if (_nlp(firstClause).has(`#Target`)) {
			result.actorClause.relationType = RelationType.Model;
			result.actorClause.agent = context ? context.model : '';
			targetProperties = findPotentialProperties(context && context.model ? context.model : undefined);
		}
		if (_nlp(firstClause).has(`#Parent`)) {
			result.actorClause.relationType = RelationType.Parent;
			result.actorClause.agent = context ? context.parent : '';
			actorProperties = findPotentialProperties(context && context.parent ? context.parent : undefined);
		}
		if (_nlp(firstClause).has(`#ModelOutput`)) {
			result.actorClause.relationType = RelationType.ModelOuput;
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
	IsTrue = 'IsTrue',
	Intersects = 'Intersects',
	IsFalse = 'IsFalse',
	MatchEnumeration = 'MatchEnumeration',
	CopyTo = 'CopyTo',
	IncrementBy = 'IncrementBy',
	Reference = 'Reference',
	ComplexValidations = 'ComplexValidations',
	ConcatenateString = 'ConcatenateString',
	Navigate = 'Navigate'
}

export const NLValidationClauses = {
	Name: {
		isA: 'Validation',
		$def: [ 'is a name' ],
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
		$def: [ 'intersects', 'intersects with' ]
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
		$def: [ 'is alpha only', 'are alpha only' ],
		$property: {
			alphaOnlyWithSpaces: () => {
				return CreateBoolean();
			}
		}
	},
	IsNull: {
		isA: 'Validation',
		$def: [ 'is null', 'are null' ],
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
		$def: [ 'is an empty zip code' ],
		$property: {
			zipEmpty: () => {
				return CreateBoolean();
			}
		}
	},
	IsZip: {
		isA: 'Validation',
		$def: [ 'is a zip code' ],
		$property: {
			zip: () => {
				return CreateBoolean();
			}
		}
	},
	IsUrlEmpty: {
		isA: 'Validation',
		$def: [ 'is an empty url' ],
		$property: {
			urlEmpty: () => {
				return CreateBoolean();
			}
		}
	},
	IsUrl: {
		isA: 'Validation',
		$def: [ 'is a url' ],
		$property: {
			url: () => {
				return CreateBoolean();
			}
		}
	},
	IsSocialSecurity: {
		isA: 'Validation',
		$def: [ 'is a social security', 'is a social security number' ],
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
		$def: [ 'is an integer' ],
		$property: {
			numericInt: () => {
				return CreateBoolean();
			}
		}
	},
	IsEmailEmpty: {
		isA: 'Validation',
		$def: [ 'is an empty email' ],
		$property: {
			emailEmpty: () => {
				return CreateBoolean();
			}
		}
	},
	IsEmail: {
		isA: 'Validation',
		$def: [ 'is an email' ],
		$property: {
			email: () => {
				return CreateBoolean();
			}
		}
	},
	IsCreditCard: {
		isA: 'Validation',
		$def: [ 'is a credit card' ],
		$property: {
			creditCard: () => {
				return CreateBoolean();
			}
		}
	},
	IsAlphaOnly: {
		isA: 'Validation',
		$def: [ 'is alpha only' ],
		$property: {
			alphaOnly: () => {
				return CreateBoolean();
			}
		}
	},
	IsAlphaNumeric: {
		isA: 'Validation',
		$def: [ 'is alpha numeric' ],
		$property: {
			alphaNumeric: () => {
				return CreateBoolean();
			}
		}
	},
	IsFalse: {
		isA: 'Validation',
		$def: [ 'is false' ],
		$property: {
			isFalse: () => {
				return CreateBoolean();
			}
		}
	}
};
