/* eslint-disable import/no-duplicates */
import { readFileSync } from 'fs';
import {
	GenerateChainFunctions,
	GenerateChainFunctionSpecs,
	GetDataChainCollections,
	NodesByType,
	GetJSCodeName,
	GetNodeProp,
	GetCurrentGraph,
	GetRelativeDataChainPath,
	GetRootGraph,
	GetCodeName
} from '../actions/uiactions';
import {
	UITypes,
	NEW_LINE,
	NodeTypes,
	LinkType,
	NodeProperties,
	NameSpace,
	STANDARD_CONTROLLER_USING
} from '../constants/nodetypes';
import { bindTemplate } from '../constants/functiontypes';
import { GetNodeLinkedTo, TARGET, GetNodesLinkedTo } from '../methods/graph_methods';
import NamespaceGenerator from './namespacegenerator';
import * as GraphMethods from '../methods/graph_methods';
import { Graph } from '../methods/graph_types';
import ModelGenerator from './modelgenerators';

export default class DataChainGenerator {
	static GenerateCS(options: { state: any; key?: any; language: any }) {
		const { state, language } = options;
		const result: any = {};
		const graphRoot: any = GetRootGraph(state);

		const namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		GenerateChainFunctions({
			cs: true,
			language
		}).forEach((f: { node: any; class: any }) => {
			const dataChain = f.node;

			result[GetNodeProp(dataChain, NodeProperties.CodeName)] = {
				id: GetNodeProp(dataChain, NodeProperties.CodeName),
				name: GetNodeProp(dataChain, NodeProperties.CodeName),
				template: NamespaceGenerator.Generate({
					template: f.class,
					usings: [
						...STANDARD_CONTROLLER_USING,
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Interface}`,
						`${namespace}${NameSpace.StreamProcess}`,
						`${namespace}${NameSpace.Constants}`,
						`${namespace}${NameSpace.Permissions}`,
						`${namespace}${NameSpace.Parameters}`
					],
					namespace,
					space: NameSpace.Controllers
				})
			};
		});

		return result;
	}

	static Generate(options: any) {
		const { state, language } = options;
		let fileEnding = '.js';
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				fileEnding = '.ts';
				break;
			default:
				break;
		}
		const graph = GetCurrentGraph(state);
		const funcs = GenerateChainFunctions(options);
		const enumerations = NodesByType(state, NodeTypes.Enumeration);
		const collections = GetDataChainCollections(options)
			.split(NEW_LINE)
			.sort((a: string, b: any) => {
				return `${b}`.localeCompare(a);
			})
			.join(NEW_LINE);
		let tests = null;
		const collectionNodes = NodesByType(null, NodeTypes.DataChainCollection);
		const temps = [
			...collectionNodes.map((nc: any) => {
				const isInLanguage = CollectionIsInLanguage(graph, nc.id, language);
				const cfunc = isInLanguage ? GenerateChainFunctions({ language, collection: nc.id }) : null;
				const collectionsInLanguage = isInLanguage
					? GetDataChainCollections({
							language,
							collection: nc.id
						})
					: null;
				if (!isInLanguage) {
					return false;
				}
				const chainPath = GetRelativeDataChainPath(nc);
				return {
					template: dcTemplate(
						collectionsInLanguage,
						cfunc,
						[].interpolate(0, chainPath.length + 1).map(() => '../').join(''),
						enumerations,
						graph
					),
					relative: `./src/actions/datachains/${chainPath.join('/')}${chainPath.length ? '/' : ''}`,
					relativeFilePath: `./${GetJSCodeName(nc)}${fileEnding}`,
					name: `${chainPath.join('_')}${nc.id}`
				};
			}),
			{
				template: dcTemplate(collections, funcs, '', enumerations, graph),
				relative: './src/actions',
				relativeFilePath: `./data-chain${fileEnding}`,
				name: 'data-chain'
			},
			{
				template: readFileSync('./app/utils/observable.ts', 'utf8'),
				relative: './src/actions',
				relativeFilePath: `./observable${fileEnding}`,
				name: 'observable'
			},
			{
				template: readFileSync('./app/utils/array.ts', 'utf8'),
				relative: './src/actions',
				relativeFilePath: `./array${fileEnding}`,
				name: 'array'
			},
			{
				template: readFileSync('./app/utils/redgraph.ts', 'utf8'),
				relative: './src/actions',
				relativeFilePath: `./redgraph${fileEnding}`,
				name: 'redgraph.ts'
			},
			// Specific for web sites
			// Need an alternative for ReactNative
			{
				template: readFileSync('./app/actions/redutils.ts', 'utf8'),
				relative: './src/actions',
				relativeFilePath: `./redutils${fileEnding}`,
				name: 'redutils.js'
			}
		].filter((x) => x);
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				tests = GenerateChainFunctionSpecs(options);
				temps.push({
					relative: './test',
					relativeFilePath: './data-chain.spec.js',
					name: 'data-chain.spec.js',
					template: bindTemplate(readFileSync('./app/templates/electronio/spec.tpl', 'utf8'), {
						tests: tests.join(NEW_LINE)
					})
				});
				break;
			default:
				break;
		}
		const result: any = {};

		temps.map((t) => {
			result[t.name] = t;
		});

		return result;
	}
}

let dcTemplate = (collections: any, funcs: string, rel = '', enumerations = [], graph: Graph) => {
	if (!funcs || !funcs.trim()) {
		if (!collections) {
			return `export default {}`;
		}
		return `${collections}`;
	}
	let model_imports = ModelGenerator.ModelImports({ graph, rel });
	let enumeration_imports = enumerations
		.map((enums) => {
			return `import { ${GetCodeName(enums)} } from '../${rel}constants/${GetJSCodeName(enums)}';`;
		})
		.join(NEW_LINE);
	return `import {
    GetC,
    updateScreenInstanceObject,
    GetItem,
    APP_STATE,
    Chain,
    Batch,
    UIModels, GetDispatch,
    GetState, UIC,
    GetItems,UI_MODELS,
    GetK, updateScreenInstance,
    UIKeys,
    clearScreenInstance

  } from '../${rel}actions/uiactions';
${model_imports}
import {
  GetMenuSource
} from '../${rel}actions/menuSource';
import {
    validateEmail,
    maxLength,
    minLength,
    greaterThanOrEqualTo,
    lessThanOrEqualTo,
    arrayLength,
    numericalDefault,
    equalsLength,
    alphanumericLike,
    alphanumeric,
    alpha,
    MinLengthAttribute,
    EqualsModelProperty,
    MaxLengthAttribute,
    AlphaOnlyAttribute,
    AlphaNumericLikeAttribute,
    AlphaOnlyWithSpacesAttribute,
    IsNullAttribute,
    IsNotNullAttribute,
    MaxAttribute,
    MinAttribute,
    EmailAttribute,
    EmailEmptyAttribute,
    ZipAttribute,
    ZipEmptyAttribute
} from './${rel}validation';
${enumeration_imports}
import * as navigate from '../${rel}actions/navigationActions';
import * as $service from '../${rel}util/service';
import routes from '../${rel}constants/routes';
import { titleService} from '../${rel}actions/util';
import * as RedLists from '../${rel}actions/lists';
import StateKeys from '../${rel}state_keys';
import ModelKeys from '../${rel}model_keys';
import ViewModelKeys from '../${rel}viewmodel_keys';
import Models from '../${rel}model_keys';
import RedObservable from '../${rel}actions/observable';
import RedGraph from '../${rel}actions/redgraph';
import { retrieveParameters, fetchModel } from '../${rel}actions/redutils';
import * as DC from './${rel}data-chain';

${collections}

${funcs}`;
};

export function CollectionIsInLanguage(graph: Graph, collection: any, language: any): any {
	const itsUiType = GetNodeProp(collection, NodeProperties.UIType);
	if (itsUiType && itsUiType === language) {
		return true;
	}
	if (itsUiType) {
		return false;
	}
	const reference = GetNodeLinkedTo(graph, {
		id: collection,
		link: LinkType.DataChainCollectionReference
	});
	if (reference) {
		if (GetNodeProp(reference, NodeProperties.NODEType) === NodeTypes.Screen) {
			return true;
		}
		if (GetNodeProp(reference, NodeProperties.UIType) === language) {
			return true;
		}
		if (GetNodeProp(reference, NodeProperties.UIType)) {
			return false;
		}
		const parent = GetNodesLinkedTo(graph, {
			id: collection,
			link: LinkType.DataChainCollection,
			direction: TARGET
		}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.DataChainCollection)[0];
		if (parent) {
			return CollectionIsInLanguage(graph, parent.id, language);
		}
	} else {
		return true;
	}

	return false;
}
