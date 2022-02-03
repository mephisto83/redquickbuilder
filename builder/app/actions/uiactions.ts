/* eslint-disable default-case */
/* eslint-disable func-names */
import * as GraphMethods from '../methods/graph_methods';
import * as GraphTypes from '../methods/graph_types';
import path from 'path';
import * as NodeConstants from '../constants/nodetypes';
import * as Titles from '../components/titles';
import { NavigateTypes } from '../constants/nodetypes';
import {
	MethodFunctions,
	bindTemplate,
	bindReferenceTemplate,
	FunctionTemplateKeys,
	bindReferenceJSONTemplates
} from '../constants/functiontypes';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { uuidv4, addNewLine } from '../utils/array';
import { getReferenceInserts, getJSONReferenceInserts } from '../utils/utilservice';
import { buildValidation } from '../service/validation_js_service';
import UpdateMethodParameters from '../nodepacks/method/UpdateMethodParameters';
import ConnectLifecycleMethod from '../components/ConnectLifecycleMethod';
import { ViewTypes } from '../constants/viewtypes';
import { GraphLink, Graph } from '../methods/graph_types';
import * as _ from '../methods/graph_types';
import JobService, { Job, JobAssignment, JobFile, JobServiceConstants } from '../jobs/jobservice';
import { AgentProject, CommandCenter } from '../jobs/interfaces';
import {
	RouteSourceType,
	RouteSource,
	SimpleValidationConfig,
	ConfigItem,
	ExecutionConfig
} from '../interface/methodprops';
import {
	ReferenceInsert,
	GetJSONReferenceInserts,
	GetJSONReferenceInsertsMap,
	ReferenceInsertType
} from '../components/lambda/BuildLambda';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { ProgrammingLanguages, NodePropertyTypesByLanguage, NEW_LINE } from '../constants/nodetypes';
import fs from 'fs';
import routes from '../constants/routes';
import AddAttributeOfType from '../nodepacks/attributes/AddAttributeOfType';
export const VISUAL = 'VISUAL';
export const MINIMIZED = 'MINIMIZED';
export const BATCH = 'BATCH';
export const HIDDEN = 'HIDDEN';
export const APPLICATION = 'APPLICATION';
export const GRAPHS = 'GRAPHS';
export const VISUAL_GRAPH = 'VISUAL_GRAPH';
export const DASHBOARD_MENU = 'DASHBOARD_MENU';
export const SELECTED_NODE_BB = 'SELECTED_NODE_BB';
export const GROUPS_ENABLED = 'GROUPS_ENABLED';
export const SIDE_PANEL_EXTRA_WIDTH = 'SIDE_PANEL_EXTRA_WIDTH';
export const NodeTypes = NodeConstants.NodeTypes;
export const NodeTypeColors = NodeConstants.NodeTypeColors;
export const NodeProperties = NodeConstants.NodeProperties;
export const LinkProperties = NodeConstants.LinkProperties;
export const NodeAttributePropertyTypes = NodeConstants.NodeAttributePropertyTypes;
export const NodePropertyTypes = NodeConstants.NodePropertyTypes;
export const ValidationRules = NodeConstants.ValidationRules;
export const OptionsTypes = NodeConstants.OptionsTypes;
export const NODE_COST = 'NODE_COST';
export const ApplicationConfig = 'ApplicationConfig';
export const NODE_CONNECTION_COST = 'NODE_CONNECTION_COST';

export const BuildAllProgress = 'BuildAllProgress';
export const CODE_EDITOR_INIT_VALUE = 'CODE_EDITOR_INIT_VALUE';
export const BATCH_MODEL = 'BATCH_MODEL';
export const BATCH_AGENT = 'BATCH_AGENT';
export const BATCH_PARENT = 'BATCH_PARENT';
export const GetItem = (a: any, b: any) => {
	return `${a}${b}`;
};
export const BATCH_FUNCTION_NAME = 'BATCH_FUNCTION_NAME';
export const RECORDING = 'RECORDING';
export const BATCH_FUNCTION_TYPE = 'BATCH_FUNCTION_TYPE';
export const SITE = 'SITE';

export const ValidationPropName = {
	Email: 'email',
	UserName: 'userName',
	Password: 'password',
	PasswordConfirm: 'passwordConfirm'
};
// export const ViewTypes = {
//   Update: "Update",
//   Delete: "Delete",
//   Create: "Create",
//   Get: "Get",
//   GetAll: "GetAll"
// };
export function GetScreenUrl(op: any, overrideText: any = null) {
	const params = GetComponentExternalApiNodes(op.id)
		.filter((externaApiNodes: any) => GetNodeProp(externaApiNodes, NodeProperties.IsUrlParameter))
		.map((v: any) => `:${GetCodeName(v)}`)
		.join('/');
	const route = `${overrideText || GetNodeProp(op, NodeProperties.UIText)}${params ? `/${params}` : ''}`;

	return convertToURLRoute(route);
}
export function convertToURLRoute(x: string) {
	return [...x.split(' ')].filter((x) => x).join('/').toLowerCase();
}
export const UI_UPDATE = 'UI_UPDATE';
export function GetC(state: any, section: any, item: any) {
	if (state && state.uiReducer && state.uiReducer[section]) {
		return state.uiReducer[section][item];
	}
	return null;
}
export function Get(state: any, section: any) {
	if (state && state.uiReducer) {
		return state.uiReducer[section];
	}
	return null;
}
export function generateDataSeed(node: any) {
	const dataSeed = $generateDataSeed(node);
	return JSON.stringify(dataSeed, null, 4);
}

export function ScreenOptionFilter(x: any) {
	if (GetNodeProp(x, NodeProperties.ViewPackageTitle) === 'Register') {
		return false;
	}
	if (GetNodeProp(x, NodeProperties.ViewPackageTitle) === 'Authenticate') {
		return false;
	}
	if (GetNodeProp(x, NodeProperties.ViewPackageTitle) === 'Anonymous Guest') {
		return false;
	}
	if (GetNodeProp(x, NodeProperties.ViewPackageTitle) === 'Forgot Login') {
		return false;
	}
	if (GetNodeProp(x, NodeProperties.IsHomeView)) {
		return false;
	}

	if (GetNodeProp(x, NodeProperties.ViewPackageTitle) === 'Continue As') {
		return false;
	}

	if (
		['Change User Password', 'Continue As', 'Forgot Login', 'Anonymous Guest', 'Authenticate', 'Register'].some(
			(v) => v === GetNodeProp(x, NodeProperties.ViewPackageTitle)
		)
	) {
		return false;
	}

	if (GetNodeProp(x, NodeProperties.ValueName) === 'HomeViewContainer') {
		return false;
	}
	return true;
}

function $generateDataSeed(node: any) {
	const state = _getState();
	const properties: any = {};
	GraphMethods.getPropertyNodes(GetRootGraph(state), node.id).forEach((t: any) => {
		properties[t.id] = {
			name: GetCodeName(t),
			jsName: GetCodeName(t).toJavascriptName(),
			type: GetNodeProp(t, NodeProperties.DataGenerationType)
		};
	});
	GetLogicalChildren(node.id).map((t: any) => {
		properties[t.id] = {
			name: GetCodeName(t),
			jsName: GetCodeName(t).toJavascriptName(),
			type: 'Id'
		};
	});
	const dataSeed = {
		name: GetCodeName(node),
		properties
	};
	return dataSeed;
}

export function generateDataSeeds() {
	return JSON.stringify(NodesByType(_getState(), NodeTypes.Model).map((t: any) => $generateDataSeed(t)));
}
export function Visual(state: any, key: any) {
	return GetC(state, VISUAL, key);
}
export function GetNodeForView(state: any, key: any) {
	if (!key) {
		return null;
	}
	return GetC(state, NODE, key);
}

export function GetLinkForView(state: any, key: any) {
	if (!key) {
		return null;
	}
	return GetC(state, LINK, key);
}
export function GetNodeConnectionsForView(state: any, key: any) {
	if (!key) {
		return null;
	}
	return GetC(state, NODE_CONNECTIONS, key);
}
export function GetNodeLinksForView(state: any, key: any) {
	if (!key) {
		return null;
	}
	return GetC(state, NODE_LINKS, key);
}

export function ChoseModel(id: any) {
	return `choson model ${id}`;
}
export function Minimized(state: any, key: any) {
	if (!key) {
		return Get(state, MINIMIZED);
	}
	return GetC(state, MINIMIZED, key);
}
export function Hidden(state: any, key: any) {
	if (!key) {
		return Get(state, HIDDEN);
	}
	return GetC(state, HIDDEN, key);
}
export function CopyKey(key: any) {
	return `Copy ${key}`;
}
export function IsCurrentNodeA(state: any, type: any) {
	const currentNode: _.Node = Node(state, Visual(state, SELECTED_NODE));
	if (!Array.isArray(type)) {
		type = [type];
	}
	return currentNode && currentNode.properties && type.some((v: any) => v === currentNode.properties.nodeType);
}
export function Use(node: any, prop: any) {
	return node && node.properties && node.properties[prop];
}
export function GetManyToManyNodes(ids: any) {
	return GraphMethods.GetManyToManyNodes(GetCurrentGraph(_getState()), ids) || [];
}
export function GetNodeType(node: any, graph?: any) {
	return GraphMethods.GetNodeProp(node, NodeProperties.NODEType, graph);
}
export const GetNodeProp = GraphMethods.GetNodeProp;
export function GetSnakeCase(node: any) {
	let temp = GetNodeTitle(node);
	return temp.split(' ').filter((x: string) => x).map((x: string) => x.toLowerCase()).join('-');
}
export function GetNodePropDirty(node: any, prop: any, currentGraph: any) {
	if (typeof node === 'string') {
		node = GetNodeById(node, currentGraph) || node;
	}
	return node && node.dirty && node.dirty[prop];
}
export function GetGroupProp(id: any, prop: any) {
	const group = GraphMethods.GetGroup(GetCurrentGraph(_getState()), id);
	if (group) {
		return group && group.properties && group.properties[prop];
	}

	return null;
}

export function GetSharedComponentFor(
	viewType: string,
	modelProperty: _.Node,
	targetModel: any,
	isSharedProperty: any,
	uiType: string
) {
	if (!uiType) {
		throw new Error('no ui type set in GetSharedComponentFor');
	}
	const graph = GetCurrentGraph(GetState());
	let viewTypeNodes = GraphMethods.GetNodesLinkedTo(graph, {
		id: modelProperty.id
	});
	// let viewTypeNodes:any = NodesByType(null, NodeTypes.ViewType);
	// viewTypeNodes = viewTypeNodes.filter((x: any) => {
	// 	let componentNodes = GraphMethods.GetNodesLinkedTo(graph, {
	// 		id: x.id,
	// 		componentType: NodeTypes.ComponentNode,
	// 		link: NodeConstants.LinkType.DefaultViewType
	// 	});

	// 	return componentNodes.find((v: Node) => GetNodeProp(v, NodeProperties.Agent) === agentId);
	// });

	let isPluralComponent: any;
	const propertyNode = GetNodeById(modelProperty.id);
	if (propertyNode && GetNodeProp(propertyNode, NodeProperties.NODEType) === NodeTypes.Model) {
		isPluralComponent = true;
	}
	if (isSharedProperty) {
		viewType = isPluralComponent ? ViewTypes.GetAll : ViewTypes.Get;
	}
	viewTypeNodes = viewTypeNodes.filter((x: _.Node) => {
		let result = GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ViewType;

		result = result && !!GetNodeProp(x, NodeProperties.IsPluralComponent) === !!isPluralComponent;
		return result;
	});
	viewTypeNodes = viewTypeNodes.find((x: _.Node) => {
		if (
			GraphMethods.existsLinkBetween(graph, {
				source: x.id,
				target: targetModel,
				type: NodeConstants.LinkType.DefaultViewType
			})
		) {
			const link = GraphMethods.findLink(graph, {
				source: x.id,
				target: targetModel
			});
			if (GetLinkProperty(link, NodeConstants.LinkPropertyKeys.ViewType) === viewType) {
				return true;
			}
		}
		return false;
	});
	if (viewTypeNodes) {
		return viewTypeNodes.id;
	}
	switch (viewType) {
		case ViewTypes.Get:
			return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGet);
		case ViewTypes.Create:
			return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeCreate);
		case ViewTypes.Delete:
			return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeDelete);
		case ViewTypes.GetAll:
			return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGetAll);
		case ViewTypes.Update:
			return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeUpdate);
		default:
			throw new Error('unhandled case for getting shared component');
	}
}

export function GetModelReferencedByProperty(property: string, currentGraph?: any) {
	currentGraph = currentGraph || GetCurrentGraph(_getState());
	if (GetNodeProp(property, NodeProperties.NODEType) === NodeTypes.Model) {
		return GetNodeById(property);
	}
	return GraphMethods.GetNodeLinkedTo(currentGraph, {
		id: property,
		link: NodeConstants.LinkType.ModelTypeLink,
		componentType: NodeTypes.Model
	});
}

export function getViewTypeEndpointsForDefaults(viewType: any, currentGraph: any, id: any) {
	currentGraph = currentGraph || GetCurrentGraph(_getState());

	const currentNode: any = GetNodeById(id, currentGraph);
	const connectto: any = GetNodesByProperties(
		{
			[NodeProperties.NODEType]: NodeTypes.ViewType,
			[NodeProperties.ViewType]: viewType
		},
		currentGraph
	).filter((_x) => {
		const res = GraphMethods.existsLinkBetween(currentGraph, {
			source: _x.id,
			type: NodeConstants.LinkType.DefaultViewType,
			target: currentNode.id
		});
		if (res) {
			const link = GraphMethods.GetLinkBetween(_x.id, currentNode.id, currentGraph);
			if (link && link.properties && link.properties.target === currentNode.id) {
				return true;
			}
		}
		return false;
	});

	return connectto;
}

export function setSharedComponent(args: any) {
	const { properties, target, source, viewType, uiType, isPluralComponent } = args;
	return (dispatch: any, getState: any) => {
		const state = getState();
		const graph = GetCurrentGraph(getState());
		if (
			!GraphMethods.existsLinkBetween(graph, {
				target,
				source,
				type: NodeConstants.LinkType.SharedComponent,
				properties: { viewType }
			}) &&
			GetNodeProp(target, NodeProperties.SharedComponent) &&
			GetNodeProp(target, NodeProperties.NODEType) === NodeTypes.ComponentNode
		) {
			const connections = GraphMethods.GetConnectedNodesByType(state, source, NodeTypes.ComponentNode)
				.filter((x: any) => GetNodeProp(x, NodeProperties.ViewType) === viewType)
				.filter((x: any) => GetNodeProp(x, NodeProperties.UIType) === uiType)
				.filter((x: any) => GetNodeProp(x, NodeProperties.IsPluralComponent) === isPluralComponent)
				.map((x: { id: any }) => ({
					operation: REMOVE_LINK_BETWEEN_NODES,
					options: {
						source,
						target: x.id
					}
				}));

			PerformGraphOperation([
				...connections,
				{
					operation: ADD_LINK_BETWEEN_NODES,
					options: {
						source,
						target,
						properties: { ...properties }
					}
				}
			])(dispatch, getState);
		}
	};
}
export function AddLinkBetweenNodes(source: string, target: string, properties: any, callback?: Function): any[] {
	return [
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options: {
				source,
				target,
				properties: { ...properties },
				callback
			}
		}
	];
}
export function UpdateLinkProperty(id: string, prop: string, value: any) {
	return [
		{
			operation: UPDATE_LINK_PROPERTY,
			options: { id, value, prop }
		}
	];
}
export function CreateNewNode(props: any, callback?: Function) {
	return [
		{
			operation: ADD_NEW_NODE,
			options: {
				callback,
				nodeType: props.nodeType,
				properties: {
					...props
				}
			}
		}
	];
}

export function AddInsertArgumentsForDataChain(id: string) {
	let lambdaText = GetNodeProp(id, NodeProperties.Lambda);
	const value: GraphTypes.LambdaInserts = GetNodeProp(id, NodeProperties.LambdaInsertArguments) || {};
	GetJSONReferenceInserts(lambdaText || '').map((_insert: ReferenceInsert) => {
		if (_insert.model) {
			if (_insert.property) {
				value[_insert.key] = _insert.property;
			} else {
				value[_insert.key] = _insert.model;
			}
		} else {
			value[_insert.key] = '';
		}
	});
	updateComponentProperty(id, NodeProperties.LambdaInsertArguments, value);
}
export function SetSharedComponent(args: any) {
	const { properties, target, source, viewType, uiType, isPluralComponent, graph } = args;
	if (
		!GraphMethods.existsLinkBetween(graph, {
			target,
			source,
			type: NodeConstants.LinkType.SharedComponent,
			properties: { viewType }
		}) &&
		GetNodeProp(target, NodeProperties.SharedComponent) &&
		GetNodeProp(target, NodeProperties.NODEType) === NodeTypes.ComponentNode
	) {
		const connectionsAll = GraphMethods.GetConnectedNodesByType(GetState(), source, NodeTypes.ComponentNode);

		const connections: any[] = [];
		//  connectionsAll
		// 	.filter((x: any) => GetNodeProp(x, NodeProperties.ViewType) === viewType)
		// 	.filter((x: any) => GetNodeProp(x, NodeProperties.UIType) === uiType)
		// 	.filter((x: any) => GetNodeProp(x, NodeProperties.IsPluralComponent) === isPluralComponent)
		// 	.map((x: any) => ({
		// 		operation: REMOVE_LINK_BETWEEN_NODES,
		// 		options: {
		// 			source,
		// 			target: x.id
		// 		}
		// 	}));

		return [
			...connections,
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options: {
					source,
					target,
					properties: { ...properties }
				}
			}
		];
	}
	return null;
}
export function setComponentApiConnection(args: { properties: any; target: any; source: any }) {
	const { properties, target, source } = args;
	return (dispatch: any, getState: Function) => {
		const state = getState();
		const graph = GetCurrentGraph(state);
		if (
			[
				NodeTypes.EventMethod,
				NodeTypes.LifeCylceMethod,
				NodeTypes.MethodApiParameters,
				NodeTypes.DataChain,
				NodeTypes.Selector
			].some((t) => t === GetNodeProp(target, NodeProperties.NODEType))
		) {
			if (
				!GraphMethods.existsLinkBetween(graph, {
					target,
					source,
					type: NodeConstants.LinkType.ComponentApiConnection
				})
			) {
				const connections = GraphMethods.GetConnectedNodesByType(
					state,
					source,
					GetNodeProp(target, NodeProperties.NODEType)
				).map((x: { id: any }) => ({
					operation: REMOVE_LINK_BETWEEN_NODES,
					options: {
						source,
						target: x.id
					}
				}));
				PerformGraphOperation([
					...connections,
					{
						operation: ADD_LINK_BETWEEN_NODES,
						options: {
							source,
							target,
							properties: { ...properties }
						}
					}
				])(dispatch, getState);
			}
		}
	};
}

export function addQueryMethodParameter() {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		const currentNode: any = Node(state, Visual(state, SELECTED_NODE));
		const operations = [];
		operations.push({
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.MethodApiParameters,
					properties: {
						[NodeProperties.UIText]: 'Query Parameter',
						[NodeProperties.QueryParameterParam]: true
					},
					parent: currentNode.id,
					groupProperties: {},
					linkProperties: {
						properties: {
							...LinkProperties.MethodApiParameters,
							params: true,
							query: true
						}
					}
				};
			}
		});
		PerformGraphOperation(operations)(dispatch, getState);
	};
}
export function addFunctionParameter() {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		const currentNode: any = Node(state, Visual(state, SELECTED_NODE));
		const operations = [];
		operations.push({
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.Parameter,
					properties: {
						[NodeProperties.UIText]: 'Parameter',
						[NodeProperties.QueryParameterParam]: true
					},
					parent: currentNode.id,
					groupProperties: {},
					linkProperties: {
						properties: {
							...LinkProperties.FunctionApiParameters,
							params: true,
							query: true
						}
					}
				};
			}
		});
		PerformGraphOperation(operations)(dispatch, getState);
	};
}
function _addFunctionParameter(parameterName: string, functionId: string, callback: any) {
	return {
		operation: ADD_NEW_NODE,
		options() {
			return {
				nodeType: NodeTypes.Parameter,
				properties: {
					[NodeProperties.UIText]: parameterName,
					[NodeProperties.QueryParameterParam]: true,
					[NodeProperties.Pinned]: true
				},
				parent: functionId,
				callback,
				groupProperties: {},
				linkProperties: {
					properties: {
						...LinkProperties.FunctionApiParameters,
						params: true,
						query: true
					}
				}
			};
		}
	}
}
export function AddFunction(params: any) {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		let currentNode: any = null;
		const operations: any = [{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.Function,
					callback: (newnode: any) => {
						functionId = newnode.id;
						currentNode = newnode;
					},
					properties: {
						[NodeProperties.UIText]: params.functionName,
						[NodeProperties.Pinned]: true
					},
					links: []
				};
			}
		}];
		if (params.agentId) {
			operations.push(function () {
				return [{
					operation: REMOVE_LINK_BETWEEN_NODES,
					options: {
						target: currentNode.properties[NodeProperties.Agent],
						source: params.agentId
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Agent,
						id: functionId,
						value: params.agentId
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Pinned,
						id: functionId,
						value: true
					}
				}, {
					operation: ADD_LINK_BETWEEN_NODES,
					options: {
						target: params.agentId,
						source: functionId,
						properties: { ...LinkProperties.FunctionOperator }
					}
				}]
			})
		}
		if (params.maestro) {
			operations.push(function () {
				return [{
					operation: REMOVE_LINK_BETWEEN_NODES,
					options: {
						target: currentNode.properties[NodeProperties.Maestro],
						source: params.maestro
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Maestro,
						id: functionId,
						value: params.maestro
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Pinned,
						id: params.maestro,
						value: true
					}
				}, {
					operation: ADD_LINK_BETWEEN_NODES,
					options: {
						target: params.maestro,
						source: functionId,
						properties: { ...LinkProperties.FunctionLink }
					}
				}]
			})
		}
		if (params.model) {
			operations.push(function () {
				return [{
					operation: REMOVE_LINK_BETWEEN_NODES,
					options: {
						target: currentNode.properties[NodeProperties.Model],
						source: params.model
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Model,
						id: functionId,
						value: params.model
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Pinned,
						id: params.model,
						value: true
					}
				}, {
					operation: ADD_LINK_BETWEEN_NODES,
					options: {
						target: params.model,
						source: functionId,
						properties: { ...LinkProperties.ModelTypeLink }
					}
				}]
			})
		}
		if (params.functionType) {
			operations.push(function () {
				return [{
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.FunctionType,
						id: functionId,
						value: params.functionType
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Pinned,
						id: params.functionType,
						value: true
					}
				}, {
					operation: APPLY_FUNCTION_CONSTRAINTS,
					options: {
						id: functionId,
						value: params.functionType
					}
				}]
			})
		}
		if (params.method) {
			operations.push(function () {
				return [{
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.MethodType,
						id: functionId,
						value: params.method
					}
				}]
			});
		}
		if (params.httpMethod) {
			operations.push(function () {
				return [{
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.HttpMethod,
						id: functionId,
						value: params.httpMethod
					}
				}]
			});
		}
		if (params.permissionSource) {
			operations.push(function () {
				return [{
					operation: REMOVE_LINK_BETWEEN_NODES,
					options: {
						target: currentNode.properties[NodeProperties.PermissionImpl],
						source: params.permissionSource
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.PermissionImpl,
						id: functionId,
						value: params.permissionSource
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Pinned,
						id: params.permissionSource,
						value: true
					}
				}, {
					operation: ADD_LINK_BETWEEN_NODES,
					options: {
						target: params.permissionSource,
						source: functionId,
						properties: { ...LinkProperties.PermissionSource }
					}
				}]
			})
		}
		if (params.permissionEnum) {
			operations.push(function () {
				return [{
					operation: REMOVE_LINK_BETWEEN_NODES,
					options: {
						target: currentNode.properties[NodeProperties.PermissionValueType],
						source: params.permissionEnum
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.PermissionValueType,
						id: functionId,
						value: params.permissionEnum
					}
				}, {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Pinned,
						id: params.permissionEnum,
						value: true
					}
				}, {
					operation: ADD_LINK_BETWEEN_NODES,
					options: {
						target: params.permissionEnum,
						source: functionId,
						properties: { ...LinkProperties.PermissionLink }
					}
				}]
			})
		}
		operations.push(function () {
			let function_output_node: any = null;
			return [{
				operation: NEW_FUNCTION_OUTPUT_NODE,
				options: {
					parent: functionId,
					callback: (newnode: any) => {
						function_output_node = newnode;
					},
					linkProperties: {
						properties: LinkProperties.FunctionOutput
					}
				}
			}, function () {
				return {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.Pinned,
						id: function_output_node.id,
						value: true
					}
				}
			}]
		})
		let functionId: string = '';
		(params.parameters || []).forEach((param: any) => {
			let paramNodeId = '';
			let newParamNode: any = null;
			operations.push(() => {
				return _addFunctionParameter(param.name, functionId, (newparameter: any) => {
					paramNodeId = newparameter.id;
					newParamNode = newparameter;
				})
			}, param.useEnum && param.enum ? () => {
				return function () {
					let param_Attr: any = null;
					return [{
						operation: NEW_ATTRIBUTE_NODE,
						options: {
							parent: paramNodeId,
							groupProperties: {},
							linkProperties: {
								properties: {
									type: 'attribute-link',
									'attribute-link': {}
								}
							},
							callback: (new_attr: any) => {
								param_Attr = new_attr;
							}
						}
					}, function () {
						return {
							operation: CHANGE_NODE_TEXT,
							options: {
								id: param_Attr.id,
								value: param.enum
							}
						}
					}, function () {
						return {
							operation: CHANGE_NODE_PROPERTY,
							options: {
								id: param_Attr.id,
								value: NodeAttributePropertyTypes[param.enum]
							}
						}
					}]
				}
			} : () => {
				return function () {
					return [{
						operation: REMOVE_LINK_BETWEEN_NODES,
						options: {
							target: param.type,
							source: paramNodeId
						}
					}, {
						operation: CHANGE_NODE_PROPERTY,
						options: {
							prop: NodeProperties.QueryParameterParamType,
							id: newParamNode.id,
							value: param.type
						}
					}, {
						operation: ADD_LINK_BETWEEN_NODES,
						options: {
							target: paramNodeId,
							source: param.type,
							properties: { ...LinkProperties.FunctionApiParameterType }
						}
					}]
				}
			});
		})
		PerformGraphOperation(operations)(dispatch, getState);
	}
}
export function addQueryMethodApi() {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		const currentNode = Node(state, Visual(state, SELECTED_NODE));
		const queryObjects = GraphMethods.GetConnectedNodesByType(
			state,
			currentNode ? currentNode.id : null,
			NodeTypes.MethodApiParameters
		).filter((x: any) => GetNodeProp(x, NodeProperties.QueryParameterObject));
		if (queryObjects.length === 0) {
			const operations = [];
			operations.push({
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.MethodApiParameters,
						properties: {
							[NodeProperties.UIText]: 'Query',
							[NodeProperties.QueryParameterObject]: true,
							[NodeProperties.QueryParameterObjectExtendible]: true
						},
						links: [
							{
								target: currentNode ? currentNode.id : null,
								linkProperties: {
									properties: {
										...LinkProperties.MethodApiParameters,
										params: true,
										query: true
									}
								}
							}
						]
					};
				}
			});
			PerformGraphOperation(operations)(dispatch, getState);
		}
	};
}

export function connectLifeCycleMethod(args: { properties: any; target: any; source: any }) {
	const { target, source } = args;
	return (dispatch: any, getState: Function) => {
		setTimeout(() => {
			const state = getState();
			const graph = GetCurrentGraph(state);
			graphOperation(ConnectLifecycleMethod({ target, source, graph }))(dispatch, getState);
		}, 100);
	};
}

export function addComponentEventTo(node: any, apiName: any) {
	return (dispatch: any, getState: any) => {
		graphOperation([ComponentEventTo(node, apiName)])(dispatch, getState);
	};
}
export function ComponentEventTo(node: any, apiName: any, callback?: Function) {
	return {
		operation: ADD_NEW_NODE,
		options() {
			return {
				nodeType: NodeTypes.EventMethod,
				callback,
				properties: {
					[NodeProperties.EventType]: apiName,
					[NodeProperties.UIText]: `${apiName}`
				},
				links: [
					{
						target: node,
						linkProperties: {
							properties: { ...LinkProperties.EventMethod }
						}
					}
				]
			};
		}
	};
}
export function GetTitleService() {
	return NodesByType(GetState(), NodeTypes.TitleService).find((x: any) => x);
}
export function AgentHasExecutor(model: { id: any }) {
	const state = GetState();
	const graphRoot = GetCurrentGraph();
	return NodesByType(state, NodeTypes.Executor).find((x: { id: any }) =>
		GraphMethods.existsLinkBetween(graphRoot, {
			source: x.id,
			target: model.id
		})
	);
}
export function setupDefaultViewType(args: { properties: any; target: any; source: any }) {
	const { properties, target, source } = args;
	return (dispatch: any, getState: Function) => {
		const graph = GetCurrentGraph(getState());
		let is_property_link = false;
		if (
			GraphMethods.existsLinkBetween(graph, {
				target,
				source,
				type: NodeConstants.LinkType.ModelTypeLink
			})
		) {
			const isUsedAsModelType = GetNodeProp(source, NodeProperties.UseModelAsType);
			if (isUsedAsModelType) {
				const targetedTypeNode = GetNodeProp(source, NodeProperties.UIModelType);
				if (targetedTypeNode === target) {
					is_property_link = true;
				}
			}
		}

		const right_link =
			is_property_link ||
			GraphMethods.existsLinkBetween(graph, {
				target,
				source,
				type: NodeConstants.LinkType.LogicalChildren
			});
		if (right_link) {
			const useModelAsType = GetNodeProp(target, NodeProperties.UseModelAsType);
			const illegalViewType = false; // useModelAsType ? ViewTypes.GetAll : ViewTypes.Get;
			if (properties.all) {
				PerformGraphOperation(
					Object.keys(ViewTypes).filter((x: any) => x !== illegalViewType).map((viewType) => {
						const sibling: any = uuidv4();
						return {
							operation: ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.ViewType,
									properties: {
										[NodeProperties.ViewType]: viewType,
										[NodeProperties.UIText]: `[${viewType}] ${GetNodeTitle(
											target
										)} => ${GetNodeTitle(source)}`
									},
									...useModelAsType ? { parent: target, groupProperties: {} } : {},
									links: [
										{
											target: target,
											linkProperties: {
												properties: {
													...properties,
													viewType,
													sibling,
													target: target
												}
											}
										},
										{
											target: source,
											linkProperties: {
												properties: {
													...properties,
													viewType,
													sibling,
													source: source
												}
											}
										}
									]
								};
							}
						};
					})
				)(dispatch, getState);
			} else {
				if (illegalViewType !== properties.viewType) {
					PerformGraphOperation([
						{
							operation: ADD_NEW_NODE,
							options() {
								const sibling: any = uuidv4();
								return {
									nodeType: NodeTypes.ViewType,
									properties: {
										[NodeProperties.UIText]: `[${properties.viewType}] ${GetNodeTitle(
											target
										)}:${GetNodeTitle(source)}`
									},
									links: [
										{
											target: target,
											linkProperties: {
												properties: { ...properties, sibling }
											}
										},
										{
											target: source,
											linkProperties: {
												properties: { ...properties, sibling }
											}
										}
									]
								};
							}
						}
					])(dispatch, getState);
				}
			}
		}
	};
}
export function GetConditionNodes(id: any) {
	const state = _getState();
	return GraphMethods.GetConditionNodes(state, id);
}
export function IsAgent(node: any) {
	return GetNodeProp(node, NodeProperties.IsAgent);
}
export function GetLinkChainItem(options: any) {
	return GraphMethods.GetLinkChainItem(GetState(), options);
}
export function GetLambdaVariableTitle(node: any, escape?: boolean, shortKey?: boolean) {
	let title: string = GetNodeTitle(node);
	if (shortKey) {
		return `${title.split(' ').filter((x) => x).map((f: string) => f.toLocaleLowerCase()).join('-')}`;
	}
	if (escape) {
		return `\#\{${title.split(' ').filter((x) => x).map((f: string) => f.toLocaleLowerCase()).join('-')}\}`;
	}
	return `#{${title.split(' ').filter((x) => x).map((f: string) => f.toLocaleLowerCase()).join('-')}}`;
}
export function GetCssName(node: any): string {
	const graph = GetCurrentGraph(GetState());
	if (typeof node === 'string') {
		node = GraphMethods.GetNode(graph, node);
	}
	return GetNodeProp(node, NodeProperties.CssName) || GetJSCodeName(node);
}
export function GetCodeNamespace(node: any): string {
	return `${GetCodeName(node)}NS`;
}
export function GetCodeName(node: any, options?: any): string {
	const graph = GetCurrentGraph(GetState());
	if (typeof node === 'string') {
		node = GraphMethods.GetNode(graph, node);
	}
	if (options && options.includeNameSpace) {
		if (GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.DataChain) {
			const collections = GraphMethods.GetNodesLinkedTo(graph, {
				id: node.id,
				link: NodeConstants.LinkType.DataChainCollection,
				direction: GraphMethods.SOURCE
			});
			if (collections && collections.length) {
				return `${computeNamespace(collections[0])}.${GetNodeProp(node, NodeProperties.CodeName)}`;
			}
		}
	}
	return GetNodeProp(node, NodeProperties.CodeName);
}

export function GetRelativeDataChainPath(node: any): any {
	const graph = GetCurrentGraph();
	const collections = GraphMethods.GetNodesLinkedTo(graph, {
		id: node.id,
		link: NodeConstants.LinkType.DataChainCollection,
		direction: GraphMethods.SOURCE
	});
	if (collections && collections.length) {
		return [...GetRelativeDataChainPath(collections[0]), GetJSCodeName(node)];
	}
	return [GetJSCodeName(node)];
}

export function computeNamespace(node: any) {
	const graph = GetCurrentGraph(GetState());
	const dc = GraphMethods.GetNodesLinkedTo(graph, {
		id: node.id,
		link: NodeConstants.LinkType.DataChainCollection,
		direction: GraphMethods.SOURCE
	});
	if (dc && dc.length) {
		const namesp: any = computeNamespace(dc[0]);
		if (namesp) {
			return `${namesp}.${GetJSCodeName(node)}`;
		}
	}
	return `${GetJSCodeName(node)}`;
}

export function GetJSCodeName(node: any | string) {
	const l = GetCodeName(node);
	if (l) {
		return l.toJavascriptName();
	}
	return l;
}

export function SetLayoutComponent(currentNode: Node, selectedCell: string, component: string) {
	let cellProperties;
	const nodeLayout = GetNodeProp(currentNode, NodeProperties.Layout);
	cellProperties = GraphMethods.GetCellProperties(nodeLayout, selectedCell);
	cellProperties.children = cellProperties.children || {};
	let cellChildren = cellProperties.children;
	cellChildren[selectedCell] = component;
	return nodeLayout;
}

export function GetModelPropertyChildren(id: string, options: any = {}) {
	const { skipLogicalChildren } = options;
	const propertyNodes = GetModelPropertyNodes(id);
	const logicalChildren = skipLogicalChildren ? [] : GetLogicalChildren(id);
	let userModels = [];
	if (GetNodeProp(id, NodeProperties.NODEType) === NodeTypes.Model || GetNodeProp(id, NodeProperties.IsUser)) {
		userModels = GetUserReferenceNodes(id);
	}
	return [...userModels, ...propertyNodes, ...logicalChildren]
		.filter((x) => x.id !== id)
		.unique((v: { id: any }) => v.id);
}
export function QuickStore(key: string, value: any) {
	let dispatch = GetDispatchFunc();
	let getState = GetStateFunc();
	if (dispatch && getState) {
		setVisual(key, value)(dispatch, getState);
	}
}
/**
 * Gets the models properties, that will appear on the model.
 * @param id node id
 */
export function GetModelCodeProperties(id: string) {
	const propertyNodes = GetModelPropertyNodes(id);
	let graph = GetCurrentGraph();
	const logicalChildren = GetLogicalChildren(id);
	// const logicalParents = GraphMethods.GetNodesLinkedTo(graph, {
	// 	id,
	// 	direction: GraphMethods.TARGET,
	// 	link: NodeConstants.LinkType.LogicalChildren
	// });
	let userModels = [];
	if (GetNodeProp(id, NodeProperties.NODEType) === NodeTypes.Model || GetNodeProp(id, NodeProperties.IsUser)) {
		userModels = GetUserReferenceNodes(id);
	}
	return [...userModels, ...propertyNodes, ...logicalChildren]
		.filter((x) => x.id !== id)
		.unique((v: { id: any }) => v.id);
}
export function GetMethodParameters(methodId: string) {
	const method = GetNodeById(methodId);
	if (method) {
		const methodType = GetNodeProp(method, NodeProperties.FunctionType);
		if (methodType && MethodFunctions[methodType]) {
			const { parameters } = MethodFunctions[methodType];
			if (parameters) {
				return parameters;
			}
		}
	}
	return null;
}
export function updateMethodParameters(current: any, methodType: any, viewPackages: any) {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		graphOperation(
			UpdateMethodParameters({
				methodType,
				current,
				viewPackages
			})
		)(dispatch, getState);
	};
}
export function Connect(source: any, target: any, linkProperties: any) {
	return {
		target,
		source,
		properties: { ...linkProperties || {} }
	};
}
export function attachMethodToMaestro(methodNodeId: any, modelId: any, options: { maestro: any }, viewPackage: any) {
	return (dispatch: any, getState: Function) => {
		let controller: any = false;
		let maestro: any = false;
		if (options && options.maestro) {
			PerformGraphOperation([
				{
					operation: ADD_LINK_BETWEEN_NODES,
					options() {
						return {
							source: options.maestro,
							target: methodNodeId,
							properties: {
								...LinkProperties.FunctionLink
							}
						};
					}
				}
			])(dispatch, getState);
			return;
		}
		PerformGraphOperation([
			{
				operation: ADD_NEW_NODE,
				options(graph: any) {
					const state = getState();
					const _controller = NodesByType(state, NodeTypes.Controller).find((x: { id: any }) =>
						GraphMethods.existsLinkBetween(graph, {
							target: modelId,
							source: x.id,
							link: NodeConstants.LinkType.ModelTypeLink
						})
					);

					if (!_controller) {
						return {
							nodeType: NodeTypes.Controller,
							properties: {
								...viewPackage || {},
								[NodeProperties.UIText]: `${GetNodeTitle(modelId)} Controller`
							},
							links: [
								{
									target: modelId,
									linkProperties: {
										properties: {
											...LinkProperties.ModelTypeLink
										}
									}
								}
							],
							callback: (_controller: boolean) => {
								controller = _controller;
							}
						};
					}
					controller = _controller;
				}
			},
			{
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						id: controller.id,
						value: 'systemUser',
						prop: NodeProperties.CodeUser
					};
				}
			},
			{
				operation: ADD_NEW_NODE,
				options(graph: any) {
					const state = getState();

					const _maestro = NodesByType(state, NodeTypes.Maestro).find((x: { id: any }) =>
						GraphMethods.existsLinkBetween(graph, {
							target: modelId,
							source: x.id,
							link: NodeConstants.LinkType.ModelTypeLink
						})
					);

					if (!_maestro) {
						return {
							nodeType: NodeTypes.Maestro,
							properties: {
								...viewPackage || {},
								[NodeProperties.UIText]: `${GetNodeTitle(modelId)} Maestro`
							},
							links: [
								{
									target: modelId,
									linkProperties: {
										properties: {
											...LinkProperties.ModelTypeLink
										}
									}
								}
							],
							callback: (_maestro: boolean) => {
								maestro = _maestro;
							}
						};
					}
					maestro = _maestro;
				}
			},
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						source: controller.id,
						target: maestro.id,
						properties: {
							...LinkProperties.MaestroLink
						}
					};
				}
			},
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						source: maestro.id,
						target: methodNodeId,
						properties: {
							...LinkProperties.FunctionLink
						}
					};
				}
			}
		])(dispatch, getState);
	};
}
export function GetMethodParametersFor(methodId: string, type: any) {
	const method = GetNodeById(methodId);
	if (method) {
		const methodType = GetNodeProp(method, NodeProperties.FunctionType);
		if (methodType && MethodFunctions[methodType]) {
			const { permission, validation } = MethodFunctions[methodType];
			switch (type) {
				case NodeTypes.Permission:
					return permission ? permission.params : null;
				case NodeTypes.Validator:
					return validation ? validation.params : null;
			}
		}
	}
	return null;
}
export function GetNodeById(node: any, graph?: any): any {
	return GraphMethods.GetNode(graph || GetCurrentGraph(GetState()), node);
}
export function GetNodesByProperties(props: { [x: string]: any }, graph?: any, state?: any) {
	const currentGraph = graph || GetCurrentGraph(state || GetState());
	if (currentGraph) {
		const nodeSubset = GraphMethods.GetNodesByProperties(props, currentGraph);
		return nodeSubset;
	}
	return [];
}
export function GetNodeByProperties(props: any, graph?: any, state?: any) {
	return GetNodesByProperties(props, graph, state).find((x) => x);
}

export function GetChildComponentAncestors(id: string) {
	return GraphMethods.GetChildComponentAncestors(_getState(), id);
}

export function GetMethodDefinition(id: any) {
	return MethodFunctions[GetMethodFunctionType(id)];
}
export function GetMethodFunctionType(id: any) {
	const state = _getState();
	const method = GraphMethods.GetMethodNode(state, id);

	return GetNodeProp(method, NodeProperties.FunctionType);
}
export function GetMethodFunctionValidation(id: any) {
	const state = _getState();
	const method = GraphMethods.GetMethodNode(state, id);
	return GetNodeProp(method, NodeProperties.MethodFunctionValidation);
}
export function GetPermissionNode(id: string) {
	const state = _getState();
	return GraphMethods.GetPermissionNode(state, id);
}
export function GetValidationNode(id: string) {
	const state = _getState();
	return GraphMethods.GetValidationNode(state, id);
}
export function GetDataSourceNode(id: string) {
	const state = _getState();
	return GraphMethods.GetDataSourceNode(state, id);
}
export function GetModelItemFilter(id: string) {
	const state = _getState();
	return GraphMethods.GetModelItemFilter(state, id);
}
export function GetPermissionsConditions(id: any) {
	return _getPermissionsConditions(_getState(), id);
}
export function GetServiceInterfaceMethodCalls(id: any) {
	const state = GetState();
	const graph = GetRootGraph(state);
	return GraphMethods.GetNodesLinkedTo(graph, {
		id
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ServiceInterfaceMethod);
}
export function GetServiceInterfaceCalls(id: any) {
	const state = GetState();
	const graph = GetRootGraph(state);
	return GraphMethods.GetNodesLinkedTo(graph, {
		id
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ServiceInterface);
}
export function GetValidationsConditions(id: any) {
	return _getValidationConditions(_getState(), id);
}
export function GetModelItemConditions(id: any) {
	return _getValidationConditions(_getState(), id);
}
export function GetConditionSetup(condition: any) {
	return GetNodeProp(condition, NodeProperties.Condition);
}
export function GetDataChainEntryNodes(cs?: any) {
	return GraphMethods.GetDataChainEntryNodes(_getState(), cs);
}
export function GetProperty(currentNode: any, property: any) {
	if (currentNode && currentNode.properties) {
		return currentNode.properties[property]
	}
	return null;
}
export function IsModel(id: string) {
	return GetNodeProp(id, NodeProperties.NODEType) === NodeTypes.Model;
}
export function GetPropertyModel(propId: string): _.Node | null {
	let nodes = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
		id: propId,
		link: NodeConstants.LinkType.ModelTypeLink,
		componentType: NodeTypes.Model
	});
	nodes.push(
		...GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
			id: propId,
			link: NodeConstants.LinkType.PropertyLink
		})
	);

	return nodes && nodes.length ? nodes[0] : null;
}
export function GetLambdaDefinition(method: any | null) {
	const functionType = GetNodeProp(method, NodeProperties.FunctionType);
	const { lambda } = MethodFunctions[functionType];
	return lambda;
}
export function GenerateDataChainArguments(id: string) {
	const currentNode: any = GetNodeById(id);
	let _arguments = '';
	if (GetNodeProp(currentNode, NodeProperties.CS)) {
		const methods = GraphMethods.GetNodesLinkedTo(null, {
			id: currentNode.id,
			link: NodeConstants.LinkType.DataChainLink,
			componentType: NodeTypes.Method
		});
		if (methods.length) {
			const functionType = GetNodeProp(methods[0], NodeProperties.FunctionType);
			const { lambda } = MethodFunctions[functionType];
			if (lambda && lambda.default) {
				const methodProps: any = GetMethodProps(methods[0]);
				_arguments = Object.keys(lambda.default)
					.filter((x) => x !== 'return')
					.map((key) => `${key.split('.').join('')}:${key} `)
					.join(', ');
			}
		}
	}
	return _arguments;
}
export function GenerateCSChainFunction(id: string) {
	const lastNodeName = GenerateCDDataChainMethod(id);
	const arbiters = GetArbitersInCSDataChainMethod(id);
	const staticArbiters = GetStaticArbitersInCSDataChainMethod(id);
	let alternateOutputType = null;
	const outputType = GetOutputTypeInCSDataChainMethod(id, (v: string) => {
		alternateOutputType = v;
	});
	let arbiterInterfaces = arbiters
		.map((arb: string | Node) => `IRedArbiter<${GetCodeName(arb)}> _arbiter${GetCodeName(arb)}`)
		.join(', ');
	let arbiterInterfacesStatic = staticArbiters
		.map((arb: string | Node) => `static IRedArbiter<${GetCodeName(arb)}> _arbiter${GetCodeName(arb)}Static;`)
		.join(NEW_LINE);
	let arbiterSets = addNewLine(
		arbiters
			.map((arb: string | Node) => `arbiter${GetCodeName(arb)} = _arbiter${GetCodeName(arb)};`)
			.join(NodeConstants.NEW_LINE)
	);

	let arbiterProperties = arbiters
		.map((arb: string | Node) => `IRedArbiter<${GetCodeName(arb)}> arbiter${GetCodeName(arb)};`)
		.join(NodeConstants.NEW_LINE);

	let arbiterPropertiesStatic = staticArbiters
		.map(
			(arb: string | Node) => `static IRedArbiter<${GetCodeName(arb)}> arbiter${GetCodeName(arb)}Static {
      get {
        if(arbiter${GetCodeName(arb)}Static == null) {
          _arbiter${GetCodeName(arb)}Static = RedStrapper.Resolve<IRedArbiter<${GetCodeName(arb)}>>();
        }
        return _arbiter${GetCodeName(arb)}Static;
      }
    }`
		)
		.join(NodeConstants.NEW_LINE);

	const currentNode: any = GetNodeById(id);
	let _arguments = '';
	if (GetNodeProp(currentNode, NodeProperties.CS)) {
		const methods = GraphMethods.GetNodesLinkedTo(null, {
			id: currentNode.id,
			link: NodeConstants.LinkType.DataChainLink,
			componentType: NodeTypes.Method
		});
		if (methods.length) {
			const functionType = GetNodeProp(methods[0], NodeProperties.FunctionType);
			const { lambda } = MethodFunctions[functionType];
			if (lambda && lambda.default) {
				const methodProps = GetMethodProps(methods[0]);
				_arguments = Object.keys(lambda.default)
					.filter((x) => x !== 'return')
					.map(
						(key) =>
							`${GetCodeName(methodProps[lambda.default[key]]) || lambda.default[key]} ${key
								.split('.')
								.join('')}`
					)
					.join(', ');
			}
		}
	}
	let method = '';
	if (GetNodeProp(id, NodeProperties.CompleteFunction)) {
		method = `public class ${GetCodeName(id)}
              {
                // ${id}
              ${arbiterProperties}
              ${arbiterPropertiesStatic}
              ${arbiterInterfacesStatic}

                  public ${GetCodeName(id)}(${arbiterInterfaces}) {
              ${arbiterSets}
                  }
                  ${lastNodeName}
              }`;
	} else {
		let out_type = alternateOutputType || outputType ? `<${alternateOutputType || GetCodeName(outputType)}>` : '';
		method = `public class ${GetCodeName(id)}
            {
              // ${id}
            ${arbiterProperties}
                public ${GetCodeName(id)}(${arbiterInterfaces}) {
            ${arbiterSets}
                }
                public async Task${out_type} Execute(${_arguments}) {
                  ${lastNodeName}
                }
            }`;
	}
	return method;
}
export function GenerateChainFunction(id: any, options: { language: any }) {
	const chain = GetDataChainParts(id);
	let args: any = null;
	let overridArg: any = null;
	let extraArgs: string[] = [];
	const observables: string[] = [];
	const { language } = options;
	let anyType = ': any';
	if (language === NodeConstants.UITypes.ReactNative) {
		anyType = '';
	} else {
		let interface_type: string = generateContextInterfaces(GetNodeById(id), anyType);
		if (interface_type) {
			anyType = `: ${interface_type}`;
			overridArg = ['$internalComponentState'];
		}
	}

	const setArgs: string[] = [];
	const subscribes: string[] = [];
	const setProcess: string[] = [];
	chain.forEach((c: any, index: number) => {
		if (index === 0) {
			args = overridArg || GetDataChainArgs(c);
			extraArgs = GetExtraArgs(c);
		}
		const temp = GenerateDataChainMethod(c, options);
		observables.push(GenerateObservable(c));
		setArgs.push(GenerateArgs(c, chain));
		setProcess.push(GenerateSetProcess(c, chain, options));
		subscribes.push(GetSubscribes(c, chain));
		return temp;
	});
	const index = chain.indexOf(id);
	const nodeName = (GetJSCodeName(id) || 'node' + index).toJavascriptName();
	const lastLink = GetLastChainLink(chain);
	const lastLinkindex = chain.indexOf(lastLink);
	const lastNodeName = (GetJSCodeName(lastLink) || 'node' + lastLinkindex).toJavascriptName();
	const method = `export function  ${GetCodeName(id)}(${args
		.map((v: any) => `${v}${anyType}`)
		.join()}${extraArgs.join()}) {
${observables.join(NodeConstants.NEW_LINE)}
${setArgs.join(NodeConstants.NEW_LINE)}
${setProcess.join(NodeConstants.NEW_LINE)}
${subscribes.join(NodeConstants.NEW_LINE)}
${nodeName}.update( ${(overridArg ? overridArg[0] : '') || '$id'}  , '$id');

return ${lastNodeName}.value;
}`;

	return method;
}
export function GetEventArguments(buttonId: string): _.Node[] {
	let eventArguments = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
		id: buttonId,
		link: NodeConstants.LinkType.EventArgument
	});

	return eventArguments;
}
function GetExtraArgs(id: string) {
	let argumentSource = GraphMethods.GetNodeLinkedTo(GetCurrentGraph(), {
		id,
		link: NodeConstants.LinkType.MethodArgumentSoure
	});
	if (argumentSource) {
		let apiInternalNodes = GetComponentInternalApiNodes(argumentSource.id);

		let calculateEventArguments = GetEventArguments(argumentSource.id);
		// let internalApiArgs = createInternalApiArgumentsCode(apiInternalNodes, calculateEventArguments);

		return [createInternalApiArguments(apiInternalNodes, calculateEventArguments)];
	}
	return [];
}

function generateContextInterfaces(currentNode: GraphTypes.Node, anyType?: string) {
	let result = '';
	if (!currentNode) {
		return '';
	}
	let graph = GetCurrentGraph();
	let screenEffectApis = GraphMethods.GetNodesLinkedTo(graph, {
		id: currentNode.id,
		link: NodeConstants.LinkType.ScreenEffectApi
	}).map((node: Node) => {
		return GetJSCodeName(node);
	});
	let possibleDataChainParams: string[] = [];
	let dataScreenEffects = GraphMethods.GetNodesLinkedTo(graph, {
		id: currentNode.id,
		link: NodeConstants.LinkType.DataChainScreenEffect
	});
	dataScreenEffects.forEach((temp: _.Node) => {
		let componentOrScreenOption = GraphMethods.GetNodeLinkedTo(graph, {
			id: temp.id,
			link: NodeConstants.LinkType.ComponentInternalApi
		});
		let internalNodes = GetComponentInternalApiNodes(componentOrScreenOption.id, graph);
		possibleDataChainParams.push(...internalNodes.map((v: _.Node) => GetJSCodeName(v)));
	});
	let contextParameters: string[] = [];
	GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
		id: currentNode.id,
		link: NodeConstants.LinkType.ContextParameters
	}).forEach((node: Node) => {
		let nodeParams = GetNodeProp(node, NodeProperties.ContextParams) || [];
		contextParameters.push(...nodeParams);
	});
	let argumentSource = GraphMethods.GetNodeLinkedTo(GetCurrentGraph(), {
		id: currentNode.id,
		link: NodeConstants.LinkType.MethodArgumentSoure
	});
	let eventArgNames: string[] = [];
	if (argumentSource) {
		let calculateEventArguments = GetEventArguments(argumentSource.id);
		eventArgNames = getEventArgumentNames(calculateEventArguments);
	}
	if (currentNode && (screenEffectApis.length || contextParameters.length)) {
		result = `{
${[...screenEffectApis, ...contextParameters, ...eventArgNames, ...possibleDataChainParams, 'viewModel', 'value']
				.filter((x: string) => x)
				.unique()
				.map((param: string) => {
					return `${param}?: string | number | null`;
				})
				.join(`,${NodeConstants.NEW_LINE}`)}
}
    `;
	}

	return result;
}

function createInternalApiArguments(apiInternalNodes: _.Node[], eventArguments: _.Node[]) {
	let result = '';
	let argNames = getEventArgumentNames(eventArguments);
	result = `, $internalComponentState?: { [str:string]: any, ${[
		...apiInternalNodes.map((node: _.Node) => {
			return GetNodeTitle(node);
		}),
		...argNames
	]
		.unique()
		.map((name: string) => {
			return `${name}: string | number | null`;
		})
		.join(', ' + NodeConstants.NEW_LINE)} }`;
	return result;
}

function getEventArgumentNames(calculateEventArguments: _.Node[]): string[] {
	let methodParamNames: string[] = [];
	(calculateEventArguments || []).forEach((node: _.Node) => {
		switch (GetNodeProp(node, NodeProperties.EventArgumentType)) {
			case NodeConstants.EventArgumentTypes.RouteSource:
				let routeSource: RouteSource = GetNodeProp(node, NodeProperties.RouteSource);
				let paramName = GetNodeProp(node, NodeProperties.ParameterName).toJavascriptName();
				switch (routeSource.type) {
					case RouteSourceType.Agent:
					case RouteSourceType.Model:
					case RouteSourceType.UrlParameter:
					case RouteSourceType.Item:
					case RouteSourceType.Body:
						methodParamNames.push(paramName);
						break;
				}
				break;
		}
	});
	return methodParamNames.unique();
}

export function GenerateSetProcess(id: any, parts: string | any[], options: any) {
	const index = parts.indexOf(id);
	const nodeName = (GetJSCodeName(id) || 'node' + index).toJavascriptName();
	return `${nodeName}.setProcess(${GenerateDataChainMethod(id, options)})`;
}

export function GetSubscribes(id: any, parts: { indexOf: (arg0: any) => string }) {
	const node = GetNodeById(id);
	const index = parts.indexOf(id);
	const nodeName = (GetJSCodeName(id) || 'node' + index).toJavascriptName();
	const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	if (functionType && DataChainFunctions[functionType] && DataChainFunctions[functionType].merge) {
		// pulls args from other nodes
		const args = Object.keys(DataChainFunctions[functionType].ui).map((key) => {
			const temp = GetNodeProp(node, DataChainFunctions[functionType].ui[key]);
			return `${(GetJSCodeName(temp) || 'node' + parts.indexOf(temp)).toJavascriptName()}`;
		});
		if (args && args.length) {
			return `${args
				.map(
					(v) => `${v}.subscribe(${nodeName});
`
				)
				.join('')}`;
		}
	} else {
		const parent = GetNodeProp(node, NodeProperties.ChainParent);
		if (parent) {
			return `${GetJSCodeName(parent).toJavascriptName()}.subscribe(${nodeName})`;
		}
	}
	return '';
}

export function GenerateArgs(id: string, parts: { indexOf: (arg0: any) => string }) {
	const node = GetNodeById(id);
	const index = parts.indexOf(id);
	const nodeName = (GetJSCodeName(id) || 'node' + index).toJavascriptName();
	const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	if (functionType && DataChainFunctions[functionType] && DataChainFunctions[functionType].merge) {
		// pulls args from other nodes
		const args = Object.keys(DataChainFunctions[functionType].ui).map((key, kindex) => {
			const temp = GetNodeProp(node, DataChainFunctions[functionType].ui[key]);
			return `['${(GetJSCodeName(temp) || 'node' + parts.indexOf(temp)).toJavascriptName()}']: ${kindex}`;
		});

		return `${nodeName}.setArgs({ ${args} })`;
	}
	const parent = GetNodeProp(node, NodeProperties.ChainParent);
	if (parent) {
		return `${nodeName}.setArgs({ ['${GetJSCodeName(parent).toJavascriptName()}']: 0 })`;
	}
	return `${nodeName}.setArgs({ $id: 0 })`;

	return '';
}

export function GetLastChainLink(parts: any[]) {
	const lastLink = parts.find((id: string) => GetNodeProp(GetNodeById(id), NodeProperties.AsOutput));
	return lastLink;
}
export function GenerateObservable(id: any) {
	const nodeName = GetJSCodeName(id);
	return `let ${nodeName} = new RedObservable('${nodeName}');`;
}

export function GenerateDataChainFunc(id: any) {
	const nodeName = GetCodeName(id);
	//Should be able to capture the args throw the link between nodes.
	return `private async Task ${nodeName}(/*define args*/) {
    throw new NotImplementedException();
  }`;
}
export function GetDataChainArgs(id: string) {
	const node = GetNodeById(id);
	const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	if (functionType && DataChainFunctions[functionType]) {
		const { merge, ui } = DataChainFunctions[functionType];
		if (merge) {
			return Object.keys(ui);
		}
		return ['$id?'];
	}
	return [];
}

export function GenerateChainFunctions(options: { cs?: any; language: any; collection?: any }) {
	const { cs, language, collection } = options;
	const graph = GetCurrentGraph();
	const entryNodes = GetDataChainEntryNodes(cs)
		.unique((x: { id: string }) => x.id)
		.filter((x: any, index: number) => {
			const languageAgnostic = GetNodeProp(x, NodeProperties.UIAgnostic);
			if (languageAgnostic) {
				return true;
			}
			const uiType = GetNodeProp(x, NodeProperties.UIType);
			if (uiType) {
				return language === uiType;
			}
			return true;
		})
		.map((x: { id: any }, index: number) => x.id)
		.filter((ct: any, index: number) => {
			const collections = GraphMethods.GetNodesLinkedTo(graph, {
				id: ct,
				link: NodeConstants.LinkType.DataChainCollection
			});
			if (collection) {
				return collections.find((v: { id: any }) => v.id === collection);
			}
			return !collections || !collections.length;
		});
	const temp = entryNodes
		.map(
			(v: any, index: number) =>
				cs ? { node: v, class: GenerateCSChainFunction(v) } : GenerateChainFunction(v, options)
		)
		.unique((x: any, index: number) => {
			if (typeof x === 'string') {
				return x;
			}
			return x.node;
		});
	// sorry this is bad.
	if (cs) {
		return temp;
	}
	return temp.join(NodeConstants.NEW_LINE);
}
export function CollectionIsInLanguage(graph: any, collection: any, language: any): any {
	const uiTypeOfCollection = GetNodeProp(collection, NodeProperties.UIType);
	if (uiTypeOfCollection && uiTypeOfCollection === language) {
		return true;
	}
	if (uiTypeOfCollection) {
		return false;
	}
	const reference = GraphMethods.GetNodeLinkedTo(graph, {
		id: collection,
		link: NodeConstants.LinkType.DataChainCollectionReference
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
		const parent = GraphMethods.GetNodesLinkedTo(graph, {
			id: collection,
			link: NodeConstants.LinkType.DataChainCollection,
			direction: GraphMethods.TARGET
		}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.DataChainCollection)[0];
		if (parent) {
			return CollectionIsInLanguage(graph, parent.id, language);
		}
	} else {
		return true;
	}

	return true;
}

export function GetDefaults(args: { node: any; targetFunction: any }) {
	const { node, targetFunction } = args;
	const defaults: any = {};
	if (targetFunction && targetFunction.callingArguments) {
		const layout = GetNodeProp(node, NodeProperties.Layout);

		if (layout) {
			targetFunction.callingArguments.forEach((d: { field: string }) => {
				const cellId = GraphMethods.GetCellIdByTag(layout, d.field.upperCaseFirst());
				if (cellId) {
					const children = GraphMethods.GetChild(layout, cellId);
					if (children) {
						defaults[d.field] = children;
					}
				}
			});
		}
	}
	return defaults;
}

export function GetDataChainCollections(options: { language: any; collection: any }) {
	const { collection, language } = options;
	const graph = GetCurrentGraph();
	const temp = collection
		? GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
			id: collection,
			link: NodeConstants.LinkType.DataChainCollection,
			direction: GraphMethods.TARGET
		}).filter(
			(x: any) =>
				GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.DataChainCollection &&
				CollectionIsInLanguage(graph, x.id, language)
		)
		: [];

	return NodesByType(null, NodeTypes.DataChainCollection)
		.filter((x: { id: any }) => {
			if (collection) {
				const res = temp.some((v: { id: any }) => v.id === x.id);
				if (res) {
					return true;
				}
				return false;
			}
			///only reference the top levels in data-chain.js
			return (
				GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
					id: x.id,
					link: NodeConstants.LinkType.DataChainCollection,
					direction: GraphMethods.SOURCE
				}).filter((dcc: any) => GetNodeProp(dcc, NodeProperties.NODEType) === NodeTypes.DataChainCollection)
					.length === 0 && CollectionIsInLanguage(graph, x.id, language)
			);
		})
		.map((dataChainCollection: any) => {
			const dccPath = GetRelativeDataChainPath(dataChainCollection);
			return [
				`export const ${GetJSCodeName(dataChainCollection)} = $${GetJSCodeName(dataChainCollection)};`,
				`import * as $${GetJSCodeName(dataChainCollection)} from './${collection ? '' : `datachains/`}${[
					...dccPath,
					GetJSCodeName(dataChainCollection)
				]
					.subset(dccPath.length - 1)
					.join('/')}';`
			];
		})
		.flatten()
		.sort((a: string, b: any) => `${b}`.localeCompare(a))
		.unique()
		.join(NodeConstants.NEW_LINE);
}

export function GetComponentExternalApiNode(api: any, parent: any, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GraphMethods.GetNodesLinkedTo(graph, {
		id: parent,
		link: NodeConstants.LinkType.ComponentExternalApi
	}).find((v: any) => GetNodeTitle(v) === api);
}

export function GetComponentApiNode(api: any, parent: any, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GraphMethods.GetNodesLinkedTo(graph, {
		id: parent,
		link: NodeConstants.LinkType.ComponentInternalApi
	}).find((v: any) => GetNodeTitle(v) === api);
}
export function GetComponentApiNodes(parent: any, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GraphMethods.GetNodesLinkedTo(graph, {
		id: parent,
		link: NodeConstants.LinkType.ComponentInternalApi
	});
}

export function GetComponentExternalApiNodes(parent: any, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GraphMethods.GetNodesLinkedTo(graph, {
		id: parent,
		link: NodeConstants.LinkType.ComponentExternalApi
	});
}

export function GetNodeMethodCall(id: any, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GraphMethods.GetNodesLinkedTo(graph, {
		id,
		link: NodeConstants.LinkType.MethodCall
	}).find((v: any) => v);
}

export function GetComponentInternalApiNode(api: any, parent: any, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GraphMethods.GetNodesLinkedTo(graph, {
		id: parent,
		link: NodeConstants.LinkType.ComponentInternalApi
	}).find((v: any) => GetNodeTitle(v) === api);
}
export function GetComponentInternalApiNodes(parent: string, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GraphMethods.GetNodesLinkedTo(graph, {
		id: parent,
		link: NodeConstants.LinkType.ComponentInternalApi
	});
}

export function GenerateChainFunctionSpecs(options: { language: any; collection: any }) {
	const { language, collection } = options;
	const result: string[] = [];
	const graph = GetCurrentGraph();
	const entryNodes = GetDataChainEntryNodes()
		.filter((x: any) => {
			const uiType = GetNodeProp(x, NodeProperties.UIType);
			if (uiType) {
				return language === uiType;
			}
			return true;
		})
		.map((x: { id: any }) => x.id)
		.filter((ct: any) => {
			const collections = GraphMethods.GetNodesLinkedTo(graph, {
				id: ct,
				link: NodeConstants.LinkType.DataChainCollection
			});
			if (collection) {
				return collections.find((v: { id: any }) => v.id === collection);
			}
			return !collections || !collections.length;
		});

	const basicentryvalues = [undefined, null, 0, {}, 'a string', 1.1, [], [1], ['1'], ['1', 1]];

	entryNodes.map((entryNode: any) => {
		basicentryvalues.map((val) => {
			result.push(GenerateSimpleTest(entryNode, val));
		});
	});
	return result;
}
export function GenerateSimpleTest(node: any, val: {} | null | undefined) {
	let _value = ['object', 'string'].some((v) => typeof val === v && val !== undefined && val !== null)
		? JSON.stringify(val)
		: val;
	if (val === undefined) {
		_value = 'undefined';
	} else if (val === null) {
		_value = 'null';
	}
	const template = `it('${GetCodeName(node)} - should be able to handle a "${typeof val === 'object'
		? JSON.stringify(val)
		: val}"', () => {
    let error = undefined;
    try {
        DC.${GetCodeName(node, {
			includeNameSpace: true
		})}(${_value});
    }
    catch(e) {
        error = e;
        console.error(e);
    }
    expect(error === undefined).toBeTruthy(error);
})`;
	return template;
}

export function updateComponentTags(itemValue: any, cellProperties: { properties: { tags: any[] } }) {
	if (cellProperties && cellProperties.properties) {
		cellProperties.properties.tags = cellProperties.properties.tags || [];
		if (cellProperties.properties.tags.find((v: any) => v === itemValue)) {
			const index = cellProperties.properties.tags.findIndex((v: any) => v === itemValue);
			cellProperties.properties.tags.splice(index, 1);
		} else {
			cellProperties.properties.tags.push(itemValue);
		}
	}
}
export function addComponentTags(itemValue: string, cellProperties: { properties: { tags?: any } }) {
	cellProperties.properties = cellProperties.properties || {};
	cellProperties.properties.tags = cellProperties.properties.tags || [];
	if (!cellProperties.properties.tags.find((v: any) => v === itemValue)) {
		cellProperties.properties.tags.push(itemValue);
	}
}

export function GetDataChainNext(id: any, graph?: any) {
	graph = graph || GetRootGraph(_getState());
	if (!graph) {
		throw 'no graph found';
	}
	const current = id;
	const groupDaa = GetNodeProp(GetNodeById(current), NodeProperties.Groups);

	if (groupDaa && groupDaa.group) {
		const group = GraphMethods.GetGroup(graph, groupDaa.group);
		if (group) {
			const entryNode = GetGroupProp(group.id, NodeConstants.GroupProperties.GroupEntryNode);
			if (entryNode === current) {
				const exitNode = GetGroupProp(group.id, NodeConstants.GroupProperties.ExternalExitNode);
				return GetNodeById(exitNode);
			}
		}
	}
	const next = GraphMethods.getNodesByLinkType(graph, {
		id: current,
		type: NodeConstants.LinkType.DataChainLink,
		direction: GraphMethods.SOURCE
	})
		.filter((x: any) => x.id !== current)
		.sort((a, b) => {
			const a_ = GetNodeProp(a, NodeProperties.ChainParent) ? 1 : 0;
			const b_ = GetNodeProp(b, NodeProperties.ChainParent) ? 1 : 0;
			return a_ - b_;
		})
		.unique((x: { id: any }) => x.id)[0];
	return next;
}
export function GetDataChainNextId(id: any, graph?: any) {
	const next = GetDataChainNext(id, graph);
	return next && next.id;
}
export function GetDataChainParts(id: any, result?: any) {
	result = result || [id];
	result.push(id);
	result = [...result].unique();
	const node = GetNodeById(id);
	const nodeGroup = GetNodeProp(node, NodeProperties.Groups) || {};
	let groups = Object.values(nodeGroup);
	const dataChains = NodesByType(_getState(), NodeTypes.DataChain);
	let oldlength;
	do {
		oldlength = result.length;
		const dc = dataChains.filter((x: any) =>
			result.some((v: any) => v === GetNodeProp(x, NodeProperties.ChainParent))
		);
		result.push(...dc.map((v: { id: any }) => v.id));
		dc.map((_dc: any) => {
			groups = [...groups, ...Object.values(GetNodeProp(_dc, NodeProperties.Groups) || {})];
		});
		groups.map((g) => {
			const nodes = GetNodesInGroup(g);
			result.push(...nodes);
		});
		result = result.unique();
	} while (result.length !== oldlength);

	return result;
}
export function GetNodesInGroup(groupId: unknown) {
	return GraphMethods.GetNodesInGroup(GetCurrentGraph(_getState()), groupId);
}
export function GetDataChainFrom(id: any) {
	const result = [id];
	let current = id;
	const graph = GetRootGraph(_getState());
	if (!graph) {
		throw 'no graph found';
	}
	for (let i = 0; i < 10; i++) {
		const next = GetDataChainNext(current);
		current = null;
		if (next && next.id) {
			result.push(next.id);
			current = next.id;
		} else {
			break;
		}
	}

	return result;
}
export function getGroup(id: string, graph: any) {
	// return graph.groupLib[id];
	return GraphMethods.getGroup(graph || GetCurrentGraph(_getState()), id);
}
export function hasGroup(id: string, graph: any) {
	//    return !!(graph.nodeLib[parent] && GetNodeProp(graph.nodeLib[parent], NodeProperties.Groups));
	return GraphMethods.hasGroup(graph || GetCurrentGraph(_getState()), id);
}

export function IsEndOfDataChain(id: any) {
	return GetDataChainFrom(id).length === 1;
}

export function GetLambdaVariableNode(id: string, key: string | number) {
	const currentNode: any = GetNodeById(id);
	if (GetNodeProp(currentNode, NodeProperties.CS)) {
		const methods = GraphMethods.GetNodesLinkedTo(null, {
			id: currentNode.id,
			link: NodeConstants.LinkType.DataChainLink,
			componentType: NodeTypes.Method
		});
		if (methods.length) {
			const functionType = GetNodeProp(methods[0], NodeProperties.FunctionType);
			const { lambda } = MethodFunctions[functionType];
			if (lambda && lambda.default) {
				const methodProps = GetMethodProps(methods[0]);

				return GetNodeById(methodProps[key]);
			}
		}
	}
	return null;
}

export function GetArbitersInCSDataChainMethod(id: string) {
	const node = GetNodeById(id);
	const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	const lambda = GetNodeProp(node, NodeProperties.Lambda);

	const result: any[] = [];
	switch (functionType) {
		case DataChainFunctionKeys.Lambda:
			getReferenceInserts(lambda).map((v) => v.substr(2, v.length - 3)).unique().map((_insert: string) => {
				const temp = _insert.split('@');
				const insert = temp.length > 1 ? temp[1] : temp[0];
				if (temp.length > 1) {
					switch (temp[0]) {
						case 'arbiter get':
							const lambdaNode = GetLambdaVariableNode(id, insert);
							if (lambdaNode) result.push(lambdaNode);
							break;
						default:
							break;
					}
				}
			});
			result.push(...(GetNodeProp(node, NodeProperties.ArbiterModels) || []));
			break;
	}
	return result.unique();
}

export function GetStaticArbitersInCSDataChainMethod(id: string) {
	const node = GetNodeById(id);
	const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	const lambda = GetNodeProp(node, NodeProperties.Lambda);

	const result: any[] = [];
	switch (functionType) {
		case DataChainFunctionKeys.Lambda:
			result.push(...(GetNodeProp(node, NodeProperties.ArbiterModels) || []));
			break;
	}
	return result.unique();
}

export function GetOutputTypeInCSDataChainMethod(id: string, callback?: any) {
	const node = GetNodeById(id);
	const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	const lambda = GetNodeProp(node, NodeProperties.Lambda);

	let result = null;
	switch (functionType) {
		case DataChainFunctionKeys.Lambda:
			getReferenceInserts(lambda).map((v) => v.substr(2, v.length - 3)).unique().map((_insert: string) => {
				const temp = _insert.split('@');
				if (temp.length > 1) {
					if (temp[0].indexOf('return') === 0) {
						const vari = temp[0].split(' ').filter((x: any) => x);
						if (temp[1].indexOf('|') !== -1) {
							//   #{return@sm|ChangeBy|agent }
							//   #{return@sm|}
							//   #{return@agent|}
							let res = '';
							temp.subset(1).join('').split('|').map((v: string) => v.trim()).forEach((v: string) => {
								let temp = GetNodeProp(id, NodeProperties.LambdaInsertArguments);
								if (temp && temp[v]) {
									res += `${GetCodeName(temp[v])}`;
								} else {
									res += v;
								}
							});
							if (res && callback) {
								callback(res);
							}
						}
						const lambdaNode = GetLambdaVariableNode(id, vari[vari.length - 1]);
						if (lambdaNode) result = lambdaNode;
						else {
						}
					}
				}
			});
	}
	let category = GetNodeProp(id, NodeProperties.DataChainTypeCategory);
	switch (category) {
		case DataChainType.Permission:
			if (callback) {
				callback('bool');
			}
			break;
	}
	return result;
}
export function GenerateCDDataChainMethod(id: string) {
	const node: any = GetNodeById(id);
	const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	let lambda = GetNodeProp(node, NodeProperties.Lambda);
	const lambdaInsertArguments = GetNodeProp(node, NodeProperties.LambdaInsertArguments);
	switch (functionType) {
		case DataChainFunctionKeys.Lambda:
			let lambdaText = GetNodeProp(id, functionType);
			lambda = processLambdaFunction(lambdaText, lambdaInsertArguments, lambda);

			getReferenceInserts(lambda).map((v) => v.substr(2, v.length - 3)).unique().map((_insert: string) => {
				const temp = _insert.split('@');
				const insert = temp.length > 1 ? temp[1] : temp[0];
				if (temp.length > 1) {
					let swap = temp[0];
					const args = insert.split('~');
					const model = args[0];
					const property = args[1];

					switch (temp[0]) {
						case 'arbiter get':
							const lambdaNode = GetLambdaVariableNode(id, insert);
							swap = `await arbiter${GetCodeName(lambdaNode)}.Get<${GetCodeName(lambdaNode)}>`;
							break;
						default:
							if (property) {
								const lambdaNode = lambdaInsertArguments[property];
								swap = `${model}.${GetCodeName(lambdaNode)}`;
							}
							break;
					}
					lambda = lambda.replace(`#{${_insert}}`, swap);
				} else {
					const args = insert.split('~');
					const property = args[0];
					const prop = lambdaInsertArguments[property];
					const node = GetNodeById(prop);
					lambda = bindReferenceTemplate(lambda, {
						[property]: GetCodeName(node)
					});
				}
			});
			return `${lambda}`;
		default:
			throw `${GetNodeTitle(node)} ${node.id} - ${functionType} is not a defined function type.`;
	}
}
function processLambdaFunction(lambdaText: any, lambdaInsertArguments: any, lambda: any) {
	let temp = GetJSONReferenceInsertsMap(lambdaText);
	if (temp) {
		Object.values(temp).map((v: { template: string; insert: ReferenceInsert }) => {
			let { key, js, type = ReferenceInsertType.Model } = v.insert;
			let valueKey = key;
			if (lambdaInsertArguments && lambdaInsertArguments[valueKey] && lambdaInsertArguments[valueKey][type]) {
				let codeName = GetCodeName(lambdaInsertArguments[valueKey][type]);
				if (type == ReferenceInsertType.EnumerationValue) {
					let enumerationValues =
						GetNodeProp(
							lambdaInsertArguments[key]
								? lambdaInsertArguments[key][ReferenceInsertType.Enumeration]
								: null,
							NodeProperties.Enumeration
						) || [];
					let temp: any = enumerationValues.find(
						(v: { id: string }) => v.id === lambdaInsertArguments[valueKey][type]
					);
					if (temp) {
						codeName = `${temp.value}`.toUpperCase();
					}
				} else if (type === ReferenceInsertType.PropertyType) {
					let uiType = GetNodeProp(
						lambdaInsertArguments[key]
							? lambdaInsertArguments[key][ReferenceInsertType.PropertyType]
							: null,
						NodeProperties.UIAttributeType
					);
					if (
						!uiType &&
						GetNodeProp(
							lambdaInsertArguments[key]
								? lambdaInsertArguments[key][ReferenceInsertType.PropertyType]
								: null,
							NodeProperties.NODEType
						) === NodeTypes.Model
					) {
						uiType = 'STRING';
					}
					if (uiType) {
						codeName = NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][uiType];
					}
				}
				if (js && codeName) {
					codeName = codeName.toJavascriptName();
				}

				lambda = bindReferenceJSONTemplates(lambda, {
					[v.template]: codeName
				});
			}
		});
	}
	return lambda;
}

export function GenerateDataChainMethod(id: string, options: { language: any }) {
	const node: any = GetNodeById(id);
	const model: any = GetNodeProp(node, NodeProperties.UIModelType);
	const stateKey: any = GetNodeProp(node, NodeProperties.StateKey);
	const modelKey: any = GetNodeProp(node, NodeProperties.ModelKey);
	const viewModelKey: any = GetNodeProp(node, NodeProperties.ViewModelKey);
	const numberParameter: any = GetNodeProp(node, NodeProperties.NumberParameter);
	const property: any = GetNodeProp(node, NodeProperties.Property);
	const functionType: any = GetNodeProp(node, NodeProperties.DataChainFunctionType);
	const func: any = GetCodeName(GetNodeProp(node, NodeProperties.DataChainReference), { includeNameSpace: true });
	const funcs: any = GetNodeProp(node, NodeProperties.DataChainReferences);
	const selectorProp: any = GetNodeProp(node, NodeProperties.SelectorProperty);
	const nodeInput1: any = GetNodeProp(node, NodeProperties.ChainNodeInput1);
	const nodeInput2: any = GetNodeProp(node, NodeProperties.ChainNodeInput2);
	const navigateMethod: any = GetNodeProp(node, NodeProperties.NavigationAction);
	const methodMethod: any = GetNodeProp(node, NodeProperties.Method);
	const $screen: any = GetNodeProp(node, NodeProperties.Screen);
	const useNavigationParams: any = GetNodeProp(node, NodeProperties.UseNavigationParams);
	const { language } = options;
	let lambda = GetNodeProp(node, NodeProperties.Lambda);
	const lambdaInsertArguments = GetNodeProp(node, NodeProperties.LambdaInsertArguments);
	const listReference = GetNodeProp(node, NodeProperties.List);
	let lastpart = 'return item;';
	let anyType = ': any';
	if (language === NodeConstants.UITypes.ReactNative) {
		anyType = '';
	}
	switch (functionType) {
		case DataChainFunctionKeys.ModelProperty:
			if (property) {
				lastpart = `if(item) {
        return item.${GetJSCodeName(property) || property};
    }
    return null;`;
			}
			return `(id${anyType}) => {
    let item = typeof(id) ==='object' ? id : GetItem(Models.${GetCodeName(model)}, id);
    if(!item && id && typeof(id) === 'string') {
      fetchModel(Models.${GetCodeName(model)}, id);
    }
    ${lastpart}
}`;
		case DataChainFunctionKeys.Model:
			return `(id${anyType}) => {
    let item = GetItem(Models.${GetCodeName(model)}, id);
    if(!item && id) {
      fetchModel(Models.${GetCodeName(model)}, id);
    }
    ${lastpart}
}`;
		case DataChainFunctionKeys.Pass:
			return `(arg${anyType}) => {
    return arg;
}`;
		case DataChainFunctionKeys.NewRedGraph:
			return `() => {
        let menuData = new RedGraph();
        return menuData;
      }`;
		case DataChainFunctionKeys.AddUrlsToGraph:
			return `(graph${anyType}) => {
        Object.keys(routes).map(route=>{
          RedGraph.addNode(graph, { title: route, id: route } , route);
          RedGraph.addLink(graph, null, route);
        });
        return graph;
      }`;
		case DataChainFunctionKeys.StringConcat:
			return `(node1${anyType}, node2${anyType}) => { return \`\${node1} \${node2}\` }`;
		case DataChainFunctionKeys.EmailValidation:
			return `(value${anyType}) => validateEmail(value)`;
		case DataChainFunctionKeys.AlphaNumericLike:
			return `(value${anyType}) => alphanumericLike(value)`;
		case DataChainFunctionKeys.AlphaNumeric:
			return `(value${anyType}) => alphanumeric(value)`;
		case DataChainFunctionKeys.NumericInt:
			return `(value${anyType}) => numericint(value)`;
		case DataChainFunctionKeys.AlphaOnly:
			return `(value${anyType}) => alpha(value)`;
		case DataChainFunctionKeys.BooleanAnd:
			return `(a${anyType}, b${anyType}) => a && b`;
		case DataChainFunctionKeys.BooleanOr:
			return `(a${anyType}, b${anyType}) => a || b`;
		case DataChainFunctionKeys.IfTrue:
			return `(a${anyType}, b${anyType}) => {
        if(a) {
          return b;
        }
        return undefined;
      }`;
		case DataChainFunctionKeys.IfThanElse:
			return `(a${anyType}) => {
        if(a){
          return ${GetCodeName(nodeInput1)}(a);
        }
        else {
          return ${GetCodeName(nodeInput2)}(a);
        }
      }`;
		case DataChainFunctionKeys.GreaterThanOrEqualTo:
			return `(a${anyType}) => greaterThanOrEqualTo(a, ${numberParameter})`;
		case DataChainFunctionKeys.Map:
			return `($a${anyType}) => ($a || []).map(${lambda})`;
		case DataChainFunctionKeys.Lambda:
			lambda = untransformLambda(lambda, node);
			getReferenceInserts(lambda).map((v) => v.substr(2, v.length - 3)).unique().map((insert: string) => {
				const args = insert.split('~');
				const property = args.length > 1 ? args[1] : args[0];
				const prop: any = lambdaInsertArguments[property];
				const node: any = GetNodeById(prop);
				let bindValue: any = GetCodeName(node);
				if (args.length > 1) {
					bindValue = GetJSCodeName(node); //bindValue.toLowerCase();
				}
				lambda = bindReferenceTemplate(lambda, {
					[insert]: bindValue
				});
			});

			// const lambdaInsertArguments = GetNodeProp(node, NodeProperties.LambdaInsertArguments);
			if (lambdaInsertArguments) {
				lambda = processLambdaFunction(lambda, lambdaInsertArguments, lambda);
			}
			return `${lambda}`;
		case DataChainFunctionKeys.Merge:
			return `() => {
        ${Object.keys(funcs || {})
					.map((key) => `let ${key}${anyType} = DC.${GetCodeName(funcs[key], { includeNameSpace: true })}();`)
					.join(NodeConstants.NEW_LINE)}
        ${lambda}
      }`;
		case DataChainFunctionKeys.ListReference:
			return `(a${anyType}) => RedLists.${GetCodeName(listReference)}`;
		case DataChainFunctionKeys.NumericalDefault:
			return `(a${anyType}) => numericalDefault(a, ${numberParameter})`;
		case DataChainFunctionKeys.ArrayLength:
			return `(a${anyType}) => arrayLength(a)`;
		case DataChainFunctionKeys.LessThanOrEqualTo:
			return `(a${anyType}) => lessThanOrEqualTo(a, ${numberParameter})`;
		case DataChainFunctionKeys.MaxLength:
			return `(a${anyType}) => maxLength(a, ${numberParameter})`;
		case DataChainFunctionKeys.MinLength:
			return `(a${anyType}) => minLength(a, ${numberParameter})`;
		case DataChainFunctionKeys.EqualsLength:
			return `(a${anyType}) => equalsLength(a, ${numberParameter})`;
		case DataChainFunctionKeys.GreaterThan:
			return `(a${anyType}) => greaterThan(a, ${numberParameter})`;
		case DataChainFunctionKeys.Property:
			return `(a${anyType}) => a ? a.${GetJSCodeName(property) || property} : null`;
		case DataChainFunctionKeys.ReferenceDataChain:
			return `(a${anyType}) => DC.${func}(a)`;
		case DataChainFunctionKeys.Navigate:
			let insert = '';
			if (useNavigationParams) {
				insert = `
        if($internalComponentState) {
          Object.keys($internalComponentState).forEach((v${anyType})=>{
            let regex =  new RegExp(\`\\:$\{v}\`, 'gm');
            route = route.replace(regex, $internalComponentState[v]);
          });
        }

        Object.keys(a).forEach((v${anyType})=>{
          let regex =  new RegExp(\`\\:$\{v}\`, 'gm');
          route = route.replace(regex, a[v]);
        });`;
			}
			return `(a${anyType}) => {
        if(a && typeof a === 'object' && !a.success && a.hasOwnProperty('success')) {
          return a;
        }
        let route = routes.${GetCodeName($screen)};
        ${insert}
        navigate.${NavigateTypes[navigateMethod]}({ route })(GetDispatch(), GetState());
        return a;
      }`;
		case DataChainFunctionKeys.NavigateTo:
			return `(a${anyType}) => {
        navigate.${NavigateTypes[navigateMethod]}({ route: routes[a] })(GetDispatch(), GetState());
        return a;
      }`;
		case DataChainFunctionKeys.SetBearerAccessToken:
			return `(a${anyType}) => {
        if(a && a.error) {
          console.error('An error occurred during the authentication process');
          if(a.errorMessage) {
            console.error(a.errorMessage);
          }
        }
        if(a && a.accessToken) {
          $service.setBearerAccessToken(a.accessToken, a.userId);
          if(a && a.userName && a.password) {
            // Anonymous users
            $service.setUserNameAndPasswordForAnonymousUser(a.userName, a.password);
          }
          return  { success : true, value : a };
        }
        if(typeof a === 'string') {
          $service.setBearerAccessToken(a);
          return  { success : true, value : a };
        }

        return  { success : false, value : a };
    }`;
		case DataChainFunctionKeys.StoreCredResults:
			return `(creds${anyType}) => {
        let dispatch = GetDispatch();
        if(creds && dispatch) {
             dispatch(
                 Batch(
                     UIC(APP_STATE, UIKeys.HAS_CREDENTIALS, !!creds),
                     UIC(APP_STATE, UIKeys.CREDENTIALS, creds)
                 )
             );
         }
     }`;
		case DataChainFunctionKeys.HasPreviousCredentials:
			return `() => {
        let getState = GetState();
        if(getState) {
          return GetC(getState(), APP_STATE, UIKeys.HAS_CREDENTIALS);
        }

        return false;
      }`;
		case DataChainFunctionKeys.LoadUserCredentialsFromLocalStore:
			return `(a${anyType}) => {

        $service.loadCredentials((credentials: any) => {
          DC.${func}(credentials)
        });

        return a;
     }`;
		case DataChainFunctionKeys.Equals:
			return `(a${anyType}, b${anyType}) => a === b`;
		case DataChainFunctionKeys.Required:
			return `(a${anyType}) => a !== null && a !== undefined`;
		case DataChainFunctionKeys.Not:
			return `(a${anyType}) => !!!a`;
		case DataChainFunctionKeys.GetModelIds:
			return `(a${anyType}) => {
    if(a && a.map) {
        return a.map((item: any) => item.id);
    }
    else {
        console.warn('"a" parameter was not an array');
    }
}`;
		case DataChainFunctionKeys.SaveModelArrayToState:
			return `(a${anyType}) => { let dispatch = GetDispatch(); dispatch(UIModels(Models.${GetCodeName(
				model
			)}, a)); return a; }`;
		case DataChainFunctionKeys.SaveModelIdsToState:
			return `(a${anyType}) => { let dispatch = GetDispatch(); dispatch(UIC('Data', StateKeys.${GetCodeName(
				stateKey
			)}, a)); return a; }`;
		case DataChainFunctionKeys.GetStateKeyValue:
			return `(a${anyType}) =>  {
        let stateFunc = GetState();
        return GetC(stateFunc(),'Data', StateKeys.${GetCodeName(stateKey)})}`;
		case DataChainFunctionKeys.StateKey:
			return `(a${anyType}) => StateKeys.${GetCodeName(stateKey)}`;
		case DataChainFunctionKeys.ModelKey:
			return `(a${anyType}) => ModelKeys.${GetCodeName(modelKey)}`;
		case DataChainFunctionKeys.ViewModelKey:
			return `(a${anyType}) => ViewModelKeys.${GetCodeName(viewModelKey)}`;
		case DataChainFunctionKeys.Selector:
			return `(a${anyType}) => a ? a.${selectorProp} : undefined`;
		case DataChainFunctionKeys.Models:
			return `(a${anyType}) => GetItems(Models.${GetCodeName(model)})`;
		case DataChainFunctionKeys.Validation:
			return `(a${anyType}) => true/*TBI*/`;
		case DataChainFunctionKeys.MethodBaseValidation:
			if (methodMethod) {
				return buildValidation({ methodMethod, id });
			}
			return `(a${anyType}) => false`;
		case DataChainFunctionKeys.ModelMethodMenu:
			return buildModelMethodMenu(options);
		case DataChainFunctionKeys.NavigationMethodMenu:
			return `() => GetMenuSource({ getState: GetState(), dispatch: GetDispatch() })`;
		default:
			throw new Error(`${GetNodeTitle(node)} ${node.id} - ${functionType} is not a defined function type.`);
	}
}

function buildModelMethodMenu(options: { language: any }) {
	const { language } = options;
	let anyType: string = ': any';
	if (language === NodeConstants.UITypes.ReactNative) {
		anyType = '';
	}
	const listPages = NodesByType(null, NodeTypes.Screen).filter(
		(x: any) => GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.GetAll
	);
	const underPages = NodesByType(null, NodeTypes.Screen).filter((x: any) =>
		[ViewTypes.Create, ViewTypes.GetAll].some((v) => v === GetNodeProp(x, NodeProperties.ViewType))
	);

	const screens = listPages.map((v: any) => `{ title: '${GetNodeTitle(v)}', name: 'top-${GetCodeName(v)}' }`);
	const subscreens = underPages.map((v: any) => {
		const tpage = listPages.find(
			(vt: any) => GetNodeProp(vt, NodeProperties.Model) === GetNodeProp(v, NodeProperties.Model)
		);
		const temp = `{title: '${GetNodeTitle(v)}',  name: '${GetCodeName(v)}', parent: 'top-${GetCodeName(tpage)}' }`;
		return temp;
	});

	return ` () => {
    let toppages = [${screens.join()}].map((v${anyType}) => ({ id: \`\${v.name}\` , title: titleService.get(v.title || v.name), parent: null }));
    let underpages = [${subscreens.join()}].filter((v${anyType}) =>v && routes[v.name] && routes[v.name].indexOf(':') === -1).map(v => ({ id: \`\${v.name}\` , title: titleService.get(v.title || v.name), parent: v.parent }));
    return [...toppages, ...underpages]
}`;
}
export function untransformLambda(value: string, currentNode: any): string {
	if (currentNode) {
		const models: _.Node[] = NodesByType(null, [NodeTypes.Model, NodeTypes.Enumeration])
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
		models.sort((a, b) => GetCodeName(a).length - GetCodeName(b).length).forEach((item) => {
			var regex = new RegExp(`${GetLambdaVariableTitle(item, true)}`, 'g');
			value = value.replace(regex, GetCodeName(item));
		});
	}
	return value;
}
export function GetPermissionsSortedByAgent() {
	return GetNodesSortedByAgent(NodeTypes.Permission);
}

export function GetValidationsSortedByAgent() {
	return GetNodesSortedByAgent(NodeTypes.Validator);
}

export function GetNodesSortedByAgent(type: string) {
	const state = _getState();
	const nodes = NodesByType(state, type);

	return nodes
		.filter((node: { id: any }) => {
			const methodNode = GraphMethods.GetMethodNode(state, node.id);
			return methodNode;
		})
		.groupBy((node: { id: any }) => {
			const methodNode = GraphMethods.GetMethodNode(state, node.id);
			return GetMethodNodeProp(methodNode, FunctionTemplateKeys.Agent);
		});
}

export function GetArbitersForNodeType(type: string) {
	const state = _getState();
	const permissions = NodesByType(state, type);
	const models: any[] = [];
	permissions.map((permission: { id: any }) => {
		const methodNode = GraphMethods.GetMethodNode(state, permission.id);
		const methodProps = GetMethodProps(methodNode);
		Object.values(methodProps).map((id: any) => {
			const node = GetGraphNode(id);
			const nodeType = GetNodeProp(node, NodeProperties.NODEType);
			if ([NodeTypes.Model].some((v) => v === nodeType)) {
				models.push(id);
			}
		});
	});
	return models.unique();
}

export function GetCustomServicesForNodeType(type: any) {
	const state = _getState();
	const permissions = NodesByType(state, type);
	const models: any[] = [];
	permissions.map((permission: { id: any }) => {
		const methods = GetServiceInterfaceMethodCalls(permission.id);
		methods.map((method: { id: any }) => {
			const services = GetServiceInterfaceCalls(method.id);
			models.push(...services.map((v: { id: any }) => v.id));
		});
	});
	return models.unique();
}

export function GetAgentNodes() {
	return GetNodesByProperties({
		[NodeProperties.NODEType]: NodeTypes.Model,
		[NodeProperties.IsAgent]: (v: string | boolean) => v === 'true' || v === true
	});
	// return NodesByType(_getState(), NodeTypes.Model).filter(x =>
	//   GetNodeProp(x, NodeProperties.IsAgent)
	// );
}
export function GetUsers() {
	return GetNodesByProperties({
		[NodeProperties.NODEType]: NodeTypes.Model,
		[NodeProperties.IsUser]: (v: string | boolean) => v === 'true' || v === true
	});
	// return NodesByType(_getState(), NodeTypes.Model).filter(x =>
	//   GetNodeProp(x, NodeProperties.IsUser)
	// );
}
export function GetArbitersForPermissions() {
	return GetArbitersForNodeType(NodeTypes.Permission);
}

export function GetArbitersForValidations() {
	return GetArbitersForNodeType(NodeTypes.Validator);
}

export function GetNameSpace() {
	const state = _getState();

	const graphRoot = GetRootGraph(state);

	const namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

	return namespace;
}

export function GetArbiterPropertyDefinitions(tabs = 3) {
	const arbiters = GetArbitersForPermissions();
	const template = `IRedArbiter<{{model}}> arbiter{{model}};`;
	const tab = [].interpolate(0, tabs, () => `   `).join('');
	const definitions = arbiters.map(
		(arbiter: any) =>
			tab +
			bindTemplate(template, {
				model: GetCodeName(arbiter)
			})
	);
	return definitions.join(NodeConstants.NEW_LINE);
}

export function getDataChainNameSpace(dataChain: any, asFilePath?: boolean) {
	let dcnamespace = '';
	let dataChainNameSpace: string[] | null = GetNodeProp(dataChain, NodeProperties.DataChainNameSpace);
	if (dataChainNameSpace) {
		if (asFilePath) {
			return path.join(
				...dataChainNameSpace
					.map((v) => {
						let temp = GetCodeName(v);
						if (temp !== Titles.Unknown && temp) {
							if (GetNodeById(v)) {
								return `${temp}NS`
							}
							return temp;
						}
						return v;
					})
					.filter((v) => v)
			);
		}
		dcnamespace = `${dataChainNameSpace
			.map((v) => {
				let temp = GetCodeName(v);
				if (temp !== Titles.Unknown && temp) {
					if (GetNodeById(v)) {
						return `${temp}NS`
					}
					return temp;
				}
				return v;
			})
			.filter((v) => v)
			.join('.')}`;
	}
	return dcnamespace;
}
export function GetCustomServiceDefinitions(type: string, tabs = 3) {
	const services = GetCustomServicesForNodeType(type);
	const template = `I{{model}} {{model_js}};`;
	const tab = [].interpolate(0, tabs, () => `   `).join('');
	const definitions = services.map(
		(service: any) =>
			tab +
			bindTemplate(template, {
				model: GetCodeName(service),
				model_js: GetJSCodeName(service)
			})
	);
	return definitions.join(NodeConstants.NEW_LINE);
}

export function GetArbiterPropertyImplementations(tabs = 4) {
	const arbiters = GetArbitersForPermissions();
	const template = `arbiter{{model}} = RedStrapper.Resolve<IRedArbiter<{{model}}>>();`;
	const tab = [].interpolate(0, tabs, () => `   `).join('');
	const definitions = arbiters.map(
		(arbiter: any) =>
			tab +
			bindTemplate(template, {
				model: GetCodeName(arbiter)
			})
	);
	return definitions.join(NodeConstants.NEW_LINE);
}

export function GetCustomServiceImplementations(type: string, tabs = 4) {
	const services = GetCustomServicesForNodeType(type);
	const template = `{{model_js}} = RedStrapper.Resolve<I{{model}}>();`;
	const tab = [].interpolate(0, tabs, () => `   `).join('');
	const definitions = services.map(
		(service: any) =>
			tab +
			bindTemplate(template, {
				model: GetCodeName(service),
				model_js: GetJSCodeName(service)
			})
	);
	return definitions.join(NodeConstants.NEW_LINE);
}

export function GetCombinedCondition(id: any, language = NodeConstants.ProgrammingLanguages.CSHARP, options: any = {}) {
	const node = GetGraphNode(id);
	let conditions = [];
	let customMethods = [];
	let finalResult = 'res';
	let tabcount = 0;
	let methodNodeParameters: any = null;
	let ft = null;
	let methodNode = null;
	switch (GetNodeProp(node, NodeProperties.NODEType)) {
		case NodeTypes.Permission:
			conditions = GetPermissionsConditions(id);
			customMethods = GetServiceInterfaceMethodCalls(id);
			methodNode = GetPermissionMethod(node);
			ft = MethodFunctions[GetNodeProp(methodNode, NodeProperties.FunctionType)];
			if (ft && ft.permission && ft.permission.params) {
				methodNodeParameters = ft.permission.params.map(
					(t: { key: any }) => (typeof t === 'string' ? t : t.key)
				);
			}
			finalResult = 'result';
			tabcount = 3;
			break;
		case NodeTypes.ModelItemFilter:
			conditions = GetModelItemConditions(id);
			break;
		case NodeTypes.Validator:
			conditions = GetValidationsConditions(id);
			methodNode = GetNodesMethod(id);
			if (!methodNode) {
				methodNode = GraphMethods.GetNodeLinkedTo(null, {
					id,
					link: NodeConstants.LinkType.Validator
				});
			}
			ft = MethodFunctions[GetNodeProp(methodNode, NodeProperties.FunctionType)];
			if (ft && ft.validation && ft.validation.params) {
				methodNodeParameters = ft.validation.params.map(
					(t: { key: any }) => (typeof t === 'string' ? t : t.key)
				);
			}
			tabcount = 3;
			finalResult = 'result';
			break;
		default:
			break;
	}
	const tabs = [].interpolate(0, tabcount, () => `    `).join('');
	let clauses: any[] = [];
	conditions.map((condition: any) => {
		const selectedConditionSetup = GetSelectedConditionSetup(id, condition);
		const res = GetConditionsClauses(id, selectedConditionSetup, language, options);
		clauses = [...clauses, ...res.map((t) => t.clause)];
	});
	customMethods.map((customMethod: any) => {
		const res = GetCustomMethodClauses(customMethod, methodNodeParameters, language);
		clauses = [...clauses, ...res.map((t) => t.clause)];
	});

	switch (GetNodeProp(node, NodeProperties.NODEType)) {
		case NodeTypes.Validator:
			let validationDataChains = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
				id: id,
				componentType: NodeTypes.ValidationDataChain
			});

			validationDataChains.forEach((validationDataChain: _.Node, index: number) => {
				let dataChain = GraphMethods.GetNodeLinkedTo(GetCurrentGraph(), {
					id: validationDataChain.id,
					componentType: NodeTypes.DataChain
				});
				let validationParameters = GetMethodValidationParameters(id, false);
				if (!validationParameters) {
					throw new Error('missing permission parameters: GetCombinedCondition');
				}
				if (language === NodeConstants.ProgrammingLanguages.CSHARP) {
					let namespace = getDataChainNameSpace(dataChain);
					let ns = `${GetNameSpace()}${NodeConstants.NameSpace.Controllers}.${getDataChainNameSpace(
						dataChain
					)}`
						.split('.')
						.filter((v) => v)
						.join('.');
					clauses.push(
						`var {{result}} = await ${namespace ? `${ns}.` : ''}${GetCodeName(
							dataChain
						)}.Execute(${validationParameters
							.map((v: any) => {
								// return `${v.paramName}: ${v.value}`;
								if (v && v.value && v.value.key) {
									return v.value.key;
								}
								return `${v.value}: ${v.value}`;
							})
							.join()});`
					);
				}
			});
			break;
		case NodeTypes.Permission:
			let permissionDataChains = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
				id: id,
				componentType: NodeTypes.PermissionDataChain
			});

			permissionDataChains.forEach((permissionDataChain: _.Node, index: number) => {
				let dataChain = GraphMethods.GetNodeLinkedTo(GetCurrentGraph(), {
					id: permissionDataChain.id,
					componentType: NodeTypes.DataChain
				});
				let permissionParameters = GetMethodPermissionParameters(id, false);
				if (!permissionParameters) {
					throw new Error('missing permission parameters: GetCombinedCondition');
				}
				let namespace = getDataChainNameSpace(dataChain);
				let ns = `${GetNameSpace()}${NodeConstants.NameSpace.Controllers}.${getDataChainNameSpace(dataChain)}`
					.split('.')
					.filter((v) => v)
					.join('.');
				clauses.push(
					`var {{result}} = await  ${namespace ? `${ns}.` : ''}${GetCodeName(
						dataChain
					)}.Execute(${permissionParameters
						.map((v: any) => {
							// return `${v.paramName}: ${v.value}`;
							return `${v.value}: ${v.value}`;
						})
						.join()});`
				);
			});
			break;
	}
	const finalClause = clauses.map((_, index) => `res_` + index).join(' && ') || 'true';
	if (options.finalResult) {
		finalResult = options.finalResult;
	}
	clauses.push(`${finalResult} = ${finalClause};`);
	return clauses
		.map(
			(clause, index) =>
				tabs +
				bindTemplate(clause, {
					result: `res_${index}`
				})
		)
		.join(NodeConstants.NEW_LINE);
}

export function GetCustomMethodClauses(customMethod: { id: any }, methodNodeParameters: any[], language: string) {
	const result = [];

	if (methodNodeParameters) {
		const serviceInterface = GetServiceInterfaceCalls(customMethod.id).find((x: any) => x);

		if (serviceInterface) {
			switch (language) {
				case NodeConstants.UITypes.ElectronIO:
				case NodeConstants.UITypes.ReactWeb:
					break;
				default:
					result.push({
						clause: `var {{result}} = await ${GetJSCodeName(serviceInterface)}.${GetCodeName(
							customMethod
						)}(${methodNodeParameters.join()});`
					});
					break;
			}
		}
	}
	return result;
}
export function GetConditionsClauses(
	adjacentId: any,
	clauseSetup: { [x: string]: { properties: any } },
	language: string,
	options: any = {}
) {
	const result: { clause: any; id: string }[] = [];
	if (clauseSetup) {
		Object.keys(clauseSetup).map((clauseKey) => {
			const { properties } = clauseSetup[clauseKey];
			if (properties) {
				Object.keys(properties)
					.filter((modelId) => {
						if (options && options.filter && options.filter.property) {
							return options.filter.property === modelId;
						}
						return true;
					})
					.map((modelId) => {
						const propertyName = GetCodeName(modelId);
						const { validators } = properties[modelId];
						if (validators) {
							Object.keys(validators).map((validatorId) => {
								const validator = validators[validatorId];
								const res = GetConditionClause(
									adjacentId,
									clauseKey,
									propertyName,
									validator,
									language //,
									// options
								);
								result.push({
									clause: res,
									id: validatorId
								});
							});
						}
					});
			}
		});
	}
	return result;
}
export function safeFormatTemplateProperty(str: string) {
	return str.split('-').join('_');
}
export function GetConditionClause(
	adjacentId: any,
	clauseKey: string,
	propertyName: string,
	validator: {
		condition?: any;
		type?: any;
		template?: any;
		templatejs?: any;
		node?: any;
		nodeProperty?: any;
		many2manyProperty?: any;
		many2many?: any;
		many2manyMethod?: any;
	},
	language?: any
) {
	const method = GetNodesMethod(adjacentId);
	const clauseKeyNodeId = GetMethodNodeProp(method, clauseKey);
	let { type, template, templatejs, node, nodeProperty, many2manyProperty, many2many, many2manyMethod } = validator;
	const nodeNodeId = GetMethodNodeProp(method, node);
	let conditionTemplate = '';
	let properties = {};
	if (NodeConstants.FilterUI && NodeConstants.FilterUI[type] && NodeConstants.FilterUI[type].template && !template) {
		template = NodeConstants.FilterUI[type].template;
	}
	if (
		NodeConstants.FilterUI &&
		NodeConstants.FilterUI[type] &&
		NodeConstants.FilterUI[type].templatejs &&
		!templatejs
	) {
		templatejs = NodeConstants.FilterUI[type].templatejs;
	}
	let isjavascript = false;
	if (template) {
		switch (language) {
			case NodeConstants.ProgrammingLanguages.JavaScript:
				conditionTemplate = fs.readFileSync(templatejs, 'utf8');
				isjavascript = true;
				break;
			default:
				conditionTemplate = fs.readFileSync(template, 'utf8');
				break;
		}
	} else {
		throw 'no template found: ' + type;
	}
	if (clauseKey === 'change_parameter') {
		clauseKey = clauseKey + '.Data';
	}
	switch (type) {
		case NodeConstants.FilterRules.IsInModelPropertyCollection:
		case NodeConstants.FilterRules.EqualsModelProperty:
		case NodeConstants.FilterRules.EqualsFalse:
		case NodeConstants.FilterRules.EqualsTrue:
		case NodeConstants.FilterRules.EqualsParent:
		case NodeConstants.FilterRules.IsNotInModelPropertyCollection:
			properties = {
				agent: safeFormatTemplateProperty(clauseKey),
				agent_property: isjavascript
					? safeFormatTemplateProperty(propertyName).toJavascriptName()
					: safeFormatTemplateProperty(propertyName),
				model: node,
				model_property: isjavascript ? GetJSCodeName(nodeProperty) : GetCodeName(nodeProperty)
			};
			break;
		case NodeConstants.FilterRules.Many2ManyPropertyIsTrue:
			properties = {
				agent: safeFormatTemplateProperty(clauseKey),
				agent_property: isjavascript
					? safeFormatTemplateProperty(propertyName).toJavascriptName()
					: safeFormatTemplateProperty(propertyName),
				agent_type: GetCodeName(clauseKeyNodeId) || 'agent_type missing',
				model_type: GetCodeName(nodeNodeId) || 'model_type missing',
				model: node,
				model_property: GetCodeName(nodeProperty),
				connection_type: GetCodeName(many2many),
				connection_is_true: GetConnectionClause({
					many2manyProperty,
					many2manyMethod
				}) //
			};
			break;
		case NodeConstants.ValidationRules.OneOf:
			const listItems = GenerateConstantList(validator);
			properties = {
				agent: safeFormatTemplateProperty(clauseKey),
				agent_property: isjavascript
					? safeFormatTemplateProperty(propertyName).toJavascriptName()
					: safeFormatTemplateProperty(propertyName),
				agent_type: GetCodeName(clauseKeyNodeId) || 'agent_type missing',
				list: listItems
			};
			break;
		case NodeConstants.ValidationRules.AlphaOnlyWithSpaces:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'AlphaOnlyWithSpacesAttribute'
			};
			break;
		case NodeConstants.ValidationRules.AlphaNumericLike:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'AlphaNumericLikeAttribute'
			};
			break;
		case NodeConstants.ValidationRules.NumericInt:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'NumericIntAttribute'
			};
			break;
		case NodeConstants.ValidationRules.AlphaNumeric:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'AlphaNumericAttribute'
			};
			break;
		case NodeConstants.ValidationRules.AlphaOnly:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'AlphaOnlyAttribute'
			};
			break;
		case NodeConstants.ValidationRules.MaxLength:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: `${validator ? validator.condition : null}`,
				validation_Func_name: 'MaxLengthAttribute'
			};
			break;
		case NodeConstants.ValidationRules.MaxLengthEqual:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: `${validator ? validator.condition : null}, true`,
				validation_Func_name: 'MaxLengthAttribute'
			};
			break;
		case NodeConstants.ValidationRules.MinLength:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: validator ? validator.condition : null,
				validation_Func_name: 'MinLengthAttribute'
			};
			break;
		case NodeConstants.ValidationRules.MinLengthEqual:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: `${validator ? validator.condition : null}, true`,
				validation_Func_name: 'MinLengthAttribute'
			};
			break;

		case NodeConstants.ValidationRules.MaxValue:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: `${validator ? validator.condition : null}`,
				validation_Func_name: 'MaxAttribute'
			};
			break;
		case NodeConstants.ValidationRules.MaxValueEqual:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: `${validator ? validator.condition : null}, true`,
				validation_Func_name: 'MaxAttribute'
			};
			break;
		case NodeConstants.ValidationRules.MinValue:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: validator ? validator.condition : null,
				validation_Func_name: 'MinAttribute'
			};
			break;
		case NodeConstants.ValidationRules.MinValueEqual:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: `${validator ? validator.condition : null}, true`,
				validation_Func_name: 'MinAttribute'
			};
			break;
		case NodeConstants.ValidationRules.IsNull:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: ``,
				validation_Func_name: 'IsNullAttribute'
			};
			break;
		case NodeConstants.ValidationRules.IsNotNull:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				parameters: ``,
				validation_Func_name: 'IsNotNullAttribute'
			};
			break;
		case NodeConstants.ValidationRules.Email:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'EmailAttribute'
			};
			break;
		case NodeConstants.ValidationRules.EmailEmpty:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'EmailEmptyAttribute'
			};
			break;
		case NodeConstants.ValidationRules.Zip:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'ZipAttribute'
			};
			break;
		case NodeConstants.ValidationRules.ZipEmpty:
			properties = {
				model: clauseKey,
				model_property: propertyName,
				validation_Func_name: 'ZipEmptyAttribute'
			};
			break;
		default:
			throw 'Unhandled condition clause case: ' + type;
	}

	return bindTemplate(conditionTemplate, {
		parameters: '',
		...properties
	});
}
function GenerateConstantList(validator: { node?: any; enumeration?: any }) {
	const node = GetGraphNode(validator.node);
	const { enumeration } = validator;
	switch (GetNodeProp(node, NodeProperties.NODEType)) {
		case NodeTypes.Enumeration:
			var enums = GetNodeProp(node, NodeProperties.Enumeration) || [];

			return enums
				.map((enum_: { id: any; value: any }) => {
					if (enumeration[enum_.id || enum_]) {
						return `${GetCodeName(validator.node)}.${NodeConstants.MakeConstant(enum_.value || enum_)}`;
					}
				})
				.filter((x: any) => x)
				.join(', ');
		default:
			throw 'not implemented capturing of enums';
	}
}
export function GetConnectionClause(args: { many2manyProperty: any; many2manyMethod: any }) {
	const { many2manyProperty, many2manyMethod } = args;
	switch (many2manyMethod) {
		case NodeConstants.FilterRules.EqualsTrue:
			return bindTemplate('_x => _x.{{connection_property}} == {{connection_value}}', {
				connection_property: GetCodeName(many2manyProperty),
				connection_value: true
			});
		case NodeConstants.FilterRules.EqualsFalse:
			return bindTemplate('_x => _x.{{connection_property}} == {{connection_value}}', {
				connection_property: GetCodeName(many2manyProperty),
				connection_value: false
			});
		default:
			throw 'unhandle get connection clause : ' + many2manyMethod;
	}
}

export function GetSelectedConditionSetup(permissionId: any, condition: any) {
	const method = GraphMethods.GetMethodNode(_getState(), permissionId);
	if (method) {
		const conditionSetup = GetConditionSetup(condition);
		if (conditionSetup && conditionSetup.methods) {
			return conditionSetup.methods[GetNodeProp(method, NodeProperties.FunctionType)];
		}
		// console.warn('condition is improperly formed');
	} else {
		// console.warn('no method node found');
	}
	return null;
}
export function _getPermissionsConditions(state: any, id: any) {
	return _getConditions(state, id);
}

export function _getValidationConditions(state: any, id: any) {
	return _getConditions(state, id);
}
export function _getConditions(state: any, id: any) {
	const graph = GetRootGraph(state);
	return GraphMethods.GetNodesLinkedTo(graph, {
		id
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Condition);
}

export function GetComponentNodes() {
	const state = GetState();
	return NodesByType(state, NodeTypes.ComponentNode);
}
export function GetComponentNodeProperties() {
	const res = GetComponentNodes()
		.map((node: any) => {
			const componentProperties = GetNodeProp(node, NodeProperties.ComponentProperties);
			const componentPropertiesList = GraphMethods.getComponentPropertyList(componentProperties) || [];

			return { id: node.id, componentPropertiesList };
		})
		.filter((x: { componentPropertiesList: string | any[] }) => x.componentPropertiesList.length)
		.groupBy((x: { id: any }) => x.id);

	const result: { id: string; componentPropertiesList: any[] }[] = [];
	Object.keys(res).map((v) => {
		const componentPropertiesList: any[] = [];
		res[v]
			.map((b: { componentPropertiesList: any }) => componentPropertiesList.push(...b.componentPropertiesList))
			.unique((x: { id: any }) => x.id);

		result.push({ id: v, componentPropertiesList });
	});

	return result;
}
export function GetConnectedScreenOptions(id: string) {
	const state = _getState();
	const graph = GetRootGraph(state);
	return GraphMethods.GetNodesLinkedTo(graph, {
		id
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption);
}
export function attachToNavigateNode(currentId: any, action: any) {
	return (dispatch: any, getState: any) => {
		graphOperation(_attachToNavigateNode(currentId, action))(dispatch, getState);
	};
}

export function _attachToNavigateNode(currentId: any, action: any) {
	return [
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.NavigationAction,
					linkProperties: {
						properties: {
							...LinkProperties.NavigationMethod
						}
					},
					parent: currentId,
					properties: {
						[NodeProperties.UIText]: action,
						[NodeProperties.NavigationAction]: action
					}
				};
			}
		}
	];
}
export function GetConnectedScreen(id: any) {
	const state = _getState();
	const graph = GetRootGraph(state);
	return GraphMethods.GetNodesLinkedTo(graph, {
		id
	}).find((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Screen);
}
export function GetModelPropertyNodes(refId: any): _.Node[] {
	const state = _getState();
	return GraphMethods.GetLinkChain(state, {
		id: refId,
		links: [
			{
				type: NodeConstants.LinkType.PropertyLink,
				direction: GraphMethods.SOURCE
			}
		]
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Property);
}

export function getTopComponent(graph: any, node: { id: any }): any {
	const parent = GraphMethods.GetNodesLinkedTo(graph, {
		id: node.id,
		link: NodeConstants.LinkType.Component
		//	direction: GraphMethods.TARGET
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode)[0];

	if (parent) {
		return getTopComponent(graph, parent);
	}
	return node;
}
export function GetParentComponent(node: any, graph: any) {
	graph = graph || GetCurrentGraph();
	const parent = GraphMethods.GetNodesLinkedTo(graph, {
		id: node.id,
		link: NodeConstants.LinkType.Component,
		direction: GraphMethods.TARGET
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode)[0];
	return parent;
}
export function ComponentIsViewType(component: any, viewType: string, graph: any): any {
	graph = graph || GetCurrentGraph();
	const currentType = GetNodeProp(component, NodeProperties.ViewType);
	if (currentType === viewType) {
		return true;
	}
	if (currentType) {
		return false;
	}
	const parent = GetParentComponent(component, graph);
	if (parent) {
		return ComponentIsViewType(parent, viewType, graph);
	}

	return false;
}
export function GetUserReferenceNodes(refId: any) {
	const state = _getState();
	return GraphMethods.GetLinkChain(state, {
		id: refId,
		links: [
			{
				type: NodeConstants.LinkType.UserLink,
				direction: GraphMethods.TARGET
			}
		]
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Model);
}

export function GetLogicalChildren(id: string) {
	const currentNode = GraphMethods.GetNode(GetCurrentGraph(GetState()), id);
	const hasLogicalChildren = GetNodeProp(currentNode, NodeProperties.HasLogicalChildren);
	if (hasLogicalChildren) {
		return (GetNodeProp(currentNode, NodeProperties.LogicalChildrenTypes) || [])
			.map((t: string) => {
				const node = GraphMethods.GetNode(GetCurrentGraph(_getState()), t);
				return node;
			})
			.filter((x: any) => x);
	}
	return [];
}

export function GetMethodNodeSelectOptions(methodProps: { [x: string]: any }) {
	return Object.keys(methodProps).map((val) => ({
		value: val,
		title: `${GetCodeName(methodProps[val])} (${val})`
	}));
}
export function GetNodeCode(graph: any, id: string) {
	return GetCodeName(GraphMethods.GetNode(graph, id));
}

export function GetMethodPropNode(graph: any, node: any, key: string) {
	const methodProps = GetNodeProp(node, NodeProperties.MethodProps);
	if (methodProps) {
		return GraphMethods.GetNode(graph, methodProps[key] || null);
	}
	return null;
}

export function GetMethodOptions(methodProps: { [x: string]: string }) {
	if (!methodProps) {
		return [];
	}
	const state = _getState();
	return Object.keys(methodProps).map((t) => {
		const n = GraphMethods.GetNode(GetRootGraph(state), methodProps[t]);
		return {
			title: `${GetCodeName(n)} (${t})`,
			value: t
		};
	});
}

export function GetLinkProperty(link: GraphLink, prop: any) {
	return link && link.properties && link.properties[prop];
}
export function HasLinkProperty(link: GraphLink, prop: any) {
	return link && link.properties && link.properties.hasOwnProperty(prop);
}
export function GetLink(linkId: any) {
	const graph = GetCurrentGraph();

	return GraphMethods.getLink(graph, {
		id: linkId
	});
}

export function GetGroupProperty(group: { properties: { [x: string]: any } }, prop: string) {
	return group && group.properties && group.properties[prop];
}

export function VisualEq(state: any, key: string | null, value: string) {
	return Visual(state, key) === value;
}

export function Node(state: any, nodeId: string): any | null {
	const currentGraph = GetCurrentGraph(state);
	if (currentGraph && currentGraph.nodeLib) {
		return currentGraph.nodeLib[nodeId];
	}
	return null;
}

export function ModelNotConnectedToFunction(
	agentId: any,
	modelId: any,
	packageType: string,
	nodeType = NodeTypes.Method
) {
	const connections = GetNodesByProperties({
		[NodeProperties.NODEType]: nodeType,
		[NodeProperties.NodePackage]: modelId,
		[NodeProperties.NodePackageType]: packageType,
		[NodeProperties.NodePackageAgent]: agentId
	}).length;

	// const connections = NodesByType(_getState(), nodeType).filter(x => {
	//   const match =
	//     GetNodeProp(x, NodeProperties.NodePackage) === modelId &&
	//     GetNodeProp(x, NodeProperties.NodePackageType) === packageType &&
	//     GetNodeProp(x, NodeProperties.NodePackageAgent) === agentId;
	//   return match;
	// }).length;

	return !connections;
}
export function Application(state: any, key: string) {
	return GetC(state, APPLICATION, key);
}
export function GetVisualGraph(state: any) {
	const currentGraph = GetCurrentGraph(state);
	return currentGraph ? GetC(state, VISUAL_GRAPH, currentGraph.id) : null;
}
export function SaveApplication(value: string, key: string, dispatch: Function) {
	dispatch(UIC(APPLICATION, key, value));
}
export function Graphs(state: any, key: any) {
	return GetC(state, GRAPHS, key);
}

export function SaveGraph(graph: any, dispatch: Function, clearPinned: boolean = false) {
	graph.updated = Date.now();
	let visualGraph = GetC(GetState(), VISUAL_GRAPH, graph.id);
	if (!visualGraph) {
		dispatch(UIC(VISUAL_GRAPH, graph.id, GraphMethods.createGraph()));
	}

	if (!GraphMethods.Paused()) {
		dispatch(UIC(GRAPHS, graph.id, graph));
	}
}

export function UIC(section: string, item: string, value: any) {
	return {
		type: UI_UPDATE,
		item,
		value,
		section
	};
}
export function Batch(batch: any) {
	return {
		type: BATCH,
		batch
	};
}
export function toggleVisual(key: string) {
	return (dispatch: Function, getState: Function) => {
		const state = getState();
		dispatch(UIC(VISUAL, key, !GetC(state, VISUAL, key)));
	};
}

export function toggleMinimized(key: any) {
	return (dispatch: Function, getState: Function) => {
		const state = getState();
		dispatch(UIC(MINIMIZED, key, !GetC(state, MINIMIZED, key)));
	};
}

export function toggleHideByTypes(key: any) {
	return (dispatch: Function, getState: Function) => {
		const state = getState();
		const newvalue = !GetC(state, HIDDEN, key);
		dispatch(UIC(HIDDEN, key, newvalue));
		PerformGraphOperation(
			NodesByType(state, key).map((node: { id: any }) => ({
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.Pinned,
					id: node.id,
					value: newvalue
				}
			}))
		)(dispatch, getState);
	};
}
export function deleteByTypes(types: string[]) {
	return (dispatch: Function, getState: Function) => {
		const state = getState();
		let commands: any[] = [];
		types.forEach((key: string) => {
			commands.push(
				...NodesByType(state, key).map((node: { id: any }) => ({
					operation: REMOVE_NODE,
					options: {
						id: node.id
					}
				}))
			);
		});

		PerformGraphOperation(commands)(dispatch, getState);
	};
}
export function pin(ids: string[]) {
	return (dispatch: Function, getState: Function) => {
		PerformGraphOperation(
			ids.map((id: any) => ({
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.Pinned,
					id: id,
					value: true
				}
			}))
		)(dispatch, getState);
	};
}

export function GUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;

		const v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
export function SelectNode(nodeId: string, boundingBox: any) {
	return (dispatch: any) => {
		dispatch(
			Batch([
				UIC(VISUAL, SELECTED_NODE, nodeId),
				UIC(VISUAL, SELECTED_NODE_BB, boundingBox),
				UIC(VISUAL, SIDE_PANEL_OPEN, true)
			])
		);
	};
}

export const RED_QUICK_CONFIG = 'RED_QUICK_CONFIG';
export function loadRedQuickConfiguration() {
	return async (dispatch: Function, getState: Function) => {
		let userDir = getUserHome();
		if (userDir) {
			let redquickbuilder_folder = path.join(userDir, '.redquickbuilder');
			Promise.resolve().then(async () => {
				await ensureDirectory(redquickbuilder_folder);
				if (!fs.existsSync(redquickbuilder_folder)) {
					fs.writeFileSync(
						path.join(redquickbuilder_folder, 'config.json'),
						JSON.stringify(createRedQuickConfiguration()),
						'utf-8'
					);
				}
				let content = fs.readFileSync(path.join(redquickbuilder_folder, 'config.json'), 'utf-8');
				let config = JSON.parse(content);
				dispatch(Batch([UIC(VISUAL, RED_QUICK_CONFIG, config)]));
			});
		}
	};
}
export function createRedQuickConfiguration(): RedQuickConfiguration {
	return {
		commandCenters: []
	};
}
export function createCommandCenter(): CommandCenter {
	return {
		id: GUID(),
		commandCenterPort: '',
		commandCenterHost: ''
	};
}
export interface RedQuickConfiguration {
	commandCenters: CommandCenter[];
}
export function updateRedQuickConfiguration(config: RedQuickConfiguration) {
	return (dispatch: any, getState: any) => {
		let userDir = getUserHome();
		if (userDir) {
			let redquickbuilder_folder = path.join(userDir, '.redquickbuilder');
			Promise.resolve().then(async () => {
				await ensureDirectory(redquickbuilder_folder);
				if (fs.existsSync(redquickbuilder_folder)) {
					fs.writeFileSync(path.join(redquickbuilder_folder, 'config.json'), JSON.stringify(config), 'utf-8');
				}
				let content = fs.readFileSync(path.join(redquickbuilder_folder, 'config.json'), 'utf-8');
				config = JSON.parse(content);
				dispatch(Batch([UIC(VISUAL, RED_QUICK_CONFIG, config)]));
			});
		}
	};
}
export async function ensureDirectory(dir: any) {
	if (!fs.existsSync(dir)) {
		console.log(`doesnt exist : ${dir}`);
	} else {
	}
	const _dir_parts = dir.split(path.sep);
	_dir_parts.map((_: any, i: number) => {
		if (i > 1 || _dir_parts.length - 1 === i) {
			let tempDir = path.join(..._dir_parts.subset(0, i + 1));
			if (dir.startsWith(path.sep)) {
				tempDir = `${path.sep}${tempDir}`;
			}
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir);
			}
		}
	});
}
function getUserHome() {
	return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}
// Object Viewer
let history: any = null;
export function setHistory(_history: any) {
	history = _history;
}
export function setVisualNode(node: _.Node) {
	return (dispatch: Function, getState: Function) => {
		dispatch(UIC('NODE', node.id, node));
	};
}
export function setVisualLink(link: _.GraphLink) {
	return (dispatch: Function, getState: Function) => {
		dispatch(UIC('LINK', link.id, link));
	};
}
export const CURRENT_VIEW_NODE = 'CURRENT_VIEW_NODE';
export function setCurrentViewNode(nodeId: string) {
	return setVisual(CURRENT_VIEW_NODE, nodeId);
}

export const CURRENT_VIEW_LINK = 'CURRENT_VIEW_LINK';
export function setCurrentViewLink(linkId: string) {
	return setVisual(CURRENT_VIEW_LINK, linkId);
}

export const VIEW_CODE = 'VIEW_CODE';
export function handleCodeWindowMessage(args: { code: string }) {
	let { code } = args;
	if (history) {
		history.push(routes.CODE_VIEWER);
	}
	let batchCommands: any[] = [];
	batchCommands.push(UIC(VISUAL, VIEW_CODE, code));
	let dispatch = GetDispatchFunc();
	if (dispatch) {
		dispatch(Batch(batchCommands));
	}
}

export const FLOW_CODE_MODELS = 'FLOW_CODE_MODELS';
export const FLOW_CODE_ENUMERATION = 'FLOW_CODE_ENUMERATION';
export const FLOW_CODE = 'FLOW_CODE';
export const FLOW_CODE_FLOWS = 'FLOW_CODE_FLOWS';

export function handleFlowCodeMessage(args: { flowModels: any; code: string; models: any; enumerations: any }) {
	let { code, models, enumerations, flowModels } = args;
	if (history) {
		history.push(routes.FLOW_VIEWER);
	}
	let batchCommands: any[] = [];
	batchCommands.push(UIC(VISUAL, FLOW_CODE, code));
	if (flowModels) {
		batchCommands.push(UIC(VISUAL, FLOW_CODE_FLOWS, flowModels));
	}
	if (models) {
		batchCommands.push(UIC(VISUAL, FLOW_CODE_MODELS, models));
	}

	if (enumerations) {
		batchCommands.push(UIC(VISUAL, FLOW_CODE_ENUMERATION, enumerations));
	}

	let dispatch = GetDispatchFunc();
	if (dispatch) {
		dispatch(Batch(batchCommands));
	}
}
export const GRAPH_WINDOW_PACKAGE = 'GRAPH_WINDOW_PACKAGE';
export function handleGraphMessage(args: any) {
	let batchCommands: any[] = [];
	if (history) {
		history.push(routes.GRAPH_VIEWER);
	}
	if (args && args.graphWindowPackage) {
		batchCommands.push(UIC(VISUAL, GRAPH_WINDOW_PACKAGE, args.graphWindowPackage));
	}
	let dispatch = GetDispatchFunc();
	if (dispatch) {
		dispatch(Batch(batchCommands));
	}
}

export function handleViewWindowMessage(args: {
	nodes: _.Node[];
	links: _.GraphLink[];
	options?: {
		currentNode: string;
		currentLink: _.GraphLink;
		nodeLinkIds: GraphTypes.QuickAccess<string>;
		nodeConnections?: GraphTypes.QuickAccess<string>;
	};
	clear: boolean;
}) {
	let { nodes, links, clear, options } = args;
	if (history && history.length === 1) {
		history.push(routes.OBJECT_VIEWER);
	}
	let batchCommands: any[] = [];
	if (nodes) {
		nodes.forEach((node: _.Node) => {
			batchCommands.push(UIC(NODE, node.id, node));
		});
	}
	if (links) {
		links.forEach((link: _.GraphLink) => {
			batchCommands.push(UIC(LINK, link.id, link));
		});
	}
	if (options) {
		let { currentLink } = options;
		if (currentLink) {
			batchCommands.push(UIC(LINK, currentLink.id, currentLink));
			batchCommands.push(UIC(VISUAL, CURRENT_VIEW_LINK, currentLink.id));
		}
	}
	if (options) {
		let { currentNode, nodeLinkIds, nodeConnections } = options;
		batchCommands.push(UIC(VISUAL, CURRENT_VIEW_NODE, currentNode));
		if (nodeLinkIds && nodeLinkIds[currentNode]) {
			batchCommands.push(UIC(NODE_LINKS, currentNode, nodeLinkIds[currentNode]));
		}
		if (nodeConnections && nodeConnections[currentNode]) {
			batchCommands.push(UIC(NODE_CONNECTIONS, currentNode, nodeConnections[currentNode]));
		}
	}
	let dispatch = GetDispatchFunc();
	if (dispatch) {
		dispatch(Batch(batchCommands));
	}
}
export const NODE = 'NODE';
export const LINK = 'LINK';
export const NODE_LINKS = 'NODE_LINKS';
export const NODE_CONNECTIONS = 'NODE_CONNECTIONS';
//end Object Viewer
export function setVisual(key: string, value: any) {
	if (key === SELECTED_NODE || key === SELECTED_NODE_BB)
		if (GraphMethods.Paused()) {
			return () => { };
		}
	return (dispatch: Function, getState: Function) => {
		dispatch(UIC(VISUAL, key, value));
	};
}
export const COPY_CONTEXT = 'COPY_CONTEXT';
export interface CopyContext {
	name: string;
	model: string;
	agent: string;
	selected: boolean;
	ignoreAgent?: boolean;
	ignoreModel?: boolean;
	obj: any;
	type: CopyType;
	id: string;
}
export enum CopyType {
	SimpleValidation = 'SimpleValidation',
	ExecutionConfig = 'ExecutionConfig',
	ExecutionConfigs = 'ExecutionConfigs',
	SimpleValidations = 'SimpleValidations',
	PermissionConfigs = 'PermissionConfigs'
}
export function CopyToContext(
	obj: any,
	copyType: CopyType,
	model: string | undefined,
	agent: string | undefined,
	name?: string
) {
	let getState: Function = GetStateFunc();
	let dispatch: Function = GetDispatchFunc();
	if (model && agent && getState && dispatch) {
		addToCopyContext({
			id: GUID(),
			model,
			selected: false,
			agent,
			name: name || '',
			type: copyType,
			obj
		})(dispatch, getState);
		setVisual(COPY_CONTEXT_MENU, true)(dispatch, getState);
	}
}
export function GetSelectedCopyContext(
	copyType: CopyType,
	model: string | undefined,
	agent: string | undefined
): any[] {
	let getState: Function = GetStateFunc();
	let dispatch: Function = GetDispatchFunc();
	if (model && agent && getState && dispatch) {
		let copyContext: CopyContext[] = Visual(getState(), COPY_CONTEXT) || [];
		return copyContext
			.filter(
				(v) =>
					(v.agent === agent || v.ignoreAgent) && (v.model === model || v.ignoreModel) && v.type === copyType
			)
			.map((v) => {
				switch (copyType) {
					case CopyType.SimpleValidation:
						return {
							...v,
							obj: copySimpleValidation(v.obj)
						};
					case CopyType.ExecutionConfigs:
						return {
							...v,
							obj: v.obj.map((t: any) => copyExecutionConfig(t))
						};

					case CopyType.ExecutionConfig:
						return {
							...v,
							obj: copyExecutionConfig(v.obj)
						};
					case CopyType.SimpleValidations:
						return {
							...v,
							obj: v.obj.map((t: any) => copySimpleValidation(t))
						};
				}
				return null;
			})
			.filter((v: CopyContext | null) => {
				return !!v;
			})
			.filter((v) => v && v.selected);
	}
	return [];
}
export function copySimpleValidation(simpleValidation: SimpleValidationConfig): SimpleValidationConfig {
	let temp: any = {
		...JSON.parse(JSON.stringify(simpleValidation)),
		id: GUID()
	};

	for (var i in temp) {
		let configItem: ConfigItem = temp[i];
		if (configItem && configItem.id) configItem.id = GUID();
	}
	return temp;
}
export function copyExecutionConfig(executionConfig: ExecutionConfig): ExecutionConfig {
	let temp: any = {
		...JSON.parse(JSON.stringify(executionConfig)),
		id: GUID()
	};

	temp.dataChain = '';
	if (temp.dataChainOptions) {
		temp.dataChainOptions = JSON.parse(JSON.stringify(executionConfig.dataChainOptions));
	}
	if (temp.dataChainOptions)
		for (var i in temp.dataChainOptions) {
			let configItem: ConfigItem = temp.dataChainOptions[i];
			if (configItem && configItem.id) configItem.id = GUID();
		}

	return temp;
}
export function addToCopyContext(context: CopyContext) {
	return (dispatch: Function, getState: Function) => {
		let copyContext = Visual(getState(), COPY_CONTEXT) || [];
		copyContext.push(context);
		dispatch(UIC(VISUAL, COPY_CONTEXT, copyContext));
	};
}
export function removeFromCopyContext(id: string) {
	return (dispatch: Function, getState: Function) => {
		let copyContext: CopyContext[] = Visual(getState(), COPY_CONTEXT) || [];
		copyContext = copyContext.filter((v) => v.id !== id);
		dispatch(UIC(VISUAL, COPY_CONTEXT, copyContext));
	};
}
export function clearCopyContext() {
	return (dispatch: Function) => {
		let copyContext: CopyContext[] = [];
		dispatch(UIC(VISUAL, COPY_CONTEXT, copyContext));
	};
}
export function setApplication(key: any, value: any) {
	return (dispatch: Function, getState: Function) => {
		dispatch(UIC(APPLICATION, key, value));
	};
}
export const SELECTED_LINK = 'SELECTED_LINK';
export const HOVERED_LINK = 'HOVERED_LINK';
export const SELECTED_NODE = 'SELECTED_NODE';
export const CONTEXT_MENU_VISIBLE = 'CONTEXT_MENU_VISIBLE';
export const CONTEXT_MENU_MODE = 'CONTEXT_MENU_MODE';
export const ROUTING_CONTEXT_MENU = 'ROUTING_CONTEXT_MENU';
export const DASHBOARD_ROUTING_CONTEXT_MENU = 'DASHBOARD_ROUTING_CONTEXT_MENU';
export const DASHBOARD_SCREENEFFECT_CONTEXT_MENU = 'DASHBOARD_SCREENEFFECT_CONTEXT_MENU';
export const AGENT_SCREENEFFECT_CONTEXT_MENU = 'AGENT_SCREENEFFECT_CONTEXT_MENU';
export const MOUNTING_CONTEXT_MENU = 'MOUNTING_CONTEXT_MENU';
export const COPY_CONTEXT_MENU = 'COPY_CONTEXT_MENU';
export const DASHBOARD_MOUNTING_CONTEXT_MENU = 'DASHBOARD_MOUNTING_CONTEXT_MENU';
export const EFFECT_CONTEXT_MENU = 'EFFECT_CONTEXT_MENU';
export const DASHBOARD_EFFECT_CONTEXT_MENU = 'DASHBOARD_EFFECT_CONTEXT_MENU';
export function SelectedNode(nodeId: any) {
	return (dispatch: Function) => {
		if (!GraphMethods.Paused()) {
			dispatch(UIC(VISUAL, SELECTED_NODE, nodeId));
		}
	};
}
export function toggleDashboardMinMax() {
	return toggleVisual(DASHBOARD_MENU);
}
export function GetNodeTitle(node: any) {
	if (typeof node === 'string') {
		node = GraphMethods.GetNode(GetCurrentGraph(GetState()), node);
	}

	if (!node) {
		return Titles.Unknown;
	}
	return node.properties ? node.properties.text || node.id : node.id;
}
export function GetNodes(state: any) {
	const currentGraph = GetCurrentGraph(state);
	if (currentGraph) {
		return [...currentGraph.nodes.map((t: any) => currentGraph.nodeLib[t])];
	}
	return [];
}
export function CanChangeType(node: any) {
	const nodeType = GetNodeProp(node, NodeProperties.NODEType);
	switch (nodeType) {
		case NodeTypes.ReferenceNode:
			return false;
		default:
			return true;
	}
}
export function GetScreenNodes() {
	const state = _getState();
	return NodesByType(state, NodeTypes.Screen);
}

export function addComponentApiNodes(id: any, apiName: any) {
	return (dispatch: any, getState: any) => {
		graphOperation($addComponentApiNodes(id, apiName))(dispatch, getState);
	};
}
export function $addComponentApiNodes(
	parent: any,
	apiName: any = 'value',
	externalApiId: any = null,
	viewPackages: any = {},
	callback?: any
) {
	let componentInternalValue: any = null;
	let componentExternalValue: any = null;
	return [
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.ComponentApi,
					callback: (nn: { id: any }) => {
						componentInternalValue = nn.id;
					},
					linkProperties: {
						properties: {
							...LinkProperties.ComponentInternalApi
						}
					},
					parent,
					groupProperties: {},
					properties: {
						...viewPackages,
						[NodeProperties.UIText]: apiName,
						[NodeProperties.Pinned]: false,
						[NodeProperties.UseAsValue]: true
						// [NodeProperties.ComponentApiKey]: viewComponentType.internalApiNode || null
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.ComponentExternalApi,
					callback: (nn: { id: any }) => {
						componentExternalValue = nn.id;
						if (callback) {
							callback({ externalApi: componentExternalValue });
						}
					},
					parent,
					linkProperties: {
						properties: { ...LinkProperties.ComponentExternalApi }
					},
					groupProperties: {},
					properties: {
						...viewPackages,
						[NodeProperties.UIText]: apiName,
						[NodeProperties.Pinned]: false
						// [NodeProperties.ComponentApiKey]: viewComponentType.externalApiNode || null
					}
				};
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					source: componentInternalValue,
					target: componentExternalValue,
					properties: {
						...LinkProperties.ComponentInternalConnection
					}
				};
			}
		},
		externalApiId
			? {
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						target: externalApiId,
						source: componentExternalValue,
						properties: {
							...LinkProperties.ComponentExternalConnection
						}
					};
				}
			}
			: null
	].filter((x) => x);
}
export function GetScreenOptions() {
	const state = _getState();
	return NodesByType(state, NodeTypes.ScreenOption);
}
export function GetModelNodes() {
	return NodesByType(_getState(), NodeTypes.Model);
}
export function GetConfigurationNodes() {
	return NodesByType(_getState(), NodeTypes.Configuration);
}
export function GetMaestroNode(id: any) {
	const state = _getState();
	const graph = GetRootGraph(state);
	const nodes = GraphMethods.GetNodesLinkedTo(graph, {
		id
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Maestro);
	if (nodes && nodes.length) {
		return nodes[0];
	}
	return null;
}
export function GetControllerNode(id: any) {
	const state = _getState();
	const graph = GetRootGraph(state);
	const nodes = GraphMethods.GetNodesLinkedTo(graph, {
		id
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Controller);
	if (nodes && nodes.length) {
		return nodes[0];
	}
	return null;
}
export function HasCurrentGraph(options: any = {}) {
	const state = _getState();
	const currentGraph = options.useRoot ? GetRootGraph(state) : GetCurrentGraph(state);
	return !!currentGraph;
}

export function NodesByViewPackage(state: any, packageId: any) {
	state = state || GetState();
	const currentGraph = GetCurrentGraph(state);
	if (currentGraph) {
		return GraphMethods.NodesByViewPackage(currentGraph, packageId);
	}
	return [];
}

export function NodesByType(state: null, nodeType: string | any[], options: any = {}) {
	state = state || GetState();

	const currentGraph = options.useRoot ? GetRootGraph(state) : GetCurrentGraph(state);
	if (currentGraph) {
		if (!Array.isArray(nodeType)) {
			nodeType = [nodeType];
		}
		return GraphMethods.NodesByType(currentGraph, nodeType, options);
	}
	return [];
}
export function Setup() {
	return () => {
		$setupCache();
	};
}
function $setupCache() {
	const graph = GetCurrentGraph();
	GraphMethods.setupCache(graph);
}
export function GetNodeFromRoot(state: any, id: string) {
	const graph = GetRootGraph(state);
	if (graph) {
		return GraphMethods.GetNode(graph, id);
	}
	return null;
}

export function NodesConnectedTo(state: any, nodeId: string | number) {
	const currentGraph: any = GetCurrentGraph(state);
	if (currentGraph) {
		return (t: { id: string | number }) => {
			if (currentGraph.linkLib[t.id]) {
				return currentGraph.linkLib[t.id][nodeId];
			}
		};
	}
	return () => false;
}
let _getState: Function;
let _dispatch: Function;
export function GetState() {
	if (_getState) return _getState();
}
export function GetDispatchFunc() {
	return _dispatch;
}
export function GetStateFunc(): any {
	return _getState;
}
let testMode = false;
export function setTestGetState(func: Function) {
	testMode = true;
	_getState = func;
}
export function setTestDispatch(func: Function) {
	testMode = true;
	_dispatch = func;
}
export function setState() {
	return (dispatch: Function, getState: Function) => {
		if (!testMode) {
			_getState = getState;
			_dispatch = dispatch;
		}
	};
}

export const JOBS = 'JOBS';
export const JOB_FILES = 'JOB_FILES';
let runningGitRunPromise = false;
let gitrunPromise = Promise.resolve();
export function loadGitRuns() {
	return (dispatch: Function, getState: Function) => { };
}
// }
export const JOB_INFO = 'JOB_INFO';
export function updateJobs(info: { currentJobInformation: { jobFile?: JobFile }; agents: AgentProject[] }) {
	let state = GetStateFunc() ? GetStateFunc()() : null;
	if (VisualEq(state, 'PROGRESS_VIEW_TAB', 'Git Run')) {
		setVisual(JOB_INFO, info)(GetDispatchFunc(), GetStateFunc());
	}
}
export function JobProgressId(jobInstance: Job) {
	return `job-progress-id${jobInstance.name}`;
}
export function JobItemId(id: string) {
	return `jobitem-${id}`;
}
export function clearPinned() {
	const state = _getState();
	_dispatch(
		graphOperation(
			GetNodes(state).filter((x) => GetNodeProp(x, NodeProperties.Pinned)).map((node) => ({
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.Pinned,
					id: node.id,
					value: false
				}
			}))
		)
	);
}
export function clearMarked() {
	const state = _getState();
	_dispatch(
		graphOperation(
			GetNodes(state).filter((x) => GetNodeProp(x, NodeProperties.Selected)).map((node) => ({
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.Selected,
					id: node.id,
					value: false
				}
			}))
		)
	);
}

export function selectProperties(model: any) {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		graphOperation(
			GraphMethods.getPropertyNodes(GetRootGraph(state), model).map((t: any) => ({
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.Pinned,
					id: t.id,
					value: true
				}
			}))
		)(dispatch, getState);
	};
}
export function togglePinnedConnectedNodesByLinkType(model: any, linkType: any) {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		const graph = GetRootGraph(state);
		const nodes = GraphMethods.GetNodesLinkedTo(graph, {
			id: model,
			link: linkType
		});
		const pinned = nodes
			.filter((x: { id: any }) => x.id !== model)
			.some((v: any) => GetNodeProp(v, NodeProperties.Pinned));
		graphOperation(
			nodes.map((t: { id: any }) => ({
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.Pinned,
					id: t.id,
					value: !pinned
				}
			}))
		)(dispatch, getState);
	};
}
export function pinConnectedNodesByLinkType(model: any, linkType: any) {
	return (dispatch: any, getState: Function) => {
		const state = getState();
		const graph = GetRootGraph(state);
		const nodes: any[] = [];
		if (Array.isArray(linkType)) {
			linkType.forEach((_linkType: string) => {
				nodes.push(
					...GraphMethods.GetNodesLinkedTo(graph, {
						id: model,
						link: _linkType
					})
				);
			});
		} else {
			nodes.push(
				...GraphMethods.GetNodesLinkedTo(graph, {
					id: model,
					link: linkType
				})
			);
		}
		const pinned: string[] = [];
		pinned.push(...nodes.map((v: { id: any }) => v.id));
		graphOperation(
			nodes.map((t: { id: any }) => ({
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.Pinned,
					id: t.id,
					value: true
				}
			}))
		)(dispatch, getState);
		return pinned;
	};
}
export function getConnectedNodesByLinkType(model: any, linkType: any) {
	let getState = GetStateFunc();
	const state = getState();
	const graph = GetRootGraph(state);
	const nodes: any[] = [];
	if (Array.isArray(linkType)) {
		linkType.forEach((_linkType: string) => {
			nodes.push(
				...GraphMethods.GetNodesLinkedTo(graph, {
					id: model,
					link: _linkType
				})
			);
		});
	} else {
		nodes.push(
			...GraphMethods.GetNodesLinkedTo(graph, {
				id: model,
				link: linkType
			})
		);
	}
	const pinned: any[] = [];
	pinned.push(...nodes.map((v: { id: any }) => v));

	return pinned;
}
export function setPinned(id: string | string[], pinned: boolean = false) {
	if (!Array.isArray(id)) {
		id = [id];
	}
	if (id) {
		_dispatch(
			graphOperation(
				id.map((i) => {
					return {
						operation: CHANGE_NODE_PROPERTY,
						options: {
							prop: NodeProperties.Pinned,
							id: i,
							value: pinned
						}
					};
				})
			)
		);
	}
}
export function toggleNodeMark() {
	const state = _getState();
	const currentNode: _.Node = Node(state, Visual(state, SELECTED_NODE));
	_dispatch(
		graphOperation(CHANGE_NODE_PROPERTY, {
			prop: NodeProperties.Selected,
			id: currentNode.id,
			value: !GetNodeProp(currentNode, NodeProperties.Selected)
		})
	);
}
export function setInComponentMode() {
	_dispatch(UIC(MINIMIZED, NodeTypes.Selector, true));
	_dispatch(UIC(MINIMIZED, NodeTypes.ViewModel, true));
	_dispatch(UIC(MINIMIZED, NodeTypes.ViewType, true));
}
export function removeCurrentNode() {
	graphOperation(REMOVE_NODE, { id: Visual(_getState(), SELECTED_NODE) })(_dispatch, _getState);
}
export function removeNodeById(id: string) {
	graphOperation(REMOVE_NODE, { id })(_dispatch, _getState);
}
export function togglePinned() {
	const state = _getState();
	const currentNode: _.Node = Node(state, Visual(state, SELECTED_NODE));
	if (currentNode) {
		_dispatch(
			graphOperation(CHANGE_NODE_PROPERTY, {
				prop: NodeProperties.Pinned,
				id: currentNode.id,
				value: !GetNodeProp(currentNode, NodeProperties.Pinned)
			})
		);
	}
}
export function GetGraphNode(id: string) {
	const state = _getState();
	return GraphMethods.GetNode(GetRootGraph(state), id);
}
export function GetFunctionType(methodNode: any) {
	return GetNodeProp(methodNode, NodeProperties.FunctionType);
}
export function GetMethodNode(id: string) {
	return GraphMethods.GetMethodNode(_getState(), id);
}
export function GetMethodNodeProp(methodNode: any, key: string) {
	const methodProps = GetNodeProp(methodNode, NodeProperties.MethodProps) || {};
	if (typeof key === 'string') return methodProps[key];
	if (!key) return null;
	const { template } = key;
	const temp: any = {};
	Object.keys(methodProps).map((t) => {
		temp[t] = GetCodeName(methodProps[t]);
	});
	return bindTemplate(template, temp);
}
export function GetMethodProps(methodNode: any | null) {
	return GetNodeProp(methodNode, NodeProperties.MethodProps) || {};
}
export function GetMethodsProperties(id: any) {
	const state = _getState();
	const method = GraphMethods.GetMethodNode(state, id);
	const methodProps = GetMethodProps(method);
	return methodProps;
}
export function GetMethodsProperty(id: any, prop: string | number) {
	const methodProps = GetMethodsProperties(id);
	if (methodProps) {
		return methodProps[prop];
	}
	return null;
}
export function GetMethodFilterParameters(id: string, all?: boolean | undefined) {
	return GetMethod_Parameters(id, 'filter', all);
}
export function GetMethodFilterMetaParameters(id: any) {
	return GetMethod_MetaParameters(id, 'filter');
}
function GetMethod_MetaParameters(id: any, key: string) {
	const state = _getState();
	const method = GraphMethods.GetMethodNode(state, id);
	const methodProps = GetMethodProps(method);
	const methodType = GetNodeProp(method, NodeProperties.FunctionType);
	if (methodType) {
		const setup = MethodFunctions[methodType];
		if (setup && setup[key] && setup[key].params && methodProps) {
			return setup[key].params
				.filter((x: any) => typeof x === 'object' || x.metaparameter)
				.map((x: { key: any }) => {
					const _x = x.key;
					const nodeName = GetNodeTitle(methodProps[_x]);
					const nodeClass = GetCodeName(methodProps[_x]);
					return {
						title: nodeName,
						value: _x,
						paramClass: nodeClass,
						paramName: _x
					};
				});
		}
	}
	return [];
}
function GetMethod_Parameters(id: any, key: string, all: any) {
	const state = _getState();
	const method = GraphMethods.GetMethodNode(state, id);
	const methodProps = GetMethodProps(method);
	const methodType = GetNodeProp(method, NodeProperties.FunctionType);
	if (methodType) {
		const setup = MethodFunctions[methodType];
		if (setup && setup[key] && setup[key].params && methodProps) {
			return setup[key].params
				.filter((x: { metaparameter: any }) => all || typeof x === 'string' || !x.metaparameter)
				.map((x: { metaparameter: any }) => (!x.metaparameter ? x : x.metaparameter))
				.map((_x: string | number) => {
					const nodeName = GetNodeTitle(methodProps[_x]);
					const nodeClass = GetCodeName(methodProps[_x]);
					return {
						title: nodeName,
						value: _x,
						paramClass: nodeClass,
						paramName: _x
					};
				});
		}
	}
	return [];
}
export function GetMethodPermissionParameters(id: any, all: boolean) {
	return GetMethod_Parameters(id, 'permission', all);
}
export function GetMethodValidationParameters(id: any, all: boolean) {
	return GetMethod_Parameters(id, 'validation', all);
}
export function GetPermissionMethod(permission: { id: string } | null) {
	if (permission)
		return GetLinkChainItem({
			id: permission.id,
			links: [
				{
					type: NodeConstants.LinkType.FunctionOperator,
					direction: GraphMethods.TARGET
				}
			]
		});
	return null;
}
export function GetPermissionMethodModel(permission: any) {
	const method = permission ? GetPermissionMethod(permission) : null;
	if (method) {
		const props = GetMethodProps(method);

		return props ? props[FunctionTemplateKeys.Model] : null;
	}
	return null;
}

export function GetValidatorMethod(permission: { id: any }) {
	if (permission)
		return GetLinkChainItem({
			id: permission.id,
			links: [
				{
					type: NodeConstants.LinkType.FunctionOperator,
					direction: GraphMethods.TARGET
				}
			]
		});
	return null;
}
export function GetFunctionMethodKey(validation: any, templateKey = FunctionTemplateKeys.Model) {
	const method = validation ? GetValidatorMethod(validation) : null;
	if (method) {
		const props = GetMethodProps(method);

		return props ? props[templateKey] : null;
	}
	return null;
}
export function GetNodesMethod(id: string) {
	return GetPermissionMethod(GetNodeById(id));
}
export function GetAppSettings(graph: any) {
	if (graph) {
		if (graph.appConfig) {
			return graph.appConfig.AppSettings;
		}
	}
	return null;
}
export function GetCurrentGraph(state?: any): any {
	const scopedGraph = GetCurrentScopedGraph(state);
	return scopedGraph;
	// if (currentGraph) {
	//     currentGraph = Graphs(state, currentGraph);
	// }
	// return currentGraph;
}
export function GetCurrentTheme(state: any) {
	const graph = GetCurrentGraph(state);
	const {
		themeColors = {},
		themeColorUses = {},
		spaceTheme = {},
		themeOtherUses = {},
		themeGridPlacements = { grids: [] },
		themeFonts = { fonts: [] },
		themeVariables = { variables: [] }
	} = graph;
	return {
		themeColors,
		themeColorUses,
		themeOtherUses,
		spaceTheme,
		themeGridPlacements,
		themeFonts,
		themeVariables
	};
}
export function GetRootGraph(state: any, dispatch?: Function) {
	let currentGraph = Application(state, CURRENT_GRAPH);
	if (currentGraph) {
		currentGraph = Graphs(state, currentGraph);
	} else if (dispatch) {
		currentGraph = GraphMethods.createGraph();
		SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
	}

	return currentGraph;
}
export function GetSubGraphs(state: any) {
	let currentGraph = Application(state, CURRENT_GRAPH);
	if (currentGraph) {
		currentGraph = Graphs(state, currentGraph);
		const subgraphs = GraphMethods.getSubGraphs(currentGraph);
		return subgraphs;
	}
	return null;
}
export function addNewSubGraph() {
	return (dispatch: Function, getState: Function) => {
		let rootGraph = GetRootGraph(getState(), dispatch);
		rootGraph = GraphMethods.addNewSubGraph(rootGraph);
		SaveGraph(rootGraph, dispatch);
	};
}

export function setRootGraph(key: any, value: any) {
	return (dispatch: Function, getState: Function) => {
		let rootGraph = GetRootGraph(getState(), dispatch);
		rootGraph = {
			...rootGraph,
			...{ [key]: value }
		};
		SaveGraph(rootGraph, dispatch);
	};
}
export function setAppsettingsAssemblyPrefixes(prefixes: any) {
	return (dispatch: Function, getState: Function) => {
		const rootGraph = GetRootGraph(getState(), dispatch);
		rootGraph.appConfig.AppSettings.AssemblyPrefixes = ['RedQuick', prefixes].unique((x: any) => x).join(';');
		rootGraph.appConfig.AppSettings.DatabaseId = [prefixes].unique((x: any) => x).join(';');
		SaveGraph(rootGraph, dispatch);
	};
}
export function GetCurrentScopedGraph(state: any, dispatch?: Function) {
	state = state || GetState();
	let currentGraph = Application(state, CURRENT_GRAPH);
	const scope = Application(state, GRAPH_SCOPE) || [];
	if (!currentGraph) {
		if (dispatch) {
			currentGraph = GraphMethods.createGraph();
			SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
		}
	} else {
		currentGraph = Graphs(state, currentGraph);
		if (scope.length) {
			currentGraph = GraphMethods.getScopedGraph(currentGraph, { scope });
		}
	}
	return currentGraph;
}
export const SELECTED_TAB = 'SELECTED_TAB';
export const DEFAULT_TAB = 'DEFAULT_TAB';
export const SIDE_PANEL_OPEN = 'side-panel-open';
export const PARAMETER_TAB = 'PARAMETER_TAB';
export const SCOPE_TAB = 'SCOPE_TAB';
export const QUICK_MENU = 'QUICK_MENU';

export function newNode() {
	graphOperation(NEW_NODE)(_dispatch, _getState);
	setVisual(SIDE_PANEL_OPEN, true)(_dispatch, _getState);
	setVisual(SELECTED_TAB, DEFAULT_TAB)(_dispatch, _getState);
}
export function GetSelectedSubgraph(state: any) {
	const root = GetRootGraph(state);
	if (root) {
		const scope = Application(state, GRAPH_SCOPE);
		if (scope && scope.length) {
			return GraphMethods.getSubGraph(root, scope);
		}
	}
	return null;
}

export function GetViewTypeModel(node: string) {
	const models = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
		id: node,
		link: NodeConstants.LinkType.DefaultViewType
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Model);

	return models[0] || null;
}

// export function BuildPackage(model: { id: any }, _package: { methodType: string | number }) {
// 	const { id } = model;
// 	const methodFunctionDefinition = MethodFunctions[_package.methodType];
// 	if (methodFunctionDefinition) {
// 		const { constraints } = methodFunctionDefinition;

// 		Object.keys(constraints).values((_const: an) => {
// 		});
// 	}
// }
export const ComponentApiKeys = {
	DATA: 'data',
	Value: 'value',
	Item: 'item',
	ViewModel: 'viewModel',
	Index: 'index',
	Separators: 'separators',
	Error: 'error'
};
export const UPDATE_GRAPH_TITLE = 'UPDATE_GRAPH_TITLE';
export const NEW_NODE = 'NEW_NODE';
export const REMOVE_NODE = 'REMOVE_NODE';
export const NEW_LINK = 'NEW_LINK';
export const CHANGE_NODE_TEXT = 'CHANGE_NODE_TEXT';
export const CURRENT_GRAPH = 'CURRENT_GRAPH';
export const GRAPH_SCOPE = 'GRAPH_SCOPE';
export const ADD_DEFAULT_PROPERTIES = 'ADD_DEFAULT_PROPERTIES';
export const CHANGE_APP_SETTINGS = 'CHANGE_APP_SETTINGS';
export const CHANGE_NODE_PROPERTY = 'CHANGE_NODE_PROPERTY';
export const NEW_PROPERTY_NODE = 'NEW_PROPERTY_NODE';
export const NEW_PERMISSION_NODE = 'NEW_PERMISSION_NODE';
export const NEW_ATTRIBUTE_NODE = 'NEW_ATTRIBUTE_NODE';
export const ADD_LINK_BETWEEN_NODES = 'ADD_LINK_BETWEEN_NODES';
export const ADD_TO_GROUP = 'ADD_TO_GROUP';
export const ESTABLISH_SCOPE = 'ESTABLISH_SCOPE';
export const ADD_LINKS_BETWEEN_NODES = 'ADD_LINKS_BETWEEN_NODES';
export const UPDATE_NODE_DIRTY = 'UPDATE_NODE_DIRTY';
export const NEW_CONDITION_NODE = 'NEW_CONDITION_NODE';
export const ADD_NEW_NODE = 'ADD_NEW_NODE';
export const REMOVE_LINK_BETWEEN_NODES = 'REMOVE_LINK_BETWEEN_NODES';
export const REMOVE_LINK = 'REMOVE_LINK';
export const NEW_CHOICE_ITEM_NODE = 'NEW_CHOICE_ITEM_NODE';
export const NO_OP = 'NO_OP';
export const NEW_PARAMETER_NODE = 'NEW_PARAMETER_NODE';
export const NEW_FUNCTION_OUTPUT_NODE = 'NEW_FUNCTION_OUTPUT_NODE';
export const NEW_MODEL_ITEM_FILTER = 'NEW_MODEL_ITEM_FILTER';
export const NEW_AFTER_METHOD = 'NEW_AFTER_METHOD';
export const NEW_VALIDATION_ITEM_NODE = 'NEW_VALIDATION_ITEM_NODE';
export const NEW_CHOICE_TYPE = 'NEW_CHOICE_TYPE';
export const NEW_VALIDATION_TYPE = 'NEW_VALIDATION_TYPE';
export const NEW_OPTION_ITEM_NODE = 'NEW_OPTION_ITEM_NODE';
export const NEW_OPTION_NODE = 'NEW_OPTION_NODE';
export const NEW_CUSTOM_OPTION = 'NEW_CUSTOM_OPTION';
export const UPDATE_NODE_PROPERTY = 'UPDATE_NODE_PROPERTY';
export const UPDATE_GROUP_PROPERTY = 'UPDATE_GROUP_PROPERTY';
export const CONNECT_TO_TITLE_SERVICE = 'CONNECT_TO_TITLE_SERVICE';
export const NEW_DATA_SOURCE = 'NEW_DATA_SOURCE';
export const NEW_COMPONENT_NODE = 'NEW_COMPONENT_NODE';
export const NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE = 'NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE';
export const NEW_EXTENSION_LIST_NODE = 'NEW_EXTENSION_LIST_NODE';
export const NEW_EXTENTION_NODE = 'NEW_EXTENTION_NODE';
export const NEW_SCREEN_OPTIONS = 'NEW_SCREEN_OPTIONS';
export const ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY = 'ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY';
export const APPLY_FUNCTION_CONSTRAINTS = 'APPLY_FUNCTION_CONSTRAINTS';
export const ADD_NEW_REFERENCE_NODE = 'ADD_NEW_REFERENCE_NODE;';
export const UPDATE_LINK_PROPERTY = 'UPDATE_LINK_PROPERTY';

export const SET_DEPTH = 'SET_DEPTH';
export function PerformGraphOperation(commands: any[]) {
	return graphOperation(commands);
}
export function executeGraphOperation(model: null, op: { type?: string; methodType?: string; method: any }, args = {}) {
	return (dispatch: any, getState: any) => {
		op.method({ model, dispatch, getState, ...args });
	};
}
// export function executeGraphOperations(model, ops, args = {}) {
//     return (dispatch, getState) => {
//         var promise = Promise.resolve();
//         ops.map(op => {
//             promise = promise.then(() => {
//                 return op.method({ model, dispatch, getState, ...args });
//             })
//         });
//     }
// }
export function GetNodesLinkTypes(id: any) {
	return GraphMethods.getNodesLinkTypes(GetCurrentGraph(GetState()), { id });
}

export function addInstanceFunc(node: any | any, callback: any, viewPackages?: any, option: any = {}) {
	viewPackages = viewPackages || {};
	return function () {
		if (typeof node === 'function') {
			node = node();
		}
		if (option.lifeCycle) {
			return {
				nodeType: NodeTypes.LifeCylceMethodInstance,
				parent: node ? node.id : null,
				linkProperties: {
					properties: { ...LinkProperties.LifeCylceMethodInstance }
				},
				callback,
				groupProperties: {},
				properties: {
					[NodeProperties.UIText]: `${GetNodeTitle(node)} Instance`,
					[NodeProperties.AutoDelete]: {
						properties: {
							[NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
						}
					}
				}
			};
		}
		return {
			nodeType: NodeTypes.EventMethodInstance,
			parent: node ? node.id : null,
			groupProperties: {},
			linkProperties: {
				properties: { ...LinkProperties.EventMethodInstance }
			},
			properties: {
				[NodeProperties.UIText]: `${GetNodeTitle(node)} Instance`,
				[NodeProperties.Pinned]: false,
				...viewPackages,
				[NodeProperties.AutoDelete]: {
					properties: {
						[NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
					}
				}
			},
			callback
		};
	};
}
export function executeGraphOperations(operations: any[]) {
	return (dispatch: any, getState: any) => {
		operations.map((t: { node: any; method: any; options: any }) => {
			const { node, method, options } = t;
			method.method({ model: node, dispatch, getState, ...options });
		});
	};
}
export function updateComponentProperty(nodeId: string, prop: string, value: any, graph?: Graph) {
	graphOperation(
		[
			{
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						prop: prop,
						value: value === undefined ? undefined : JSON.parse(JSON.stringify(value)),
						id: nodeId
					};
				}
			}
		],
		null,
		null,
		graph
	)(GetDispatchFunc(), GetStateFunc());
}
export function selectAllConnected(id: string) {
	return (dispatch: any, getState: Function) => {
		const nodes = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(getState()), {
			id
		});
		graphOperation([
			...[...nodes, GetNodeById(id)].map((t) => ({
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						prop: NodeProperties.Selected,
						value: true,
						id: t.id
					};
				}
			}))
		])(dispatch, getState);
	};
}
export function selectAllInViewPackage(id: string) {
	return (dispatch: any, getState: any) => {
		const node = GetNodeById(id);
		const nodes = GetNodesByProperties({
			[NodeProperties.ViewPackage]: GetNodeProp(node, NodeProperties.ViewPackage)
		});
		graphOperation([
			...[...nodes].map((t) => ({
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						prop: NodeProperties.Selected,
						value: true,
						id: t.id
					};
				}
			}))
		])(dispatch, getState);
	};
}

export function pinSelected() {
	return (dispatch: any, getState: any) => {
		const nodes = GetNodesByProperties({
			[NodeProperties.Selected]: true
		});
		graphOperation(
			nodes.map((t) => ({
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						prop: NodeProperties.Pinned,
						value: true,
						id: t.id
					};
				}
			}))
		)(dispatch, getState);
	};
}
export function addAllOfType(args: { properties: any; target: any; source: any }) {
	return (dispatch: any, getState: Function) => {
		const { properties, target, source } = args;
		const nodes = NodesByType(getState(), GetNodeProp(target, NodeProperties.NODEType));
		graphOperation(
			nodes.map((v: { id: any }) => ({
				operation: ADD_LINK_BETWEEN_NODES,
				options: {
					target: v.id,
					source,
					properties
				}
			}))
		)(dispatch, getState);
	};
}
export function unPinSelected() {
	return (dispatch: any, getState: any) => {
		const nodes = GetNodesByProperties({
			[NodeProperties.Selected]: true
		});
		graphOperation(
			nodes.map((t) => ({
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						prop: NodeProperties.Pinned,
						value: false,
						id: t.id
					};
				}
			}))
		)(dispatch, getState);
	};
}

export function deleteAllSelected() {
	return (dispatch: any, getState: any) => {
		graphOperation(
			GetNodesByProperties({
				[NodeProperties.Selected]: true
			}).map((t) => ({
				operation: REMOVE_NODE,
				options: { id: t.id }
			}))
		)(dispatch, getState);
	};
}

export function isAccessNode(agent: any, model: any, aa: { id: any }, viewType?: string | null, graph?: any): any {
	graph = graph || GetCurrentGraph();
	if (
		GraphMethods.existsLinkBetween(graph, {
			source: agent.id,
			target: aa.id,
			type: NodeConstants.LinkType.AgentAccess
		}) &&
		GraphMethods.existsLinkBetween(graph, {
			source: aa.id,
			target: model.id,
			type: NodeConstants.LinkType.ModelAccess
		})
	) {
		let link = GraphMethods.findLink(graph, {
			source: agent.id,
			target: aa.id
		});
		let methodProps = GetLinkProperty(link, NodeConstants.LinkPropertyKeys.MethodProps);
		if (methodProps) {
			if (!viewType) {
				return methodProps;
			}
			return methodProps[viewType];
		}
	}
	return false;
}

export function isAccessNodeForDashboard(agent: any, dashboard: any, aa: { id: any }, graph?: any): any {
	graph = graph || GetCurrentGraph();
	if (
		GraphMethods.existsLinkBetween(graph, {
			source: agent.id,
			target: aa.id,
			type: NodeConstants.LinkType.AgentAccess
		}) &&
		GraphMethods.existsLinkBetween(graph, {
			source: aa.id,
			target: dashboard.id,
			type: NodeConstants.LinkType.DashboardAccess
		})
	) {
		let link = GraphMethods.findLink(graph, {
			source: agent.id,
			target: aa.id
		});
		let methodProps = GetLinkProperty(link, NodeConstants.LinkPropertyKeys.DashboardAccessProps);
		if (methodProps && methodProps.access) {
			return methodProps;
		}
	}
	return false;
}

export function getAccessScreen(screen: { id: string }) {
	return (access: { id: string }) => {
		let agent = GetNodeById(GetNodeProp(screen, NodeProperties.Agent));
		let model = GetNodeById(GetNodeProp(screen, NodeProperties.Model));
		let viewType = GetNodeProp(screen, NodeProperties.ViewType);
		if (agent && model) return hasAccessNode(agent, model, access, viewType);
		return false;
	};
}
export function hasAccessNode(agent: any, model: any, aa: { id: any }, viewType?: string | null, graph?: any): any {
	graph = graph || GetCurrentGraph();
	if (
		GraphMethods.existsLinkBetween(graph, {
			source: agent.id,
			target: aa.id,
			type: NodeConstants.LinkType.AgentAccess
		}) &&
		GraphMethods.existsLinkBetween(graph, {
			source: aa.id,
			target: model.id,
			type: NodeConstants.LinkType.ModelAccess
		})
	) {
		let link = GraphMethods.findLink(graph, {
			source: agent.id,
			target: aa.id
		});
		return viewType ? GetLinkProperty(link, viewType) : false;
	}
	return false;
}

export function setViewPackageStamp(viewPackage: any, stamp: any) {
	GraphMethods.setViewPackageStamp(viewPackage, stamp);
}

export function updateGraph(property: any, value: any) {
	return (dispatch: any) => {
		let graph = GetCurrentGraph();
		graph = GraphMethods.updateGraphProperty({ ...graph }, { prop: property, value });
		SaveGraph(graph, dispatch);
	};
}

let recording: { operation: any; options: any; callbackGroup: string; callback: any }[] = [];
export function GetRecording() {
	return recording;
}
export function clearRecording() {
	return () => {
		recording = [];
	};
}
export const Colors = {
	SelectedNode: '#f39c12',
	MarkedNode: '#af10fe'
};
declare global {
	export interface String {
		upperCaseFirst: Function;
	}
	export interface Array<T> {
		toNodeSelect: any;
		ddSort: any;
	}
}
((array) => {
	if (!array.toNodeSelect) {
		Object.defineProperty(array, 'toNodeSelect', {
			enumerable: false,
			writable: true,
			configurable: true,
			value() {
				const collection = this;
				return collection
					.map((node: any) => ({
						value: node.id,
						id: node.id,
						title: GetNodeTitle(node)
					}))
					.sort((a: any, b: any) => {
						return `${a.title}`.localeCompare(`${b.title}`);
					});
			}
		});
	}
	if (!array.ddSort) {
		Object.defineProperty(array, 'ddSort', {
			enumerable: false,
			writable: true,
			configurable: true,
			value() {
				const collection = this;
				return collection.sort((a: any, b: any) => {
					return `${a.title}`.localeCompare(`${b.title}`);
				});
			}
		});
	}
})(Array.prototype);

((str) => {
	if (!str.upperCaseFirst) {
		Object.defineProperty(str, 'upperCaseFirst', {
			enumerable: false,
			writable: true,
			configurable: true,
			value() {
				const collection = this;
				if (collection) {
					return `${collection[0].toUpperCase()}${collection.split('').subset(1).join('')}`;
				}
				return this;
			}
		});
	}
})(String.prototype);
export function ensureRouteSource(mountingItem: any, urlParameter: string, key: string = 'model') {
	return mountingItem.source && mountingItem.source[urlParameter] ? mountingItem.source[urlParameter][key] : null;
}
export function setRouteSource(
	mountingItem: any,
	urlParameter: string,
	k: string,
	type: string,
	property: string | null = null
) {
	mountingItem.source = mountingItem.source || {};
	mountingItem.source[urlParameter] = {
		model: k,
		property,
		type
	};
}
export function graphOperation(operation: any, options?: any, stamp?: any, graph?: Graph) {
	return (dispatch: Function, getState: Function) => {
		if (stamp) {
			const viewPackage = {
				[NodeProperties.ViewPackage]: uuidv4()
			};
			setViewPackageStamp(viewPackage, stamp);
		}
		const state = getState();
		let rootGraph: any = null;
		let graphOperationOccurences: GraphMethods.VisualOperation[] = [];
		let currentGraph = graph || Application(state, CURRENT_GRAPH);
		const scope = Application(state, GRAPH_SCOPE) || [];
		if (!currentGraph) {
			currentGraph = graph || GraphMethods.createGraph();
			SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
			rootGraph = currentGraph;
		} else {
			currentGraph = graph || Graphs(state, currentGraph);
			rootGraph = currentGraph;
			if (scope.length) {
				currentGraph = graph || GraphMethods.getScopedGraph(currentGraph, { scope });
			}
		}
		let operations = operation;
		if (!Array.isArray(operation)) {
			operations = [{ operation, options }];
		}

		currentGraph = handleArrayOperations(
			operations,
			currentGraph,
			graphOperationOccurences,
			dispatch,
			getState,
			state
		);

		if (scope.length) {
			rootGraph = GraphMethods.setScopedGraph(rootGraph, {
				scope,
				graph: currentGraph
			});
		} else {
			rootGraph = currentGraph;
		}
		// rootGraph = GraphMethods.updateReferenceNodes(rootGraph);
		if (stamp) setViewPackageStamp(null, stamp);
		if (!graph) {
			if (!GraphMethods.Paused()) {
				let visualGraph = GetC(state, VISUAL_GRAPH, rootGraph.id);
				graphOperationOccurences.forEach((op: GraphMethods.VisualOperation) => {
					visualGraph = GraphMethods.UpdateVisualGrpah(visualGraph, rootGraph, op);
				});
			}

			// if (visualGraph) dispatch(UIC(VISUAL_GRAPH, visualGraph.id, visualGraph));
			rootGraph.nodeCount = (<Graph>rootGraph).nodes.length;
			rootGraph.linkCount = (<Graph>rootGraph).links.length;
			SaveGraph(rootGraph, dispatch);
		}
	};
}

function handleArrayOperations(
	operations: any,
	currentGraph: any,
	graphOperationOccurences: GraphMethods.VisualOperation[],
	dispatch: Function,
	getState: Function,
	state: any
) {
	operations.forEach((op: any) => {
		currentGraph = handleOperation(op, currentGraph, graphOperationOccurences, dispatch, getState, state);
	});
	return currentGraph;
}

function handleFunctionOperations(
	op: any,
	currentGraph: any,
	graphOperationOccurences: GraphMethods.VisualOperation[],
	dispatch: Function,
	getState: Function,
	state: any
) {
	if (typeof op === 'function') {
		op = op(currentGraph);
	}
	currentGraph = handleOperation(op, currentGraph, graphOperationOccurences, dispatch, getState, state);
	return currentGraph;
}

function handleOperation(
	op: any,
	currentGraph: any,
	graphOperationOccurences: GraphMethods.VisualOperation[],
	dispatch: Function,
	getState: Function,
	state: any
) {
	if (typeof op === 'function') {
		return handleFunctionOperations(op, currentGraph, graphOperationOccurences, dispatch, getState, state);
	} else if (Array.isArray(op)) {
		return handleArrayOperations(op, currentGraph, graphOperationOccurences, dispatch, getState, state);
	} else if (!op) {
		return currentGraph;
	}
	let { operation, options } = op;
	if (typeof options === 'function') {
		options = options(currentGraph);
	}
	if (options) {
		const currentLastNode =
			currentGraph.nodes && currentGraph.nodes.length ? currentGraph.nodes[currentGraph.nodes.length - 1] : null;
		const currentLastGroup =
			currentGraph.groups && currentGraph.groups.length
				? currentGraph.groups[currentGraph.groups.length - 1]
				: null;
		switch (operation) {
			case NO_OP:
				break;
			case SET_DEPTH:
				currentGraph = GraphMethods.setDepth(currentGraph, options);
				break;
			case NEW_NODE:
				currentGraph = GraphMethods.newNode(currentGraph, options);
				break;
			case REMOVE_NODE:
				currentGraph = GraphMethods.removeNode(currentGraph, options);
				graphOperationOccurences.push({
					command: GraphMethods.VisualCommand.REMOVE_NODE,
					nodeId: options.id
				});
				break;
			case UPDATE_GRAPH_TITLE:
				currentGraph = GraphMethods.updateGraphTitle(currentGraph, options);
				break;
			case UPDATE_NODE_DIRTY:
				currentGraph = GraphMethods.updateNodePropertyDirty(currentGraph, options);
				break;
			case NEW_LINK:
				currentGraph = GraphMethods.newLink(currentGraph, options, (link: GraphLink) => {
					if (link) {
						graphOperationOccurences.push({
							command: GraphMethods.VisualCommand.ADD_CONNECTION,
							linkId: link.id
						});
					}
				});
				break;
			case ADD_LINK_BETWEEN_NODES:
				currentGraph = GraphMethods.addLinkBetweenNodes(currentGraph, options, (link: GraphLink) => {
					if (link) {
						graphOperationOccurences.push({
							command: GraphMethods.VisualCommand.ADD_CONNECTION,
							linkId: link.id
						});
					}
					if (options && options.callback) {
						options.callback(link.id);
					}
				});
				break;
			case ADD_TO_GROUP:
				currentGraph = GraphMethods.updateNodeGroup(currentGraph, options);
				break;
			case ADD_LINKS_BETWEEN_NODES:
				currentGraph = GraphMethods.addLinksBetweenNodes(currentGraph, options, (link: GraphLink) => {
					if (link) {
						graphOperationOccurences.push({
							command: GraphMethods.VisualCommand.ADD_CONNECTION,
							linkId: link.id
						});
					}
				});
				break;
			case CONNECT_TO_TITLE_SERVICE:
				const titleService = GetTitleService();
				if (titleService) {
					currentGraph = GraphMethods.addLinkBetweenNodes(
						currentGraph,
						{
							source: options.id,
							target: titleService.id,
							properties: {
								...LinkProperties.TitleServiceLink,
								singleLink: true,
								nodeTypes: [NodeTypes.TitleService]
							}
						},
						(link: GraphLink) => {
							if (link) {
								graphOperationOccurences.push({
									command: GraphMethods.VisualCommand.ADD_CONNECTION,
									linkId: link.id
								});
							}
						}
					);
				}
				break;
			case REMOVE_LINK_BETWEEN_NODES:
				let removedLink: any = null;
				currentGraph = GraphMethods.removeLinkBetweenNodes(currentGraph, options, (link: GraphLink) => {
					removedLink = link;
				});
				if (removedLink) {
					graphOperationOccurences.push({
						command: GraphMethods.VisualCommand.REMOVE_LINK,
						linkId: removedLink
					});
				}
				break;
			case REMOVE_LINK:
				currentGraph = GraphMethods.removeLinkById(currentGraph, options);
				if (options && options.id) {
					graphOperationOccurences.push({
						command: GraphMethods.VisualCommand.REMOVE_LINK,
						linkId: options.id
					});
				}
				break;
			case UPDATE_GROUP_PROPERTY:
				currentGraph = GraphMethods.updateGroupProperty(currentGraph, options);
				break;
			case CHANGE_NODE_TEXT:
				currentGraph = GraphMethods.updateNodeProperty(currentGraph, {
					...options,
					prop: 'text'
				});
				break;
			case CHANGE_NODE_PROPERTY:
				currentGraph = GraphMethods.updateNodeProperty(currentGraph, options);
				if (options && options.prop && options.prop === NodeProperties.Pinned) {
					if (options.value) {
						graphOperationOccurences.push({
							command: GraphMethods.VisualCommand.ADD_NODE,
							nodeId: options.id
						});
					} else {
						graphOperationOccurences.push({
							command: GraphMethods.VisualCommand.REMOVE_NODE,
							nodeId: options.id
						});
					}
				}
				break;
			case CHANGE_APP_SETTINGS:
				currentGraph = GraphMethods.updateAppSettings(currentGraph, options);
				break;
			case NEW_PROPERTY_NODE:
				currentGraph = GraphMethods.addNewPropertyNode(currentGraph, options);

				break;
			case ADD_DEFAULT_PROPERTIES:
				currentGraph = GraphMethods.addDefaultProperties(currentGraph, options);
				break;
			case NEW_ATTRIBUTE_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Attribute);

				break;
			case UPDATE_NODE_PROPERTY:
				currentGraph = GraphMethods.updateNodeProperties(currentGraph, options);
				if (options && options.properties && options.properties.hasOwnProperty(NodeProperties.Pinned)) {
					if (options.properties[NodeProperties.Pinned]) {
						graphOperationOccurences.push({
							command: GraphMethods.VisualCommand.ADD_NODE,
							nodeId: options.id
						});
					} else {
						graphOperationOccurences.push({
							command: GraphMethods.VisualCommand.REMOVE_NODE,
							nodeId: options.id
						});
					}
				}
				break;
			case NEW_CONDITION_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Condition);

				break;
			case ADD_NEW_NODE:
				if (options && options.nodeType) {
					currentGraph = GraphMethods.addNewNodeOfType(
						currentGraph,
						options,
						options.nodeType,
						options.callback
					);
					setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
				}
				break;
			case NEW_MODEL_ITEM_FILTER:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ModelItemFilter);

				break;
			case NEW_AFTER_METHOD:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.AfterEffect);

				break;
			case NEW_COMPONENT_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ComponentNode);

				break;
			case NEW_DATA_SOURCE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.DataSource);

				break;
			case NEW_VALIDATION_TYPE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ValidationList);

				break;
			case NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.PermissionDependency);

				break;
			case UPDATE_LINK_PROPERTY:
				currentGraph = GraphMethods.updateLinkProperty(currentGraph, options);
				break;
			case NEW_CHOICE_TYPE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ChoiceList);

				break;
			case NEW_PARAMETER_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Parameter);

				break;
			case NEW_FUNCTION_OUTPUT_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.FunctionOutput);

				break;
			case NEW_PERMISSION_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Permission);

				break;
			case NEW_OPTION_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.OptionList);

				break;
			case NEW_CUSTOM_OPTION:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.OptionCustom);

				break;
			case NEW_SCREEN_OPTIONS:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ScreenOption);

				break;
			case ADD_NEW_REFERENCE_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ReferenceNode);

				break;
			case NEW_EXTENSION_LIST_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ExtensionTypeList);

				break;
			case NEW_VALIDATION_ITEM_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ValidationListItem);

				break;
			case NEW_EXTENTION_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ExtensionType);

				break;
			case NEW_OPTION_ITEM_NODE:
				currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.OptionListItem);

				break;
			case APPLY_FUNCTION_CONSTRAINTS:
				currentGraph = GraphMethods.applyFunctionConstraints(currentGraph, options);
				break;
			case ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY:
				break;
			default:
				break;
		}

		let nodeAdded = currentLastNode !== currentGraph.nodes[currentGraph.nodes.length - 1];
		if (recording && Visual(state, RECORDING)) {
			recording.push({
				operation,
				options,
				callbackGroup: `group-${currentLastGroup !== currentGraph.groups[currentGraph.groups.length - 1]
					? currentGraph.groups[currentGraph.groups.length - 1]
					: null}`,
				callback: nodeAdded ? currentGraph.nodes[currentGraph.nodes.length - 1] : null
			});
		}
		if (nodeAdded) {
			graphOperationOccurences.push({
				command: GraphMethods.VisualCommand.ADD_NODE,
				nodeId: currentGraph.nodes[currentGraph.nodes.length - 1]
			});
		}
	}
	return currentGraph;
}
