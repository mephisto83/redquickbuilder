import nlp from 'compromise';
import { NodesByType, GetNodeProp, GetCodeName, GetModelCodeProperties } from '../actions/uiactions';
import { NodeTypes, NodeProperties, MakeConstant } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';
import { GetNodeTitle } from '../../visi_blend/dist/app/actions/uiactions';
import { RelationType, CreateBoolean, CreateMinLength, CreateMaxLength } from '../interface/methodprops';
let context: any = { world: null };
const _nlp = nlp.extend((Doc: any, world: any) => {
	// add new tags
	world.addTags({
		Model: {
			isA: 'Noun'
		},
		Agent: {
			isA: 'Model'
		},
		Parent: {
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

const AGENT = 'Agent';
const MODEL = 'Model';
const USER = 'User';
const POSSESIVE = 'Possesive';
const ENUMERATION = 'Enumeration';
const ENUMERATIONVALUE = 'EnumerationValue';
const IS_A = 'IS_A';
const PROPERTY = 'Property';
export function updateWorld() {
	let webDictionary: { [str: string]: string[] } = {};
	webDictionary['agent'] = [ AGENT ];
	webDictionary['agents'] = [ AGENT, POSSESIVE ];
	webDictionary['model'] = [ MODEL ];
	webDictionary['models'] = [ MODEL, POSSESIVE ];
	webDictionary['is a valid'] = [ IS_A ];
	webDictionary['must be a valid'] = [ IS_A ];
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
	let nodes: Node[] = NodesByType(null, [ NodeTypes.Model, NodeTypes.Property, NodeTypes.Enumeration ]);
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
export interface NLMeaning {
	text: string;
	actorClause: Clause;
	targetClause: Clause;
	methodType?: NLMethodType;
	validation: { [str: string]: boolean };
}
export default function getLanguageMeaning(
	text: string,
	context?: { agent?: string; model?: string; parent?: string; model_output?: string }
): NLMeaning {
	let temp = _nlp(text);
	console.log(JSON.stringify(temp.possessives().json(), null, 4));
	let booleanStuff = [ 'is true', 'is false' ];
	let equals = [ 'must match', 'matches' ];
	let isA = [ 'must be a', 'must be an', 'is a', 'is an', ...booleanStuff ];
	let contains = [ 'contains a', 'contains an' ];
	let intersects = [ 'intersects', 'intersects with' ];
	let inAEnumeration = [ 'is in an enumeration', 'is an enumeration', 'is in a set' ];
	let all = [ , ...inAEnumeration, ...intersects, ...equals, ...isA, ...contains ].sort(
		(a, b) => a.length - b.length
	);

	let result: NLMeaning = { actorClause: {}, targetClause: {}, validation: {}, text };
	let understandableClause = all.find((item: string) => {
		return temp.has(item);
	});
	if (understandableClause) {
		let firstClause = temp.match(understandableClause).lookBehind().text();
		let secondClause = temp.match(understandableClause).lookAhead().text();
		if (
			equals.find((item: string) => {
				return temp.has(item);
			})
		) {
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
				let enumerationClause = temp.match('with a').lookAhead().text();
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
		}
		function findPotentialProperties(modelId?: string): Node[] {
			let result: Node[] = [];

			if (modelId) {
				result = GetModelCodeProperties(modelId).sort((a, b) => {
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
			targetProperties = findPotentialProperties(context && context.model ? context.model : undefined);
		}
		if (_nlp(secondClause).has(`#Parent`)) {
			result.targetClause.relationType = RelationType.Parent;
			result.targetClause.agent = context ? context.parent : '';
			targetProperties = findPotentialProperties(context && context.parent ? context.parent : undefined);
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
	relationType?: RelationType;
	agent?: string;
	property?: string;
	enumerations?: any;
	enumeration?: string;
}
export enum NLMethodType {
	AreEqual = 'AreEqual',
	IsA = 'IsA',
	Contains = 'Contains',
	IsTrue = 'IsTrue',
	Intersects = 'Intersects',
	IsFalse = 'IsFalse',
	MatchEnumeration = 'MatchEnumeration'
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
		$def: [ 'is false' ]
	}
};
