/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import * as Titles from '../components/titles';
import {
	NodeTypes,
	NodeProperties,
	LinkProperties,
	LinkType,
	LinkPropertyKeys,
	NodePropertyTypes,
	GroupProperties,
	FunctionGroups,
	LinkEvents
} from '../constants/nodetypes';
import { FunctionTemplateKeys, FunctionConstraintKeys } from '../constants/functiontypes';
import * as Functions from '../constants/functiontypes';
import {
	GetLinkProperty,
	GetGroupProperty,
	GetCurrentGraph,
	GetRootGraph,
	GetNodeById,
	GetCodeName,
	GetNodeByProperties
} from '../actions/uiactions';
import { uuidv4 } from '../utils/array';
import { Graph, Node, GraphLink } from './graph_types';

const os = require('os');

export function createGraph(): Graph {
	return {
		id: uuidv4(),
		version: {
			major: 0,
			minor: 0,
			build: 0
		},
		workspace: '',
		title: Titles.DefaultGraphTitle,
		path: [],
		namespace: '',
		// Groups
		groups: [],
		groupLib: {},
		groupsNodes: {}, // group => { node}
		nodesGroups: {}, // node => {group}
		childGroups: {}, // group => {group}
		parentGroup: {}, // group => {group}
		themeColors: {},
		themeColorUses: {},
		themeOtherUses: {},
		themeGridPlacements: { grids: [] },
		themeFonts: { fonts: [] },
		spaceTheme: {},
		themeVariables: { variables: [] },
		// Groups
		// Reference nodes
		referenceNodes: {},
		// Reference nodes
		nodeLib: {},
		nodes: [],
		nodeLinks: {}, // A library of nodes, and each nodes that it connects.
		nodeConnections: {}, // A library of nodes, and each nodes links
		nodeLinkIds: {},
		linkLib: {},
		links: [],
		graphs: {},
		classNodes: {},
		functionNodes: {}, // A function nodes will be run through for checking constraints.
		updated: null,
		visibleNodes: {}, // Nodes that are visible now, and used to calculate the visibility of other nodes.
		appConfig: {
			Logging: {
				IncludeScopes: false,
				LogLevel: {
					Default: 'Debug',
					System: 'Information',
					Microsoft: 'Information'
				}
			},
			AppSettings: {
				'Local-AuthorizationKey':
					'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==',
				'Local-EndPointUrl': 'https://localhost:8081',
				use_local: true,
				DeveloperMode: true,
				EndPointUrl: '',
				AuthorizationKey: '',
				DatabaseId: 'red-db-001',
				AllowedOrigins: 'http://localhost:44338',
				AssemblyPrefixes: 'Smash;RedQuick',
				'Use-SingleCollection': true,
				'storage-key': 'UseDevelopmentStorage=true',
				'single-thread': true,
				ConfirmEmailController: 'Account',
				ConfirmEmailAction: 'ConfirmEmail',
				HomeAction: 'Index',
				HomeController: 'Home',
				ResetPasswordAction: 'ResetPassword',
				ResetPasswordController: 'Account',
				SecurityKey: 'ajskdflajsdfklas20klasdkfj9laksdjfl4aksdjf3kanvdlnaekf',
				AppSecret: 'YQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBuAG8AcABxAHIAcwB0AHUAdgB3AHgAeQB6ADAAMQAyADMANAA1AA==',
				Domain: 'https://localhost:44338',
				TokenExpirationInMinutes: '250',
				Issuer: 'https://localhost:44338',
				Audience: 'https://localhost:44338',
				DomainPort: '44338'
			}
		}
	};
}

export function GetNodeProp(node: any, prop: string, currentGraph?: any) {
	if (typeof node === 'string') {
		node = GetNodeById(node, currentGraph) || node;
	}
	return node && node.properties && node.properties[prop];
}

export const GraphKeys = {
	NAMESPACE: 'namespace',
	PROJECTNAME: 'project_name',
	COLORSCHEME: 'color_scheme',
	SERVER_SIDE_SETUP: 'server_side_setup',
	THEME: 'theme'
};
export function updateWorkSpace(graph: any, options: any) {
	const { workspace } = options;

	graph.workspaces = graph.workspaces || {};
	graph.workspaces[os.platform()] = workspace;
	if (graph.workspaces[os.platform()]) {
		graph.workspace = workspace;
	}
	return graph;
}

export function CreateLayout() {
	return {
		layout: {},
		properties: {}
	};
}
export function FindLayoutRoot(id: any, root: any) {
	if (root && root[id]) {
		return root[id];
	}
	let res;
	Object.keys(root).find((t) => {
		if (root[t]) res = FindLayoutRoot(id, root[t]);
		else {
			return false;
		}
		return res;
	});
	return res;
}

export function FindLayoutRootParent(id: any, root: any, parent?: any) {
	if (root[id]) {
		return root || parent;
	}
	let res;
	Object.keys(root).find((t) => {
		res = FindLayoutRootParent(id, root[t], root);
		return res;
	});
	return res;
}

export function GetAllChildren(root: any) {
	let result = Object.keys(root || {});
	result.forEach((t) => {
		const temp = GetAllChildren(root[t]);
		result = [ ...result, ...temp ];
	});
	return result;
}
export const DefaultCellProperties = {
	style: {
		borderStyle: 'solid',
		borderWidth: 1
	},
	children: {}
};
export function GetCellProperties(setup: any, id: any) {
	const { properties } = setup;
	return properties[id];
}
export function RemoveCellLayout(setup: any, id: any) {
	if (setup && setup.layout) {
		const parent = FindLayoutRootParent(id, setup.layout);
		if (parent) {
			const kids = GetAllChildren(parent[id]);
			kids.forEach((t) => {
				delete setup.properties[t];
			});

			delete parent[id];
			delete setup.properties[id];
		}
	}
	return setup;
}
export function ReorderCellLayout(setup: any, id: any, dir = -1) {
	if (setup && setup.layout) {
		const parent = FindLayoutRootParent(id, setup.layout);
		if (parent) {
			const layout = parent;
			const keys = Object.keys(layout);
			if (keys.some((v) => v === id)) {
				const id_index = keys.indexOf(id);
				if (id_index === 0 && dir === -1) {
					// do nothing
				} else if (id_index === keys.length - 1 && dir === 1) {
					// keep doing nothing
				} else {
					const temp = keys[id_index];
					keys[id_index] = keys[id_index + dir];
					keys[id_index + dir] = temp;
				}

				const temp_layout = { ...layout };
				keys.forEach((k) => delete layout[k]);
				keys.forEach((k) => {
					layout[k] = temp_layout[k];
				});
			}
		}
	}
	return setup;
}

export function GetChildren(setup: any, parentId: any) {
	const parent = FindLayoutRootParent(parentId, setup.layout);

	return Object.keys(parent[parentId]);
}
export function GetChild(setup: any, parentId: any) {
	if (setup && setup.properties && setup.properties[parentId] && setup.properties[parentId].children) {
		return setup.properties[parentId].children[parentId];
	}
	return null;
}
export function GetFirstCell(setup: any) {
	const keys = setup ? Object.keys(setup.layout) : [];

	return keys[0] || null;
}
export function SetCellsLayout(setup: any, count: any, id?: any, properties = DefaultCellProperties) {
	let keys: any = [];
	let root: any = null;
	count = parseInt(count);
	if (!id) {
		keys = Object.keys(setup.layout);
		root = setup.layout;
	} else {
		root = FindLayoutRoot(id, setup.layout);
		if (!root) {
			throw 'missing root';
		}
		keys = Object.keys(root);
	}
	// If there is room add keys
	if (keys.length - count < 0) {
		[].interpolate(0, count - keys.length, () => {
			const newkey = uuidv4();
			root[newkey] = {};
			setup.properties[newkey] = { ...JSON.parse(JSON.stringify(properties)) };
		});
	} else if (keys.length - count > 0) {
		[].interpolate(0, keys.length - count, (index: any) => {
			delete root[keys[index]];
			delete setup.properties[keys[index]];
		});
	}

	return setup;
}
export function SortCells(setup: any, parentId: any, sortFunction: any) {
	const layout = FindLayoutRoot(parentId, setup.layout);
	const keys = Object.keys(layout);
	const temp_layout = { ...layout };
	keys.forEach((k) => delete layout[k]);
	keys.sort(sortFunction).forEach((k) => {
		layout[k] = temp_layout[k];
	});
}
export function GetCellIdByTag(setup: any, tag: any) {
	if (setup && setup.properties) {
		return Object.keys(setup.properties).find((v) => {
			const { properties } = setup.properties[v];
			if (properties && properties.tags) {
				return properties.tags.indexOf(tag) !== -1;
			}
			return false;
		});
	}

	return null;
}

export function incrementBuild(graph: any) {
	graph.version.build++;
	return graph;
}

export function incrementMinor(graph: any) {
	graph.version.minor++;
	graph.version.build = 0;
	return graph;
}

export function incrementMajor(graph: any) {
	graph.version.major++;
	graph.version.minor = 0;
	graph.version.build = 0;
	return graph;
}

export function updateGraphTitle(graph: any, ops: any) {
	const { text } = ops;
	graph.title = text;
	return graph;
}

export function createScreenParameter(parameter: any) {
	return {
		title: parameter || '',
		id: uuidv4()
	};
}
export function GetParameterName(parameter: any) {
	if (parameter) return parameter.title || '';
	return '';
}

export function updateGraphProperty(graph: any, ops: any) {
	const { prop, value } = ops;
	graph[prop] = value;
	return graph;
}

export function addNewSubGraph(graph: any) {
	const newgraph = createGraph();
	newgraph.title = Titles.DefaultSubGraphTitle;
	graph.graphs[newgraph.id] = newgraph;
	return graph;
}
export function removeSubGraph(graph: any, id: any) {
	delete graph.graphs[id];
	return graph;
}

export function getSubGraphs(graph: any) {
	return graph && graph.graphs ? Object.keys(graph.graphs || {}).map((t) => graph.graphs[t]) : [];
}

export function getSubGraph(graph: any, scopes: any) {
	let result = graph;

	scopes.forEach((scope: any) => {
		result = graph.graphs[scope];
	});

	return result;
}
export function getScopedGraph(graph: any, options: any) {
	const { scope } = options;
	if (scope && scope.length) {
		scope.forEach((s: any) => {
			graph = graph.graphs[s];
		});
	}
	return graph;
}

export function setScopedGraph(root: any, options: any) {
	const { scope, graph } = options;
	if (scope && scope.length) {
		let currentGraph = root;
		scope.forEach((s: any, i: any) => {
			if (i === scope.length - 1) {
				currentGraph.graphs[s] = graph;
			} else {
				currentGraph = currentGraph.graphs[s];
			}
		});
	} else {
		root = graph;
	}
	return root;
}

export function newGroup(graph: any, callback: any) {
	const group = createGroup();
	const result = addGroup(graph, group);
	if (callback) {
		callback(group);
	}
	return result;
}
export function GetNodesInGroup(graph: any, group: any) {
	return (
		(graph.groupsNodes &&
			graph.groupsNodes[group] &&
			Object.keys(graph.groupsNodes[group]).filter((v) => graph.groupsNodes[group][v])) ||
		[]
	);
}
export function addLeaf(graph: any, ops: any) {
	const { leaf, id } = ops;
	let leaves = graph.groupLib[id].leaves || [];
	if (fast) {
		if (leaves.indexOf(leaf) === -1) {
			leaves.push(leaf);
		}
	} else {
		leaves = [ ...leaves, leaf ].unique((x: any) => x);
	}
	// Groups => nodes
	graph.groupsNodes[id] = graph.groupsNodes[id] || {};
	graph.groupsNodes[id][leaf] = true;
	if (!fast) {
		graph.groupsNodes = {
			...graph.groupsNodes
		};
	}

	// Nodes => groups
	graph.nodesGroups[leaf] = graph.nodesGroups[leaf] || {};
	graph.nodesGroups[leaf][id] = true;
	if (!fast) {
		graph.nodesGroups = {
			...graph.nodesGroups
		};
	}

	graph.groupLib[id].leaves = leaves;
	return graph;
}
export function removeLeaf(graph: any, ops: any) {
	const { leaf, id } = ops;
	const group = graph.groupLib[id];
	if (group) {
		let leaves = group.leaves || [];
		leaves = leaves.filter((t: any) => t !== leaf);
		graph.groupLib[id].leaves = leaves;
	}
	if (graph.groupsNodes[id]) {
		if (graph.groupsNodes[id][leaf]) {
			delete graph.groupsNodes[id][leaf];
		}
		if (Object.keys(graph.groupsNodes[id]).length === 0) {
			delete graph.groupsNodes[id];
			graph.groups = graph.groups.filter((x: any) => x !== id);
			delete graph.groupLib[id];
		}
		if (!fast) {
			graph.groupsNodes = {
				...graph.groupsNodes
			};
		}
	}

	if (graph.nodesGroups[leaf]) {
		if (graph.nodesGroups[leaf][id]) {
			delete graph.nodesGroups[leaf][id];
		}
		if (Object.keys(graph.nodesGroups[leaf]).length === 0) {
			delete graph.nodesGroups[leaf];
		}
		if (!fast) {
			graph.nodesGroups = {
				...graph.nodesGroups
			};
		}
	}

	return graph;
}

export function addGroupToGroup(graph: any, ops: any) {
	const { groupId, id } = ops;
	const group = graph.groupLib[id];
	const groups = group.groups || [];
	if (fast) {
		if (group.groups.indexOf(groupId) === -1) {
			group.groups.push(groupId);
		}
	} else {
		group.groups = [ ...groups, groupId ].unique((x: any) => x);
	}
	graph.groupLib[id] = group;
	if (!fast) {
		graph.groupLib = { ...graph.groupLib };
	}
	// Groups need to know who contains them,
	graph.childGroups[id] = graph.childGroups[id] || {};
	graph.childGroups[id][groupId] = true;
	// and also the containers to know about the groups
	graph.parentGroup[groupId] = graph.parentGroup[groupId] || {};
	graph.parentGroup[groupId][id] = true;

	return graph;
}
export function removeGroupFromGroup(graph: any, ops: any) {
	const { groupId, id } = ops;
	const group = graph.groupLib[id];

	if (group && group.groups) {
		group.groups = group.groups.filter((x: any) => x !== groupId);
	}
	if (!fast) {
		graph.groupLib[id] = { ...group };
	}
	if (graph.childGroups) {
		if (graph.childGroups[id]) {
			delete graph.childGroups[id][groupId];
			if (!Object.keys(graph.childGroups[id]).length) {
				delete graph.childGroups[id];
			}
		}

		if (graph.parentGroup[groupId]) {
			delete graph.parentGroup[groupId][id];
			if (!Object.keys(graph.parentGroup[groupId]).length) {
				delete graph.childGroups[groupId];
			}
		}
	}

	return graph;
}

export function getNodesGroups(graph: any, id: any) {
	return graph && graph.nodesGroups ? graph.nodesGroups[id] : null;
}
export function clearGroup(graph: any, ops: any) {
	const { id } = ops;
	for (const i in graph.groupsNodes[id]) {
		if (graph.nodesGroups[i]) {
			delete graph.nodesGroups[i][id];
			if (Object.keys(graph.nodesGroups[i]).length === 0) {
				delete graph.nodesGroups[i];
			}
		}
	}
	for (const i in graph.childGroups[id]) {
		if (graph.parentGroup[i]) {
			delete graph.parentGroup[i][id];
			if (Object.keys(graph.parentGroup[i]).length === 0) {
				delete graph.parentGroup[i];
			}
		}
	}
	graph.groups = [ ...graph.groups.filter((x: any) => x !== id) ];
	delete graph.groupLib[id];
	delete graph.childGroups[id];
	delete graph.groupsNodes[id];

	return graph;
}
export function createValidator() {
	return {
		properties: {}
	};
}

export function createMethodValidation(methodType: any) {
	const res: any = {
		methods: {}
	};

	if (res && !res.methods[methodType]) {
		res.methods[methodType] = createMethodValidationType();
	}

	return res;
}

export function createMethodValidationType() {
	return {};
}
export function getMethodValidationType(methodValidation: any, methodType: any) {
	const { methods } = methodValidation;
	if (methods && methods[methodType]) {
		return methods[methodType];
	}
	return null;
}
export function addMethodValidationForParamter(
	methodValidation: any,
	methodType: any,
	methodParam: any,
	methedParamProperty?: any
) {
	methodValidation = methodValidation || createMethodValidation(methodType);
	if (getMethodValidationType(methodValidation, methodType)) {
		const methodValidationType = getMethodValidationType(methodValidation, methodType);
		if (methodParam) {
			methodValidationType[methodParam] = methodValidationType[methodParam] || createProperyContainer();
			if (methedParamProperty && methodValidationType[methodParam]) {
				methodValidationType[methodParam].properties[methedParamProperty] =
					methodValidationType[methodParam].properties[methedParamProperty] || createValidatorProperty();
			}
		}
	}
	return methodValidation;
}
export function createProperyContainer() {
	return {
		properties: {}
	};
}
export function getMethodValidationForParameter(methodValidation: any, methodType: any, methodParam: any) {
	methodValidation = methodValidation || addMethodValidationForParamter(methodValidation, methodType, methodParam);
	if (methodValidation) {
		const temp = getMethodValidationType(methodValidation, methodType);
		if (!temp) {
			methodValidation.methods[methodType] = createMethodValidation(methodType).methods[methodType];
		}
		if (temp) {
			if (temp[methodParam] && temp[methodParam]) {
				return temp[methodParam];
			}
		}
	}
	return null;
}
export function removeMethodValidationParameter(
	methodValidation: any,
	methodType: any,
	methodParam: any,
	methedParamProperty: any
) {
	if (methodValidation) {
		const temp = getMethodValidationType(methodValidation, methodType);
		if (temp) {
			if (
				temp[methodParam] &&
				temp[methodParam].properties &&
				temp[methodParam].properties[methedParamProperty]
			) {
				delete temp[methodParam].properties[methedParamProperty];
			}
		}
	}
	return methodValidation;
}
export const createExecutor = createValidator;

export function createValidatorProperty() {
	return {
		validators: {}
	};
}
export function hasValidator(validator: any, options: any) {
	if (validator && validator.properties && validator.properties[options.id]) {
		if (options.validator && validator.properties[options.id].validators) {
			const { validators } = validator.properties[options.id];
			return Object.keys(validators).some((id) => validators[id].type === options.validatorArgs.type);
		}
	}

	return false;
}
export function addValidatator(validator: any, options: any) {
	validator.properties[options.id] = validator.properties[options.id] || createValidatorProperty();
	if (options.validator) validator.properties[options.id].validators[options.validator] = options.validatorArgs;

	return validator;
}
export function removeValidatorValidation(_validator: any, options: any) {
	const { property, validator } = options;
	delete _validator.properties[property].validators[validator];

	return _validator;
}
export function removeValidator(validator: any, options: any) {
	delete validator.properties[options.id];
	return validator;
}

export function getValidatorItem(item: any, options: any) {
	const { property, validator } = options;
	return item.properties[property].validators[validator];
}

export function getValidatorProperties(validator: any) {
	return validator ? validator.properties : null;
}
export function setDepth(graph: any, options: any) {
	const { depth } = options;
	graph.depth = depth;

	return graph;
}
export function newNode(graph: any, options: any) {
	const node = createNode();
	if (_viewPackageStamp) {
		for (const p in _viewPackageStamp) {
			node.properties[p] = _viewPackageStamp[p];
		}
	}

	return addNode(graph, node, options);
}

export function createExtensionDefinition() {
	return {
		// The code generation will define the unique 'value'.
		config: {
			// If this definition is a list or some sort of collection.
			isEnumeration: false,
			// If not, then it is a dictionary, and will have some sort of property that will  be considered the value.
			dictionary: {},
			// A list of objects, with the same shape as the dictionary.
			list: []
		},
		definition: {}
	};
}
export function defaultExtensionDefinitionType() {
	return 'string';
}
export function MatchesProperties(properties: { [x: string]: any }, node: any) {
	if (properties && node) {
		const res = !Object.keys(properties).some((key) => properties[key] !== GetNodeProp(node, key));

		return res;
	}
	return false;
}
export function removeNode(graph: any, options: any = {}) {
	const { id } = options;
	const idsToDelete = [ id ];
	const autoDelete = GetNodeProp(id, NodeProperties.AutoDelete, graph);
	if (autoDelete) {
		GetNodesLinkedTo(graph, { id })
			.filter((x: any) => MatchesProperties(autoDelete.properties, x))
			.forEach((t: { id: any }) => {
				idsToDelete.push(t.id);
			});
	}

	idsToDelete.forEach((id) => {
		const existNodes = getNodesByLinkType(graph, {
			exist: true,
			id,
			direction: TARGET,
			type: LinkType.Exist
		});
		updateCache({
			prop: NodeProperties.NODEType,
			id,
			previous: GetNodeProp(id, NodeProperties.NODEType, graph)
		});

		graph = incrementBuild(graph);
		// links
		graph = clearLinks(graph, options);

		// groups
		graph = removeNodeFromGroups(graph, options);

		if (graph.functionNodes && graph.functionNodes[id]) {
			delete graph.functionNodes[id];
			graph.functionNodes = { ...graph.functionNodes };
		}
		if (graph.classNodes && graph.classNodes[id]) {
			delete graph.classNodes[id];
			graph.classNodes = { ...graph.classNodes };
		}
		delete graph.nodeLib[id];
		graph.nodeLib = { ...graph.nodeLib };
		graph.nodes = graph.nodes.filter((x: any) => x !== id);
		if (existNodes) {
			existNodes.forEach((en: any) => {
				graph = removeNode(graph, { id: en.id });
			});
		}
	});
	return graph;
}

export function GetManyToManyNodes(state: any, ids: any) {
	if (state && ids && ids.length) {
		return NodesByType(state, NodeTypes.Model)
			.filter((x: any) => GetNodeProp(x, NodeProperties.ManyToManyNexus))
			.filter(
				(x: any) =>
					!(ids || [])
						.some((t: any) => (GetNodeProp(x, NodeProperties.ManyToManyNexusTypes) || []).indexOf(t) !== -1)
			);
	}
	return [];
}
export function getPropertyNodes(graph: any, id: any) {
	return getNodesByLinkType(graph, {
		id,
		direction: SOURCE,
		type: LinkType.PropertyLink
	});
}
export function getDataChainNodes(graph: any, id: any) {
	return getNodesByLinkType(graph, {
		id,
		direction: TARGET,
		type: LinkType.DataChainLink
	});
}
function clearGroupDeep(graph: any, options: any) {
	const { id, callback } = options;
	let success = true;
	if (graph.childGroups[id]) {
		for (var i in graph.childGroups[id]) {
			var ok = false;
			graph = clearGroupDeep(graph, {
				id: i,
				callback: (v: boolean) => {
					ok = v;
					success = success && v;
				}
			});
			if (graph.childGroups[id]) {
				delete graph.childGroups[id][i];
			}
		}
	}
	if (success) {
		// If the children were empty this can be cleared out
		if (!graph.groupLib[id] || !graph.groupLib[id].leaves || !graph.groupLib[id].leaves.length) {
			if (!graph.groupLib[id] || !graph.groupLib[id].groups || !graph.groupLib[id].groups.length) {
				// if these conditions are met.
				delete graph.groupLib[id];
				graph.groups = [ ...graph.groups.filter((x: any) => x !== id) ];
				delete graph.childGroups[id];
				if (graph.parentGroup[id]) {
					for (var i in graph.parentGroup[id]) {
						graph = removeGroupFromGroup(graph, { groupId: id, id: i });
						graph = clearGroupDeep(graph, { id: i });
						if (graph.childGroups[i]) delete graph.childGroups[i][id];
					}
					delete graph.parentGroup[id];
				}
			}
		}
	} else if (callback) {
		callback(false);
	}
	return graph;
}
export function removeNodeFromGroups(graph: any, options: any) {
	const { id } = options;
	let groupsContainingNode: any[] = [];
	// nodesGroups
	if (graph.nodesGroups[id]) {
		groupsContainingNode = Object.keys(graph.nodesGroups[id]);
		groupsContainingNode.forEach((group) => {
			graph = removeLeaf(graph, { leaf: id, id: group });
		});
	}

	// groupsNodes
	if (graph.groupsNodes) {
		groupsContainingNode.forEach((group) => {
			if (graph.groupsNodes[group]) {
				if (graph.groupsNodes[group][id]) {
					delete graph.groupsNodes[group][id];
				}

				if (Object.keys(graph.groupsNodes[group]).length === 0) {
					delete graph.groupsNodes[group];
				}
			}
			graph = clearGroupDeep(graph, { id: group });
		});
	}

	return graph;
}
export function clearLinks(graph: any, options: any) {
	const { id } = options;
	const linksToRemove = getAllLinksWithNode(graph, id);
	for (let i = 0; i < linksToRemove.length; i++) {
		const link = linksToRemove[i];
		graph = removeLink(graph, link);
	}
	return graph;
}

export function addNode(graph: Graph, node: Node, options?: { callback: Function }) {
	graph.nodeLib[node.id] = node;
	// graph.nodeLib = { ...graph.nodeLib };
	// graph.nodes = [...graph.nodes, node.id];
	graph.nodes.push(node.id);
	// graph = { ...graph };
	graph = incrementBuild(graph);
	if (options && options.callback) {
		options.callback(node);
	}
	return graph;
}
const AppCache: any = {
	Links: {},
	Nodes: {},
	Pinned: {},
	Selected: {},
	ViewPackages: {},
	Version: 0,
	Paused: false,
	Properties: {},
	PropertyKeys: []
};
export function GetAppCache() {
	return AppCache;
}
export function GetAppCacheVersion() {
	return AppCache.Version;
}
export function Paused() {
	return AppCache.Paused;
}
export function SetPause(value = true) {
	AppCache.Paused = value;
}
export function setupCache(graph: any) {
	AppCache.Links = {};
	AppCache.Nodes = {};
	AppCache.Pinned = {};
	AppCache.Selected = {};
	AppCache.ViewPackages = {};
	AppCache.Properties = {};
	AppCache.PropertyKeys = [];
	AppCache.Version = 0;
	const { Nodes, Links, Pinned, Selected, ViewPackages } = AppCache;

	if (graph.links.length !== Object.keys(graph.linkLib).length) {
		throw new Error('invalid grid links');
	}

	if (graph && graph.nodeLib) {
		Object.keys(graph.nodeLib).forEach((key) => {
			const node: any = GetNode(graph, key);
			const nodeType = GetNodeProp(node, NodeProperties.NODEType);
			Nodes[nodeType] = Nodes[nodeType] || {};
			Nodes[nodeType][key] = true;
			const selected = GetNodeProp(node, NodeProperties.Selected);
			if (selected) {
				Selected[key] = true;
			}
			const pinned = GetNodeProp(node, NodeProperties.Pinned);
			if (pinned) {
				Pinned[key] = true;
			}
			const vp = GetNodeProp(node, NodeProperties.ViewPackage);
			if (vp) {
				if (!ViewPackages[vp]) {
					ViewPackages[vp] = {
						[node.id]: true
					};
				} else {
					ViewPackages[vp][node.id] = true;
				}
			}
			if (AppCache.Properties) {
				const { properties } = node;
				if (properties) {
					Object.keys(properties).forEach((prop) => {
						const propValue = GetNodeProp(node, prop);
						AppCache.Properties[prop] = AppCache.Properties[prop] || {};
						AppCache.Properties[prop][propValue] = AppCache.Properties[prop][GetNodeProp(node, prop)] || {};
						AppCache.Properties[prop][propValue][node.id] = true;
					});
				}
			}
			AppCache.Version++;
		});
		recyclePropertyKeys();
	}
	if (graph && graph.linkLib) {
		const addNodeLinkIds = !graph.nodeLinkIds || !Object.keys(graph.nodeLinkIds).length;
		if (addNodeLinkIds) {
			graph.nodeLinkIds = {};
		}
		Object.keys(graph.linkLib).forEach((key) => {
			const linkType = GetLinkProperty(getLink(graph, { id: key }), LinkPropertyKeys.TYPE);
			if (linkType) {
				Links[linkType] = Nodes[linkType] || {};
				Links[linkType][key] = true;
				AppCache.Version++;
			}
			const { source, target } = graph.linkLib[key];
			graph.nodeLinkIds[source] = graph.nodeLinkIds[source] || {};
			graph.nodeLinkIds[source][target] = key;
		});
	}
}
function recyclePropertyKeys() {
	AppCache.PropertyKeys = Object.keys(AppCache.Properties).sort((a, b) => {
		return Object.keys(AppCache.Properties[a]).length - Object.keys(AppCache.Properties[b]).length;
	});
}
const runtimeState = {
	lastLropertyKeyRecycle: 0,
	recycleEveryProperty: 300
};

export function GetNodesByProperties(props: { [x: string]: any }, graph: { nodeLib: { [x: string]: any } }) {
	const orderedLookupProp = Object.keys(props).filter((x) => props[x] !== undefined).sort((a, b) => {
		return AppCache.PropertyKeys.indexOf(a) - AppCache.PropertyKeys.indexOf(b);
	});
	if (runtimeState.lastLropertyKeyRecycle > runtimeState.recycleEveryProperty) {
		recyclePropertyKeys();
		runtimeState.lastLropertyKeyRecycle = 0;
	}

	runtimeState.lastLropertyKeyRecycle++;

	let subset: any = null;
	orderedLookupProp.forEach((key) => {
		if (subset && subset.length === 0) {
			return;
		}
		const val = props[key];
		let set: { hasOwnProperty?: any };
		if (typeof val === 'function') {
			set = {};
			if (AppCache.Properties[key]) {
				Object.keys(AppCache.Properties[key]).filter((tempVal) => val(tempVal)).forEach((tempVal) => {
					set = Object.assign(set, AppCache.Properties[key][tempVal]);
				});
			}
		} else if (AppCache.Properties[key] && AppCache.Properties[key][val]) {
			set = {};
			set = Object.assign(set, AppCache.Properties[key][val]);
		} else {
			set = {};
		}
		if (!subset && set) {
			subset = set;
		} else if (subset && set) {
			const newset: any = {};
			const setToUse = Object.keys(subset).length > Object.keys(set).length ? set : subset;
			Object.keys(setToUse).forEach((setKey) => {
				if (set.hasOwnProperty(setKey) && subset.hasOwnProperty(setKey)) {
					newset[setKey] = true;
				}
			});
			subset = newset;
		}
	});
	if (!subset) {
		return [];
	}
	return Object.keys(subset).map((item) => graph.nodeLib[item]).filter((x) => x);
}
export function removeCacheLink(id: string | number, type: string | number) {
	if (AppCache.Links && AppCache.Links[type] && AppCache.Links[type][id]) {
		delete AppCache.Links[type][id];
		AppCache.Version++;
	}
}
export function updateCache(options: any, link?: GraphLink) {
	const { previous, value, id, prop } = options;
	if (link) {
		if (AppCache.Links && link.properties) {
			AppCache.Links[link.properties.type] = AppCache.Links[link.properties.type] || {};
			AppCache.Links[link.properties.type][id] = true;
		}
		AppCache.Version++;
	} else if (AppCache.Nodes) {
		if (!AppCache.Properties[prop]) {
			AppCache.Properties[prop] = {};
		}
		if (previous) {
			if (!AppCache.Properties[prop][previous]) {
				AppCache.Properties[prop][previous] = {};
			}
			AppCache.Properties[prop][previous][id] = false;
		}

		if (value !== undefined) {
			if (!AppCache.Properties[prop][value]) {
				AppCache.Properties[prop][value] = {};
			}
			AppCache.Properties[prop][value][id] = true;
		}

		switch (prop) {
			case NodeProperties.NODEType:
				if (previous) {
					if (AppCache.Nodes[previous]) {
						delete AppCache.Nodes[previous][id];
					}
				}
				if (value) {
					AppCache.Nodes[value] = AppCache.Nodes[value] || {};
					AppCache.Nodes[value][id] = false;
				}
				AppCache.Version++;
				break;
			case NodeProperties.ViewPackage:
				if (previous) {
					if (AppCache.ViewPackages[previous]) {
						delete AppCache.ViewPackages[previous][id];
					}
				}
				if (value) {
					AppCache.ViewPackages[value] = AppCache.ViewPackages[value] || {};
					AppCache.ViewPackages[value][id] = false;
				}
				AppCache.Version++;
				break;
			case NodeProperties.Pinned:
				if (value) {
					AppCache.Pinned[id] = true;
				} else {
					delete AppCache.Pinned[id];
				}
				AppCache.Version++;
				break;
			case NodeProperties.Selected:
				if (value) {
					AppCache.Pinned[id] = true;
				} else {
					delete AppCache.Pinned[id];
				}
				AppCache.Version++;
				break;
			default:
				break;
		}
	}
}

export function addGroup(
	graph: { groupLib: { [x: string]: any }; groups: any[] },
	group: { id: any; leaves?: any[]; groups?: any[]; properties?: {} }
) {
	graph.groupLib[group.id] = group;
	if (!fast) {
		graph.groupLib = { ...graph.groupLib };
	}
	if (fast) {
		if (graph.groups.indexOf(group.id) === -1) {
			graph.groups.push(group.id);
		}
	} else {
		graph.groups = [ ...graph.groups, group.id ].unique((x: any) => x);
	}
	if (fast) {
		return graph;
	}
	graph = { ...graph };
	return graph;
}

export function addNewPropertyNode(graph: any, options: any) {
	return addNewNodeOfType(graph, options, NodeTypes.Property);
}

const DEFAULT_PROPERTIES = [
	{ title: 'Owner', type: NodePropertyTypes.STRING },
	{ title: 'Id', type: NodePropertyTypes.STRING },
	{ title: 'Created', type: NodePropertyTypes.DATETIME },
	{ title: 'Updated', type: NodePropertyTypes.DATETIME },
	{ title: 'Deleted', type: NodePropertyTypes.BOOLEAN },
	{ title: 'Version', type: NodePropertyTypes.INT }
].map((t: any) => {
	t.nodeType = NodeTypes.Property;
	return t;
});

export function addDefaultProperties(graph: any, options: any) {
	// updateNodeProperty
	const propertyNodes = GetLinkChainFromGraph(graph, {
		id: options.parent,
		links: [
			{
				direction: SOURCE,
				type: LinkType.PropertyLink
			}
		]
	}).map((t: any) => GetNodeProp(t, NodeProperties.UIText));
	DEFAULT_PROPERTIES.filter((t) => propertyNodes.indexOf(t.title) === -1).forEach((dp: any) => {
		graph = addNewNodeOfType(graph, options, dp.nodeType, (new_node: any, _graph: any) => {
			_graph = updateNodeProperty(_graph, {
				id: new_node.id,
				prop: NodeProperties.UIText,
				value: dp.title
			});
			_graph = updateNodeProperty(_graph, {
				id: new_node.id,
				prop: NodeProperties.IsDefaultProperty,
				value: true
			});
			_graph = updateNodeProperty(_graph, {
				id: new_node.id,
				prop: NodeProperties.UIAttributeType,
				value: dp.type
			});
			_graph = updateNodeProperty(_graph, {
				id: new_node.id,
				prop: NodeProperties.Pinned,
				value: false
			});
			return _graph;
		});
	});

	return graph;
}

function updateNode(node: Node, options: { node: { properties: any } }) {
	if (options.node) {
		Object.keys(options.node.properties).forEach((propKey) => {
			if (node.properties[propKey] !== options.node.properties[propKey]) {
				node.properties[propKey] = options.node.properties[propKey];
				node.propertyVersions[propKey] = (node.propertyVersions[propKey] || 0) + 1;
			}
		});
		// Object.apply(node.properties, JSON.parse(JSON.stringify(options.node.properties)));
	}
}
let _viewPackageStamp: any = null;
let _view_package_key: any = null;
export function setViewPackageStamp(viewPackageStamp: any, key?: any) {
	if (!_viewPackageStamp || !viewPackageStamp)
		if (_view_package_key === key || !_view_package_key) {
			_viewPackageStamp = viewPackageStamp;
			_view_package_key = !_viewPackageStamp ? null : key;
		}
}
export function isStamped() {
	return !!_view_package_key;
}
export const Flags = {
	HIDE_NEW_NODES: 'HIDE_NEW_NODES'
};
const FunctionFlags: any = {};
const FunctionFlagKeys: any = {};
export function setFlag(hideNewNode: any, key: any, flag: any) {
	if (!FunctionFlags[flag] || !hideNewNode)
		if (FunctionFlagKeys[flag] === key || !FunctionFlagKeys[flag]) {
			FunctionFlags[flag] = hideNewNode;
			FunctionFlagKeys[flag] = !FunctionFlags[flag] ? null : key;
		}
}
export function isFlagged(flag: any): any {
	return FunctionFlags[flag];
}

export function addNewNodeOfType(graph: any, options: any, nodeType: any, callback?: any) {
	const { parent, linkProperties, groupProperties, skipGroup } = options;
	if (!callback) {
		callback = options.callback;
	}
	if (graph.links.length !== Object.keys(graph.linkLib).length) {
		console.error(`${graph.links.length} !== ${Object.keys(graph.linkLib).length}`);
		throw new Error('invalid grid links');
	}
	const node = createNode(nodeType);
	if (options.node) {
		updateNode(node, options);
		if (nodeType === NodeTypes.ReferenceNode) {
			if (options.rootNode) {
				options.rootNode.referenceNodes[graph.id] = {
					...options.rootNode.referenceNodes[graph.id] || {},
					...{
						[node.id]: options.node.id
					}
				};
			}
		}
	}
	graph = addNode(graph, node);
	if (graph.links.length !== Object.keys(graph.linkLib).length) {
		throw new Error('invalid grid links');
	}
	if (parent) {
		graph = newLink(graph, {
			source: parent,
			target: node.id,
			properties: linkProperties ? linkProperties.properties : null
		});
		if (graph.links.length !== Object.keys(graph.linkLib).length) {
			throw new Error('invalid grid links');
		}
	}
	graph = incrementBuild(graph);
	if (options.links) {
		options.links
			.filter((x: any) => x)
			.forEach(
				(link: {
					(arg0: any): any;
					find: (arg0: (x: any) => any) => any;
					target: any;
					linkProperties: { properties: any };
				}) => {
					if (typeof link === 'function') {
						link = link(graph);
						link = link.find((x: any) => x);
					}
					if (graph.links.length !== Object.keys(graph.linkLib).length) {
						throw new Error('invalid grid links');
					}
					graph = newLink(graph, {
						source: node.id,
						target: link.target,
						properties: link.linkProperties ? link.linkProperties.properties : null
					});
				}
			);
	}
	graph = updateNodeProperty(graph, {
		id: node.id,
		prop: NodeProperties.NODEType,
		value: nodeType
	});
	graph = updateNodeProperty(graph, {
		id: node.id,
		prop: NodeProperties.Pinned,
		value: true
	});
	if (isFlagged(Flags.HIDE_NEW_NODES)) {
		graph = updateNodeProperty(graph, {
			id: node.id,
			prop: NodeProperties.Pinned,
			value: false
		});
	}
	if (options.properties) {
		for (var p in options.properties) {
			graph = updateNodeProperty(graph, {
				id: node.id,
				prop: p,
				value: options.properties[p]
			});
		}
	}
	if (_viewPackageStamp) {
		for (var p in _viewPackageStamp) {
			graph = updateNodeProperty(graph, {
				id: node.id,
				prop: p,
				value: _viewPackageStamp[p]
			});
		}
	}
	let groupId = null;
	if (groupProperties) {
		if (!skipGroup) {
			graph = updateNodeGroup(graph, {
				id: node.id,
				groupProperties,
				parent,
				callback: (_gid: any) => {
					groupId = _gid;
				}
			});
		}
	}
	if (callback) {
		graph = callback(GetNodeById(node.id, graph), graph, groupId) || graph;
	}

	return graph;
}

export function updateNodeGroup(graph: any, options: any) {
	const { id, groupProperties, parent, callback, groupCallback } = options;
	var group: any = null;
	if (groupProperties && groupProperties.id) {
		group = getGroup(graph, groupProperties.id);
	} else if (!hasGroup(graph, parent)) {
		var group: any = createGroup();
		graph = addGroup(graph, group);
		graph = updateNodeProperty(graph, {
			id: parent,
			value: { group: group.id },
			prop: NodeProperties.Groups
		});
		graph = addLeaf(graph, { leaf: parent, id: group.id });
		const grandParent = GetNodeProp(graph.nodeLib[parent], NodeProperties.GroupParent);
		if (grandParent && graph.groupLib[grandParent]) {
			const gparentGroup = graph.groupLib[grandParent];
			if (gparentGroup) {
				const ancestores = getGroupAncenstors(graph, gparentGroup.id);
				graph = addGroupToGroup(graph, {
					id: gparentGroup.id,
					groupId: group.id
				});
				ancestores.forEach((anc: any) => {
					graph = addGroupToGroup(graph, {
						id: anc,
						groupId: group.id
					});
				});
			}
		}
	} else {
		const nodeGroupProp = GetNodeProp(graph.nodeLib[parent], NodeProperties.Groups);
		group = getGroup(graph, nodeGroupProp.group);
	}

	if (group) {
		graph = addLeaf(graph, { leaf: id, id: group.id });
		graph = updateNodeProperty(graph, {
			id,
			value: group.id,
			prop: NodeProperties.GroupParent
		});

		if (groupProperties) {
			for (const gp in groupProperties) {
				graph = updateGroupProperty(graph, {
					id: group.id,
					prop: gp,
					value: groupProperties[gp]
				});
			}
			if (callback) {
				callback(group.id);
			}
		}
		if (groupCallback && group) {
			groupCallback(group.id);
		}
	}

	return graph;
}
function getGroupAncenstors(graph: Graph, id: string): any {
	const result = [];
	if (graph.parentGroup[id]) {
		for (const i in graph.parentGroup[id]) {
			result.push(...getGroupAncenstors(graph, i));
		}
	}
	return result;
}
export function getGroup(graph: Graph, id: string) {
	return graph.groupLib[id];
}
export function hasGroup(graph: Graph, parent: string) {
	return !!(graph.nodeLib[parent] && GetNodeProp(graph.nodeLib[parent], NodeProperties.Groups));
}
export function GetNode(graph: Graph, id: string): Node | null {
	if (graph && graph.nodeLib) {
		return graph.nodeLib[id];
	}
	return null;
}

export function GetChildComponentAncestors(state: any, id: string) {
	const result = [];

	const graph = GetRootGraph(state);
	const ancestors = GetNodesLinkedTo(graph, {
		id,
		direction: TARGET
	})
		.filter((x: any) => {
			const nodeType = GetNodeProp(x, NodeProperties.NODEType);
			switch (nodeType) {
				case NodeTypes.ScreenOption:
				case NodeTypes.ComponentNode:
					return true;
				default:
					return false;
			}
		})
		.map((t: { id: any }) => t.id);

	result.push(...ancestors);
	ancestors.forEach((t: any) => {
		const temp = GetChildComponentAncestors(state, t);
		result.push(...temp);
	});
	return result.unique();
}
export function createComponentProperties() {
	return {
		properties: {},
		instanceTypes: {}
	};
}
export function addComponentProperty(props: any, ops: any) {
	const { modelType, modelProp, instanceType } = ops;
	if (props && props.properties) {
		props.properties[modelProp] = modelType;
		props.instanceTypes[modelProp] = instanceType;
	}
	return props;
}
export function removeComponentProperty(props: any, ops: any) {
	const { modelProp } = ops;
	if (props && props.properties) {
		delete props.properties[modelProp];
		delete props.instanceTypes[modelProp];
	}
	return props;
}

export function updateClientMethod(methodParams: any, key: any, param: any, mparam: any, value: any) {
	methodParams[key] = methodParams[key] || {};
	methodParams[key].parameters = methodParams[key].parameters || {};
	methodParams[key].parameters[param] = methodParams[key].parameters[param] || {};
	if (fast) {
		methodParams[key].parameters[param][mparam] = value;
	} else {
		methodParams[key].parameters[param] = {
			...methodParams[key].parameters[param],
			[mparam]: value
		};
	}

	return methodParams;
}

export function getClientMethod(methodParams: any, key: any, param: any, mparam: any) {
	if (
		methodParams &&
		methodParams[key] &&
		methodParams[key].parameters &&
		methodParams[key].parameters[param] &&
		methodParams[key].parameters[param][mparam]
	)
		return methodParams[key].parameters[param][mparam];

	return null;
}
export function getComponentPropertyList(props: any) {
	if (props && props.properties) {
		return Object.keys(props.properties).map((t) => ({
			title: t,
			id: props.properties[t],
			value: t
		}));
	}
	return [];
}
export function hasComponentProperty(props: any, prop: any) {
	return props && props.properties && props.properties.hasOwnProperty(prop);
}
export function getComponentProperty(props: any, prop: any, type: any = 'properties') {
	return props && props[type] && props[type][prop];
}
export function GetGroup(graph: any, id: any) {
	if (graph && graph.groupLib) {
		return graph.groupLib[id];
	}
	return null;
}

export function NodesByViewPackage(graph: any, viewPackage: any) {
	const currentGraph = graph;
	if (currentGraph) {
		if (!Array.isArray(viewPackage)) {
			viewPackage = [ viewPackage ];
		}
		if (AppCache && AppCache.Nodes) {
			const temp: any = [];
			viewPackage.forEach((nt: any) => {
				if (AppCache && AppCache.ViewPackages && AppCache.ViewPackages[nt]) {
					temp.push(...Object.keys(AppCache.ViewPackages[nt]));
				}
			});
			const res: any = [];
			temp.forEach((x: any) => {
				if (currentGraph.nodeLib[x]) {
					res.push(currentGraph.nodeLib[x]);
				}
			});
			return res;
		}
	}

	return [];
}

export function NodesByType(graph: any, nodeType: any, options: any = {}) {
	const currentGraph = graph;
	if (currentGraph) {
		if (!Array.isArray(nodeType)) {
			nodeType = [ nodeType ];
		}
		if (AppCache && AppCache.Nodes) {
			const temp: any = [];
			nodeType.forEach((nt: any) => {
				if (AppCache && AppCache.Nodes && AppCache.Nodes[nt]) {
					temp.push(...Object.keys(AppCache.Nodes[nt]));
				}
			});
			const res: any = [];
			temp.forEach((x: any) => {
				if (currentGraph.nodeLib[x]) {
					res.push(currentGraph.nodeLib[x]);
				}
			});
			return res;
		}

		return currentGraph.nodes
			.filter(
				(x: string | number) =>
					(currentGraph.nodeLib &&
						currentGraph.nodeLib[x] &&
						currentGraph.nodeLib[x].properties &&
						nodeType.indexOf(currentGraph.nodeLib[x].properties[NodeProperties.NODEType]) !== -1) ||
					(!options.excludeRefs &&
						currentGraph.nodeLib[x] &&
						currentGraph.nodeLib[x].properties &&
						currentGraph.nodeLib[x].properties[NodeProperties.ReferenceType] === nodeType)
			)
			.map((x: string | number) => currentGraph.nodeLib[x]);
	}
	return [];
}
export function existsLinkBetween(graph: any, options: any) {
	const { source, target, type, properties } = options;
	const link = findLink(graph, { source, target });

	if (link) {
		if (properties && Object.keys(properties).some((prop) => GetLinkProperty(link, prop) !== properties[prop])) {
			return false;
		}
		return GetLinkProperty(link, LinkPropertyKeys.TYPE) === type || !type;
	}
	return false;
}

export function existsLinksBetween(graph: any, options: any) {
	const { source, target1, target2 } = options;
	let link1 = findLink(graph, { source, target: target1.id });
	link1 = GetLinkProperty(link1, LinkPropertyKeys.TYPE) === target1.link;
	let link2 = findLink(graph, { source, target: target2.id });
	link2 = GetLinkProperty(link2, LinkPropertyKeys.TYPE) === target2.link;

	return !!link1 && !!link2;
}

export function updateReferenceNodes(root: any) {
	if (root && root.referenceNodes) {
		for (const scope in root.referenceNodes) {
			if (root.graphs && root.graphs[scope]) {
				const scopedGraph = root.graphs[scope];
				for (const nodeId in root.referenceNodes[scope]) {
					const masterNode = root.nodeLib[root.referenceNodes[scope][nodeId]];
					if (masterNode) {
						const refNode = GetNode(scopedGraph, nodeId);
						if (refNode) {
							// may be more properties later.
							refNode.properties.text = masterNode.properties.text;
							refNode.properties.referenceType = masterNode.properties.nodeType;
						}
					}
				}
			}
		}
	}

	return root;
}

export function RequiredClassName(cls: any, node_name: any) {
	return `${node_name}${cls}`;
}

export function applyFunctionConstraints(graph: any, options: any) {
	const { id, value } = options;
	const functionConstraints: any = null; // Functions[tempValue];
	if (functionConstraints) {
		if (functionConstraints.constraints) {
			if (graph.nodeConnections[id]) {
				getNodeFunctionConstraintLinks(graph, { id }).forEach((link) => {
					const link_constraints = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
					if (!hasMatchingConstraints(link_constraints, functionConstraints.constraints)) {
						const nodeToRemove = GetTargetNode(graph, link.id);

						if (nodeToRemove) {
							graph = removeNode(graph, { id: nodeToRemove.id });
						} else {
							console.warn('No nodes were removed as exepected');
						}
					}
				});
			}
			let core_group: any = null;
			let internal_group: any = null; // Internal scope group
			let external_group: any = null; // API Group
			const node = graph.nodeLib[id];

			const existingGroups = GetNodeProp(node, NodeProperties.Groups);

			if (existingGroups) {
				for (const i in existingGroups) {
					graph = clearGroup(graph, { id: existingGroups[i] });
				}
			}

			if (graph.nodesGroups[id]) {
				for (const i in graph.nodesGroups[id]) {
					switch (GetGroupProperty(graph.groupLib[i], GroupProperties.FunctionGroup)) {
						case FunctionGroups.Core:
							core_group = graph.groupLib[i];
							break;
					}
				}
			}

			if (!core_group) {
				graph = newGroup(graph, (_group: any) => {
					core_group = _group;
					graph = updateGroupProperty(graph, {
						id: _group.id,
						prop: GroupProperties.FunctionGroup,
						value: FunctionGroups.Core
					});
				});
			}

			if (!internal_group) {
				graph = newGroup(graph, (_group: any) => {
					internal_group = _group;
					graph = updateGroupProperty(graph, {
						id: _group.id,
						prop: GroupProperties.FunctionGroup,
						value: FunctionGroups.Internal
					});
				});
			}

			if (!external_group) {
				graph = newGroup(graph, (_group: { id: any }) => {
					external_group = _group;
					graph = updateGroupProperty(graph, {
						id: _group.id,
						prop: GroupProperties.FunctionGroup,
						value: FunctionGroups.External
					});
				});
			}

			if (!graph.groupsNodes[external_group.id] || !graph.groupsNodes[external_group.id][id]) {
				graph = addLeaf(graph, { leaf: id, id: external_group.id });
			}

			if (!graph.childGroups[internal_group.id] || !graph.childGroups[internal_group.id][external_group.id]) {
				graph = addGroupToGroup(graph, {
					groupId: internal_group.id,
					id: external_group.id
				});
			}

			if (!graph.childGroups[core_group.id] || !graph.childGroups[core_group.id][internal_group.id]) {
				graph = addGroupToGroup(graph, {
					groupId: core_group.id,
					id: internal_group.id
				});
			}

			const existMatchinLinks = getNodeFunctionConstraintLinks(graph, { id });
			const constraintKeys = existMatchinLinks.map((link) => {
				const link_constraints = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
				return findMatchingConstraints(link_constraints, functionConstraints.constraints);
			});

			Object.keys(functionConstraints.constraints).forEach((constraint) => {
				// Create links to new nodes representing those constraints.
				if (constraintKeys.indexOf(constraint) === -1) {
					graph = addNewNodeOfType(
						graph,
						{
							parent: node.id,
							linkProperties: {
								properties: {
									type: LinkType.FunctionConstraintLink,
									constraints: {
										...functionConstraints.constraints[constraint]
									}
								}
							}
						},
						NodeTypes.Parameter,
						(new_node: { id: any }) => {
							graph = updateNodeProperty(graph, {
								id: new_node.id,
								prop: NodeProperties.UIText,
								value: constraint
							});
						}
					);
				}
			});

			const nodes_with_link = getNodeFunctionConstraintLinks(graph, {
				id: node.id
			});

			nodes_with_link.forEach((link) => {
				const new_node = graph.nodeLib[link.target];
				const constraint = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
				if (
					constraint &&
					constraint.key &&
					functionConstraints.constraints[constraint.key] &&
					functionConstraints.constraints[constraint.key][FunctionConstraintKeys.IsInputVariable]
				) {
					graph = addLeaf(graph, { leaf: new_node.id, id: internal_group.id });
				} else {
					graph = addLeaf(graph, { leaf: new_node.id, id: core_group.id });
				}
			});

			if (graph.nodeConnections[id]) {
				Object.keys(graph.nodeConnections[id]).forEach((link) => {
					// check if link has a constraint attached.
					const { properties } = graph.linkLib[link];
					const _link = graph.linkLib[link];
					if (properties) {
						const { constraints } = properties;
						if (constraints) {
							Object.keys(FunctionTemplateKeys).forEach((ftk) => {
								const functionTemplateKey = FunctionTemplateKeys[ftk];
								const constraintObj = functionConstraints.constraints[functionTemplateKey];
								if (
									constraintObj &&
									_link &&
									_link.properties &&
									_link.properties.constraints &&
									_link.properties.constraints.key
								) {
									if (_link.properties.constraints.key === constraintObj.key) {
										const valid = FunctionMeetsConstraint.meets(
											constraintObj,
											constraints,
											_link,
											node,
											graph
										);
										graph = updateLinkProperty(graph, {
											id: _link.id,
											prop: LinkPropertyKeys.VALID_CONSTRAINTS,
											value: !!valid
										});
									}
								}
							});
						}
					}
				});
			}
			graph = updateNodeProperty(graph, {
				id,
				prop: NodeProperties.Groups,
				value: {
					core: core_group.id,
					internal: internal_group.id,
					external: external_group.id
				}
			});
		}
	}

	return graph;
}

function hasMatchingConstraints(linkConstraint: any, functionConstraints: any) {
	return !!findMatchingConstraints(linkConstraint, functionConstraints);
}
function findMatchingConstraints(linkConstraint: any, functionConstraints: { [x: string]: any }) {
	const lcj = JSON.stringify(linkConstraint);
	return Object.keys(functionConstraints).find((f) => JSON.stringify(functionConstraints[f]) === lcj);
}

function getNodeFunctionConstraintLinks(graph: any, options: any) {
	const { id } = options;
	if (graph && graph.nodeConnections && graph.nodeConnections[id]) {
		return Object.keys(graph.nodeConnections[id])
			.filter(
				(link) =>
					GetLinkProperty(graph.linkLib[link], LinkPropertyKeys.TYPE) === LinkType.FunctionConstraintLink
			)
			.map((link) => graph.linkLib[link]);
	}

	return [];
}

export const FunctionMeetsConstraint = {
	meets: (constraintObj: any, constraints: any, link: any, node: any, graph: any) => {
		if (constraintObj) {
			const _targetNode = graph.nodeLib[link.target];
			const nextNodes = getNodesLinkedTo(graph, { id: _targetNode.id });
			return nextNodes.find((targetNode) =>
				Object.keys(constraintObj).find((constraint) => {
					let result = true;
					// if (result === false) {
					// 	return;
					// }
					switch (constraint) {
						// Instance variable are always ok
						// case FunctionConstraintKeys.IsInstanceVariable:
						//     result = true;
						//     break;
						case FunctionConstraintKeys.IsAgent:
							if (targetNode) {
								if (!GetNodeProp(targetNode, NodeProperties.IsAgent)) {
									result = false;
								}
							} else {
								result = false;
							}
							break;
						case FunctionConstraintKeys.IsUser:
							if (targetNode) {
								if (!GetNodeProp(targetNode, NodeProperties.IsUser)) {
									result = false;
								}
							} else {
								result = false;
							}
							break;
						case FunctionConstraintKeys.IsTypeOf:
							// If it is an input variable, then we will all anything.
							if (!constraintObj[FunctionConstraintKeys.IsInputVariable]) {
								if (targetNode) {
									const targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
									const targetConstraint = constraintObj[constraint]; // FunctionConstraintKeys.Model
									// The targetNodeType should match the other node.
									const linkWithConstraints = findLinkWithConstraint(
										node.id,
										graph,
										targetConstraint
									);
									if (linkWithConstraints.length) {
										const links = linkWithConstraints.filter((linkWithConstraint) => {
											const nodeToMatchWith = graph.nodeLib[linkWithConstraint.target];
											const nodeToMatchWithType = GetNodeProp(
												nodeToMatchWith,
												NodeProperties.NODEType
											);
											return nodeToMatchWithType !== targetNodeType;
										});
										if (links.length === 0) {
											result = false;
										}
									} else {
										result = false;
									}
								} else {
									result = false;
								}
							}
							break;
						case FunctionConstraintKeys.IsChild:
							if (targetNode) {
								// let targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
								const targetConstraint = constraintObj[constraint]; // FunctionConstraintKeys.Model
								// The targetNodeType should match the other node.
								const linkWithConstraints = findLinkWithConstraint(node.id, graph, targetConstraint);
								if (linkWithConstraints) {
									const links = linkWithConstraints.filter((linkWithConstraint) => {
										const nodeToMatchWith = graph.nodeLib[linkWithConstraint.target];
										const linkToParentParameter = getNodeLinkedTo(graph, {
											id: nodeToMatchWith.id
										});
										if (linkToParentParameter && linkToParentParameter.length) {
											const relationshipLink = findLink(graph, {
												target: targetNode.id,
												source: linkToParentParameter[0].id
											});
											if (
												!relationshipLink ||
												GetLinkProperty(relationshipLink, LinkPropertyKeys.TYPE) !==
													LinkProperties.ParentLink.type
											) {
												return false;
											}
										} else {
											return false;
										}
										return true;
									});

									if (links.length === 0) {
										result = false;
									}
								} else {
									result = false;
								}
							} else {
								result = false;
							}
							break;
						case FunctionConstraintKeys.IsParent:
							if (targetNode) {
								// let targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
								const targetConstraint = constraintObj[constraint]; // FunctionConstraintKeys.Model
								// The targetNodeType should match the other node.
								const linkWithConstraints = findLinkWithConstraint(node.id, graph, targetConstraint);
								if (linkWithConstraints) {
									const links = linkWithConstraints.filter((linkWithConstraint) => {
										const nodeToMatchWith = graph.nodeLib[linkWithConstraint.target];
										const linkToParentParameter = getNodeLinkedTo(graph, {
											id: nodeToMatchWith.id
										});
										if (linkToParentParameter && linkToParentParameter.length) {
											const relationshipLink = findLink(graph, {
												target: targetNode.id,
												source: linkToParentParameter[0].id
											});
											if (
												!relationshipLink ||
												GetLinkProperty(relationshipLink, LinkPropertyKeys.TYPE) !==
													LinkProperties.ParentLink.type
											) {
												return false;
											}
										} else {
											return false;
										}
										return true;
									});

									if (links.length === 0) {
										result = false;
									}
								} else {
									result = false;
								}
							} else {
								result = false;
							}
							break;
					}

					return result;
				})
			);
		}

		return false;
	}
};
function findLinkWithConstraint(
	nodeId: string | number,
	graph: { nodeConnections: { [x: string]: { [x: string]: string } }; linkLib: { [x: string]: any } },
	targetConstraint: any
) {
	return Object.keys(graph.nodeConnections[nodeId])
		.filter((t) => graph.nodeConnections[nodeId][t] === SOURCE)
		.filter((link) => {
			if (
				link &&
				graph.linkLib &&
				graph.linkLib[link] &&
				graph.linkLib[link].properties &&
				graph.linkLib[link].properties.constraints &&
				graph.linkLib[link].properties.constraints.key === targetConstraint
			) {
				return graph.linkLib[link];
			}
			return false;
		})
		.map((link) => graph.linkLib[link]);
}
export function getNodeLinks(graph: Graph, id: string, direction?: any) {
	if (graph && graph.nodeConnections && graph.nodeConnections[id]) {
		return Object.keys(graph.nodeConnections[id])
			.filter((x) => {
				if (direction) {
					return graph.nodeConnections[id][x] === direction;
				}
				return true;
			})
			.map((link) => graph.linkLib[link]);
	}
	return [];
}
export function findLink(graph: any, options: any) {
	const { target, source } = options;
	if (graph.nodeLinkIds && graph.nodeLinkIds[source] && graph.nodeLinkIds[source][target]) {
		const linkId = graph.nodeLinkIds[source][target];
		if (linkId && graph.linkLib[linkId]) {
			return graph.linkLib[linkId];
		}
	}
	// const res = graph.links.find(link => (
	//   graph.linkLib &&
	//   graph.linkLib[link] &&
	//   graph.linkLib[link].target === target &&
	//   graph.linkLib[link].source === source
	// ));
	// if (res) {
	//   return graph.linkLib[res];
	// }
	return null;
}
export function newLink(graph: Graph, options: any) {
	const { target, source, properties } = options;
	const link = createLink(target, source, properties);
	return addLink(graph, options, link);
}

export function GetTargetNode(graph: Graph, linkId: string) {
	if (graph && graph.linkLib && graph.linkLib[linkId]) {
		const target = graph.linkLib[linkId].target;
		return graph.nodeLib[target];
	}
	return null;
}

export function getNodesLinkedFrom(graph: Graph, options: any) {
	return getNodeLinked(graph, { ...options || {}, direction: TARGET });
}
export function getNodesLinkedTo(graph: Graph, options: any) {
	return getNodeLinkedTo(graph, options);
}
export function getNodeLinkedTo(graph: any, options: any) {
	return getNodeLinked(graph, { ...options || {}, direction: SOURCE });
}
export function matchOneWay(obj1: { [x: string]: any }, obj2: { [x: string]: any }) {
	if (obj1 === obj2) {
		return true;
	}
	if (!obj1) {
		return false;
	}
	if (!obj2) {
		return false;
	}
	for (const i in obj1) {
		if (obj1[i] !== obj2[i]) {
			return false;
		}
	}
	return true;
}
export function matchObject(obj1: { [x: string]: any }, obj2: { [x: string]: any }) {
	if (Object.keys(obj1).length !== Object.keys(obj2).length) {
		return false;
	}
	for (const i in obj1) {
		if (obj1[i] !== obj2[i]) {
			return false;
		}
	}

	return true;
}
export function GetLinkByNodes(graph: any, options: any) {
	const { source, target } = options;
	return [ findLink(graph, { target, source }) ];
	// return Object.values(graph.linkLib).find(t => t.source === source && t.target === target);
}
export function GetLinkChainItem(
	state: any,
	options: { id: any; links: { direction: string; type: string }[] | { direction: string; type: string }[] }
) {
	const chains = GetLinkChain(state, options);

	if (chains && chains.length) {
		return chains[0];
	}
	return null;
}
export function SetAffterEffectProperty(currentNode: any, afterMethod: any, key: any, value: any) {
	const afterEffectSetup = GetNodeProp(currentNode, NodeProperties.AfterMethodSetup) || {};
	afterEffectSetup[afterMethod] = afterEffectSetup[afterMethod] || {};
	afterEffectSetup[afterMethod] = {
		...afterEffectSetup[afterMethod],
		...{ [key]: value }
	};
	return afterEffectSetup;
}
export function GetAffterEffectProperty(currentNode: any, afterMethod: any, key: any) {
	const afterEffectSetup = GetNodeProp(currentNode, NodeProperties.AfterMethodSetup);
	if (afterEffectSetup && afterEffectSetup[afterMethod] && afterEffectSetup[afterMethod][key])
		return afterEffectSetup[afterMethod][key];
	return null;
}
export function GetMethodNode(state: any, id: any) {
	const graph = GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id
	}).find((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Method);
}
export function GetPermissionNode(state: any, id: any) {
	const graph = GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id
	}).find((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Permission);
}
export function GetConditionNodes(state: any, id: any) {
	const graph = GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Condition);
}
export function GetConnectedNodesByType(state: any, id: any, type: any, direction?: any) {
	const graph = GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id,
		direction
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === type);
}
export function GetDataChainEntryNodes(state: any, cs: any) {
	const graph = GetRootGraph(state);
	return NodesByType(graph, NodeTypes.DataChain).filter(
		(x: any) =>
			(!cs && GetNodeProp(x, NodeProperties.EntryPoint)) || (cs && GetNodeProp(x, NodeProperties.CSEntryPoint))
	);
}
export function GetConnectedNodeByType(state: any, id: any, type: any, direction: any, graph: any) {
	if (!Array.isArray(type)) {
		type = [ type ];
	}
	graph = graph || GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id,
		direction
	}).find((x: any) => {
		const ntype = GetNodeProp(x, NodeProperties.NODEType);
		return type.some((v: any) => v === ntype);
	});
}
export function GetValidationNode(state: any, id: any) {
	const graph = GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id
	}).find((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Validator);
}
export function GetDataSourceNode(state: any, id: any) {
	const graph = GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id
	}).find((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.DataSource);
}
export function GetModelItemFilter(state: any, id: any) {
	const graph = GetRootGraph(state);
	return GetNodesLinkedTo(graph, {
		id
	}).find((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ModelItemFilter);
}
export function GetLinkChain(state: any, options: any): any {
	const graph = GetCurrentGraph(state);
	return GetLinkChainFromGraph(graph, options);
}
export function GetLinkChainFromGraph(graph: Graph, options: any, nodeType?: any): any {
	const { id, links } = options;
	let ids = [ id ];
	let result: any = [];
	links.forEach((op: any, il: any) => {
		let newids: any = [];
		ids.forEach((i) => {
			const newnodes = getNodesByLinkType(graph, {
				id: i,
				...op
			});
			if (il === links.length - 1) {
				result = newnodes;
			} else {
				newids = [ ...newids, ...newnodes.map((t: any) => t.id) ];
			}
		});
		newids = newids.unique((x: any) => x);
		ids = newids;
	});
	return result.filter((x: any) => {
		if (!nodeType) {
			return true;
		}
		return nodeType.indexOf(GetNodeProp(x, NodeProperties.NODEType)) !== -1;
	});
}
export function getNodesLinkTypes(graph: Graph, options: any) {
	if (options) {
		const { id } = options;
		const links = graph.nodeConnections[id] || {};
		const groups = Object.keys(links).groupBy((x: string | number) =>
			GetLinkProperty(graph.linkLib[x], LinkPropertyKeys.TYPE)
		);
		return Object.keys(groups);
	}
	return [];
}
export function getNodesByLinkType(graph: Graph, options: any) {
	if (options) {
		const { id, direction, type, exist } = options;
		if (graph && graph.nodeConnections && id) {
			const nodeLinks = graph.nodeConnections[id];
			if (nodeLinks) {
				return Object.keys(nodeLinks)
					.filter((x) => nodeLinks[x])
					.map((_id) => {
						const target = graph.linkLib[_id]
							? direction === TARGET ? graph.linkLib[_id].source : graph.linkLib[_id].target
							: null;

						if (!target) {
							console.warn('Missing value in linkLib');
							return null;
						}
						if (exist && graph.linkLib[_id].properties && graph.linkLib[_id].properties.exist) {
							return graph.nodeLib[target];
						}
						if (
							!type ||
							(graph.linkLib[_id].properties &&
								(graph.linkLib[_id].properties.type === type || graph.linkLib[_id].properties[type]))
						) {
							return graph.nodeLib[target];
						}
						return null;
					})
					.filter((x) => x);
			}
		}
	}

	return [];
}

export function GetLinkBetween(a: any, b: any, graph: any) {
	return findLink(graph, {
		source: a,
		target: b
	});
	// return getNodeLinks(graph, a, SOURCE).find(v => v.target === b);
}
export function getNodeLinked(graph: any, options: any) {
	if (options) {
		const { id, direction, constraints } = options;
		if (graph && graph.nodeConnections && id) {
			const nodeLinks = graph.nodeConnections[id];
			if (nodeLinks) {
				return Object.keys(nodeLinks)
					.filter((x) => nodeLinks[x] === direction)
					.map((_id) => {
						const target = graph.linkLib[_id]
							? direction === TARGET ? graph.linkLib[_id].source : graph.linkLib[_id].target
							: null;
						if (!target) {
							console.warn('Missing value in linkLib');
							return null;
						}
						if (constraints) {
							const link = graph.linkLib[_id];
							const link_constraints = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
							if (matchOneWay(constraints, link_constraints)) {
								return graph.nodeLib[target];
							}
							return null;
						}
						return graph.nodeLib[target];
					})
					.filter((x) => x);
			}
		}
	}
	return [];
}
export function GetNodeLinkedTo(graph: any, options: any) {
	return GetNodesLinkedTo(graph, options)[0];
}
export function GetLinkedNodes(graph: any, options: any) {
	const { id } = options;
	graph = graph || GetCurrentGraph();
	if (graph && graph.nodeLinks && id) {
		const nodeLinks = graph.nodeLinks[id];
		return { ...nodeLinks };
	}

	return {};
}

export function GetLinksForNode(graph: any, options: any): any {
	if (options) {
		graph = graph || GetCurrentGraph();
		const { id, direction, link, componentType, properties } = options;
		if (graph && graph.nodeConnections && id) {
			const nodeLinks = graph.nodeConnections[id];
			if (nodeLinks) {
				return Object.keys(nodeLinks)
					.map((_id) => {
						let target = null;
						if (link) {
							if (GetLinkProperty(graph.linkLib[_id], LinkPropertyKeys.TYPE) !== link) {
								return null;
							}
							if (properties) {
								for (const prop in properties) {
									if (properties[prop] !== GetLinkProperty(graph.linkLib[_id], prop)) {
										return null;
									}
								}
							}
						}
						if (graph.linkLib[_id]) {
							return graph.linkLib[_id];
						}
						return false;
					})
					.filter((x) => x);
			}
		}
	}
	return [];
}

export function GetNodesLinkedTo(graph: any, options: any): any {
	if (options) {
		graph = graph || GetCurrentGraph();
		const { id, direction, link, componentType, properties } = options;
		if (graph && graph.nodeConnections && id) {
			const nodeLinks = graph.nodeConnections[id];
			if (nodeLinks) {
				return Object.keys(nodeLinks)
					.map((_id) => {
						let target = null;
						if (link) {
							if (GetLinkProperty(graph.linkLib[_id], LinkPropertyKeys.TYPE) !== link) {
								return null;
							}
							if (properties) {
								for (const prop in properties) {
									if (properties[prop] !== GetLinkProperty(graph.linkLib[_id], prop)) {
										return null;
									}
								}
							}
						}
						if (graph.linkLib[_id]) {
							if (graph.linkLib[_id].source !== id) {
								if (!direction || direction === TARGET) target = graph.linkLib[_id].source;
							} else if (!direction || direction === SOURCE) target = graph.linkLib[_id].target;
						}

						if (!target) {
							// console.warn('Missing value in linkLib');
							return null;
						}
						return graph.nodeLib[target];
					})
					.filter((x) => x)
					.filter((x) => {
						if (componentType) {
							return GetNodeProp(x, NodeProperties.NODEType) === componentType;
						}
						return true;
					});
			}
		}
	}
	return [];
}

export const SOURCE = 'SOURCE';
export const TARGET = 'TARGET';
const fast = true;
export function addLink(
	graph: Graph,
	options: { target: any; source: any },
	link: { id: any; source: any; target: any; properties: any }
): Graph {
	const { target, source } = options;
	if (graph.links.length !== Object.keys(graph.linkLib).length) {
		throw new Error('invalid grid links');
	}

	if (target && source && target !== source) {
		if (graph.nodeLib[target] && graph.nodeLib[source]) {
			if (noSameLink(graph, { target, source })) {
				graph.linkLib[link.id] = link;
				if (!fast) {
					graph.linkLib = { ...graph.linkLib };
					graph.links = [ ...graph.links, link.id ];
				} else if (graph.links.indexOf(link.id) === -1) {
					graph.links.push(link.id);
				}

				updateCache(options, link);
				// Keeps track of the links for each node.
				if (fast) {
					if (!graph.nodeConnections[link.source]) {
						graph.nodeConnections[link.source] = {};
					}
					graph.nodeConnections[link.source][link.id] = SOURCE;
				} else {
					graph.nodeConnections[link.source] = {
						...graph.nodeConnections[link.source] || {},
						...{
							[link.id]: SOURCE
						}
					};
				}

				if (fast) {
					if (!graph.nodeConnections[link.target]) {
						graph.nodeConnections[link.target] = {};
					}
					graph.nodeConnections[link.target][link.id] = TARGET;
				} else {
					// Keeps track of the links for each node.
					graph.nodeConnections[link.target] = {
						...graph.nodeConnections[link.target] || {},
						...{
							[link.id]: TARGET
						}
					};
				}

				if (fast) {
					if (!graph.nodeLinks[link.source]) {
						graph.nodeLinks[link.source] = {};
					}
					graph.nodeLinks[link.source][link.target] = graph.nodeLinks[link.source]
						? (graph.nodeLinks[link.source][link.target] || 0) + 1
						: 1;
				} else {
					// Keeps track of the number of links between nodes.
					graph.nodeLinks[link.source] = {
						...graph.nodeLinks[link.source] || {},
						...{
							[link.target]: graph.nodeLinks[link.source]
								? (graph.nodeLinks[link.source][link.target] || 0) + 1
								: 1
						}
					};
				}
				if (!graph.nodeLinkIds[link.source]) {
					graph.nodeLinkIds[link.source] = {};
				}
				graph.nodeLinkIds[link.source][link.target] = link.id;

				if (fast) {
					if (!graph.nodeLinks[link.target]) {
						graph.nodeLinks[link.target] = {};
					}
					graph.nodeLinks[link.target][link.source] = graph.nodeLinks[link.target]
						? (graph.nodeLinks[link.target][link.source] || 0) + 1
						: 1;
				} else {
					// Keeps track of the number of links between nodes.
					graph.nodeLinks[link.target] = {
						...graph.nodeLinks[link.target],
						...{
							[link.source]: graph.nodeLinks[link.target]
								? (graph.nodeLinks[link.target][link.source] || 0) + 1
								: 1
						}
					};
				}
			} else {
				const oldLink = findLink(graph, { target, source });
				if (oldLink) {
					//  the type won't change onces its set
					// But the other properties can be
					oldLink.properties = {
						...oldLink.properties,
						...link.properties,
						...{ type: oldLink.properties.type }
					};
				}
			}
			if (!fast) {
				graph.nodeLinks = { ...graph.nodeLinks };
				graph = { ...graph };
			}
		}
		graph = incrementMinor(graph);
	}

	if (graph.links.length !== Object.keys(graph.linkLib).length) {
		throw new Error('invalid grid links');
	}

	return graph;
}
export function addLinksBetweenNodes(graph: any, options: any) {
	const { links } = options;
	if (links && links.length) {
		links.forEach((link: any) => {
			graph = addLinkBetweenNodes(graph, link);
		});
	}
	return graph;
}
export function addLinkBetweenNodes(graph: any, options: any) {
	const { target, source, properties } = options;
	if (target !== source && target) {
		const link = createLink(target, source, properties);
		return addLink(graph, options, link);
	}
	return graph;
}
function compareLinkProp(properties: { [x: string]: any }, link: { properties: { [x: string]: any } }) {
	for (const i in properties) {
		if (!link.properties || link.properties[i] !== properties[i]) {
			if (typeof link.properties[i] === 'object') {
				return JSON.stringify(link.properties) === JSON.stringify(properties);
			}
			return false;
		}
	}
	return true;
}
export function findLinkInstance(graph: any, options: any) {
	const { target, source, properties } = options;
	if (properties) {
		if (target && source) {
			const linkObject = findLink(graph, { target, source });
			if (linkObject && linkObject.properties) {
				if (!compareLinkProp(properties, linkObject)) {
					return false;
				}
				return linkObject.id;
			}
		}
		const link = graph.links.find((x: any) => {
			if (graph.linkLib[x].source === source && graph.linkLib[x].target === target) {
				// for (const i in properties) {
				//   if (
				//     !graph.linkLib[x].properties ||
				//     graph.linkLib[x].properties[i] !== properties[i]
				//   ) {
				//     if (typeof graph.linkLib[x].properties[i] === "object") {
				//       return (
				//         JSON.stringify(graph.linkLib[x].properties) ===
				//         JSON.stringify(properties)
				//       );
				//     }
				//     return false;
				//   }
				if (!compareLinkProp(properties, graph.linkLib[x])) {
					return false;
				}

				return true;
			}
			return false;
		});
		return link;
	}
	const link =
		graph && graph.links
			? graph.links.find(
					(x: string | number) =>
						graph.linkLib[x] && graph.linkLib[x].source === source && graph.linkLib[x].target == target
				)
			: null;
	return link;
}
export function getLinkInstance(graph: any, options: any) {
	const linkId = findLinkInstance(graph, options);
	if (linkId) {
		return graph.linkLib[linkId];
	}
	return null;
}
export function getLink(graph: any, options: any) {
	const { id } = options;
	if (id && graph && graph.linkLib) {
		return graph.linkLib[id];
	}
	return null;
}
export function getAllLinksWithNode(graph: any, id: any) {
	return graph.links.filter((x: string | number) => {
		if (!graph.linkLib[x]) {
			delete graph.linkLib[x];
		}
		return graph.linkLib[x] && (graph.linkLib[x].source === id || graph.linkLib[x].target === id);
	});
}
export function removeLinkBetweenNodes(graph: any, options: any, callback?: any) {
	const link = findLinkInstance(graph, options);
	if (callback) {
		callback(link);
	}
	return removeLink(graph, link, options);
}
export function removeLinkById(graph: any, options: any) {
	const link = graph.linkLib[options.id];
	return removeLink(graph, link);
}
export function executeEvents(graph: any, link: any, evt: any) {
	switch (evt) {
		case LinkEvents.Remove:
			graph = executeRemoveEvents(graph, link);
			break;
	}
	return graph;
}
export const EventFunctions: any = {};
export function addEventFunction(key: string, func: any) {
	EventFunctions[key] = func;
}
export function removeEventFunction(key: string | number) {
	delete EventFunctions[key];
}
export function executeRemoveEvents(graph: any, link: { properties: { on: { [x: string]: any[] } } }) {
	if (link && link.properties && link.properties.on && link.properties.on[LinkEvents.Remove]) {
		link.properties.on[LinkEvents.Remove].forEach((args: { function: string | number }) => {
			if (args.function && EventFunctions[args.function]) {
				graph = EventFunctions[args.function](graph, link, args.function, args);
			}
		});
	}
	return graph;
}
export function isUIExtensionEnumerable(node: any) {
	const _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
	if (_node && _node.config) {
		return _node.config.isEnumeration;
	}
}
export function GetUIExentionEnumeration(node: any) {
	if (isUIExtensionEnumerable(node)) {
		const _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
		return _node.config.list;
	}
	return null;
}
export function GetUIExentionKeyField(node: any) {
	if (isUIExtensionEnumerable(node)) {
		const _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
		return _node.config.keyField;
	}
	return null;
}
addEventFunction('OnRemoveValidationPropConnection', (graph: any, link: any) => {
	const { source, target } = link;
	const node = GetNode(graph, source);
	if (node && node.properties)
		removeValidator(GetNodeProp(node, NodeProperties.Validator), {
			id: target
		});
	return graph;
});
addEventFunction('OnRemoveExecutorPropConnection', (graph: any, link: any) => {
	const { source, target } = link;
	const node = GetNode(graph, source);
	if (node && node.properties) removeValidator(GetNodeProp(node, NodeProperties.Executor), { id: target });
	return graph;
});

addEventFunction('OnRemoveModelFilterPropConnection', (graph: any, link: any) => {
	const { source, target } = link;
	const node = GetNode(graph, source);
	if (node && node.properties)
		removeValidator(GetNodeProp(node, NodeProperties.FilterModel), {
			id: target
		});
	return graph;
});

addEventFunction('OnRemoveValidationItemPropConnection', (graph: any, link: any, func: any, args: any) => {
	const { source, target } = link;
	const node = GetNode(graph, source);
	const { property, validator } = args || {};

	const _validator = GetNodeProp(node, NodeProperties.Validator);
	if (
		node &&
		node.properties &&
		_validator.properties &&
		_validator.properties[property] &&
		_validator.properties[property].validators &&
		_validator.properties[property].validators[validator] &&
		_validator.properties[property].validators[validator].node === target
	) {
		removeValidatorItem(_validator, { ...args, id: target });
	}
	return graph;
});

addEventFunction('OnRemoveExecutorItemPropConnection', (graph: any, link: any, func: any, args: any) => {
	const { source, target } = link;
	const node = GetNode(graph, source);
	const { property, validator } = args || {};

	const _validator = GetNodeProp(node, NodeProperties.Executor);
	if (
		node &&
		node.properties &&
		_validator.properties &&
		_validator.properties[property] &&
		_validator.properties[property].validators &&
		_validator.properties[property].validators[validator] &&
		_validator.properties[property].validators[validator].node === target
	) {
		removeValidatorItem(_validator, { ...args, id: target });
	}
	return graph;
});

export function removeValidatorItem(
	_validator: { properties: { [x: string]: { validators: { [x: string]: any } } } },
	options: { property: any; validator: any }
) {
	const { property, validator } = options;
	delete _validator.properties[property].validators[validator];
}
export function createEventProp(type: string, options = {}) {
	const res: any = { on: {} };
	switch (type) {
		case LinkEvents.Remove:
			res.on[type] = [
				{
					...options
				}
			];
			break;
	}

	return res;
}
export function removeLink(graph: any, link: any, options: any = {}) {
	if (graph.links.length !== Object.keys(graph.linkLib).length) {
		throw new Error('invalid grid links');
	}

	if (link && options.linkType) {
		const update_link = graph.linkLib[link];
		if (update_link && update_link.properties && update_link.properties[options.linkType]) {
			delete update_link.properties[options.linkType];

			// If only the type is on the property
		}
		if (update_link && update_link.properties && Object.keys(update_link.properties).length > 1) {
			if (graph.links.length !== Object.keys(graph.linkLib).length) {
				throw new Error('invalid grid links');
			}
			if (fast) {
				return graph;
			}
			return { ...graph };
		}
	}
	if (link) {
		graph.links = graph.links.filter((x: any) => x !== link);
		const del_link = graph.linkLib[link];
		if (del_link.properties) {
			if (del_link.properties.on && del_link.properties.on[LinkEvents.Remove]) {
				graph = executeEvents(graph, del_link, LinkEvents.Remove);
			}
		}
		if (graph.linkLib[link] && graph.linkLib[link].properties) {
			removeCacheLink(link, graph.linkLib[link].properties.type);
		}
		if (graph.linkLib[link]) {
			const { source, target } = graph.linkLib[link];
			if (source && target && graph.nodeLinkIds[source] && graph.nodeLinkIds[source][target]) {
				delete graph.nodeLinkIds[source][target];
			}
		}
		delete graph.linkLib[link];

		graph.linkLib = { ...graph.linkLib };
		graph.nodeLinks[del_link.source] = {
			...graph.nodeLinks[del_link.source],
			...{
				[del_link.target]: graph.nodeLinks[del_link.source]
					? (graph.nodeLinks[del_link.source][del_link.target] || 0) - 1
					: 0
			}
		};
		if (graph.nodeLinks[del_link.source] && !graph.nodeLinks[del_link.source][del_link.target]) {
			delete graph.nodeLinks[del_link.source][del_link.target];
			if (Object.keys(graph.nodeLinks[del_link.source]).length === 0) {
				delete graph.nodeLinks[del_link.source];
			}
		}
		graph.nodeLinks[del_link.target] = {
			...graph.nodeLinks[del_link.target],
			...{
				[del_link.source]: graph.nodeLinks[del_link.target]
					? (graph.nodeLinks[del_link.target][del_link.source] || 0) - 1
					: 0
			}
		};
		if (graph.nodeLinks[del_link.target] && !graph.nodeLinks[del_link.target][del_link.source]) {
			delete graph.nodeLinks[del_link.target][del_link.source];
			if (Object.keys(graph.nodeLinks[del_link.target]).length === 0) {
				delete graph.nodeLinks[del_link.target];
			}
		}

		// Keeps track of the links for each node.
		if (graph.nodeConnections[del_link.source] && graph.nodeConnections[del_link.source][del_link.id]) {
			delete graph.nodeConnections[del_link.source][del_link.id];
		}
		if (Object.keys(graph.nodeConnections[del_link.source]).length === 0) {
			delete graph.nodeConnections[del_link.source];
		}

		// Keeps track of the links for each node.
		if (graph.nodeConnections[del_link.target] && graph.nodeConnections[del_link.target][del_link.id]) {
			delete graph.nodeConnections[del_link.target][del_link.id];
		}
		if (Object.keys(graph.nodeConnections[del_link.target]).length === 0) {
			delete graph.nodeConnections[del_link.target];
		}
		graph = incrementMinor(graph);
	}
	if (graph.links.length !== Object.keys(graph.linkLib).length) {
		throw new Error('invalid grid links');
	}
	if (fast) {
		return graph;
	}
	return { ...graph };
}
export function updateNodeText(graph: any, options: any) {
	const { id, value } = options;
	if (id && graph.nodeLib && graph.nodeLib[id]) {
		graph.nodeLib[id] = {
			...graph.nodeLib[id],
			...{
				_properties: {
					...graph.nodeLib[id].properties || {},
					i: value
				},
				get properties() {
					return this._properties;
				},
				set properties(value) {
					this._properties = value;
				}
			}
		};
	}
}
export function updateAppSettings(graph: any, options: any) {
	const { prop, value } = options;
	if (prop && value) {
		graph.appConfig = graph.appConfig || {};
		graph.appConfig.AppSettings = graph.appConfig.AppSettings || {};
		graph.appConfig.AppSettings[prop] = value;
	}
	return graph;
}

export function updateNodeProperties(graph: any, options: any) {
	const { properties, id } = options || {};
	if (properties) {
		for (const i in properties) {
			graph = updateNodeProperty(graph, { id, value: properties[i], prop: i });
		}
	}
	return graph;
}
export function updateNodePropertyDirty(graph: any, options: any) {
	const { id, value, prop } = options;
	if (id && prop && graph.nodeLib && graph.nodeLib[id]) {
		graph.nodeLib[id] = {
			...graph.nodeLib[id],
			...{
				dirty: {
					...graph.nodeLib[id].dirty || {},
					[prop]: value
				}
			}
		};
	}
	return graph;
}
function codeTypeWord(x: any) {
	if (typeof x === 'string') {
		return x
			.split('')
			.filter((y) => 'abcdefghijklmnopqrstuvwxyzzz1234567890_'.indexOf(y.toLowerCase()) !== -1)
			.join('');
	}
	return x;
}

export function GetComponentExternalApiNodes(parent: any, graph?: any) {
	graph = graph || GetCurrentGraph();
	return GetNodesLinkedTo(graph, {
		id: parent,
		link: LinkType.ComponentExternalApi
	});
}

export function GetScreenUrl(op: any, overrideText: any = null) {
	const params = GetComponentExternalApiNodes(op.id)
		.filter((externaApiNodes: any) => GetNodeProp(externaApiNodes, NodeProperties.IsUrlParameter))
		.map((v: any) => `:${GetCodeName(v)}`)
		.join('/');
	const route = `${overrideText || GetNodeProp(op, NodeProperties.UIText)}${params ? `/${params}` : ''}`;

	return convertToURLRoute(route);
}
export function convertToURLRoute(x: string) {
	return [ ...x.split(' ') ].filter((x) => x).join('/').toLowerCase();
}
export const NodePropertiesDirtyChain = {
	[NodeProperties.ServiceType]: [
		{
			chainProp: NodeProperties.CodeName,
			chainFunc: codeTypeWord
		},
		{
			chainProp: NodeProperties.AgentName,
			chainFunc: codeTypeWord
		},
		{
			chainProp: NodeProperties.ValueName,
			chainFunc: codeTypeWord
		},
		{
			chainProp: NodeProperties.UIName,
			chainFunc: codeTypeWord
		},
		{
			chainProp: NodeProperties.UIText,
			chainFunc: codeTypeWord
		}
	],
	[NodeProperties.UIText]: [
		{
			chainProp: NodeProperties.CodeName,
			chainFunc: codeTypeWord
		},
		{
			chainProp: NodeProperties.AgentName,
			chainFunc: codeTypeWord
		},
		{
			chainProp: NodeProperties.ValueName,
			chainFunc: codeTypeWord
		},
		{
			chainProp: NodeProperties.HttpRoute,
			chainFunc: (x: any, node: any) => {
				if (typeof x === 'string') {
					if (GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.Screen) {
						return GetScreenUrl(node, undefined);
					}
					return convertToURLRoute(x);
				}
				return x;
			}
		},
		{
			chainProp: NodeProperties.UIName,
			chainFunc: (x: any) => {
				return x;
			}
		},
		{
			chainProp: NodeProperties.Label,
			chainFunc: (x: any) => {
				return x;
			}
		}
	]
};

export function updateNodeProperty(graph: any, options: any) {
	const { id, prop } = options;
	let { value } = options;
	const additionalChange: any = {};
	if (id && prop && graph.nodeLib && graph.nodeLib[id]) {
		if (prop === NodeProperties.Pinned) {
			if (isFlagged(Flags.HIDE_NEW_NODES)) {
				value = false;
			}
		}
		updateCache({
			prop,
			id,
			value,
			previous:
				graph.nodeLib[id] && graph.nodeLib[id].properties && graph.nodeLib[id].properties[prop]
					? graph.nodeLib[id].properties[prop]
					: null
		});

		if (NodePropertiesDirtyChain[prop]) {
			const temps = NodePropertiesDirtyChain[prop];
			temps.forEach((temp: any) => {
				if (!graph.nodeLib[id].dirty[temp.chainProp]) {
					additionalChange[temp.chainProp] = temp.chainFunc(value, graph.nodeLib[id]);
				}
			});
		}
		if (fast) {
			if (!graph.nodeLib[id]) {
				graph.nodeLib[id] = {};
			}
			if (!graph.nodeLib[id].dirty) {
				graph.nodeLib[id].dirty = {};
			}
			if (!graph.nodeLib[id].properties) {
				graph.nodeLib[id].properties = {};
			}
			graph.nodeLib[id].dirty[prop] = true;
			let node: Node = graph.nodeLib[id];
			if (node) {
				node.propertyVersions = node.propertyVersions || {};
				if (node.properties[prop] !== value) {
					node.propertyVersions[prop] = (node.propertyVersions[prop] || 0) + 1;
				}
				if (additionalChange) {
					Object.keys(additionalChange).forEach((propKey) => {
						if (node.properties[propKey] !== additionalChange[propKey] && node.propertyVersions) {
							node.propertyVersions[propKey] = (node.propertyVersions[propKey] || 0) + 1;
						}
					});
				}
			}
			graph.nodeLib[id].properties[prop] = value;

			Object.assign(graph.nodeLib[id].properties, additionalChange || {});
		} else {
			graph.nodeLib[id] = {
				...graph.nodeLib[id],
				...{
					dirty: {
						[prop]: true,
						...graph.nodeLib[id].dirty || {}
					},
					properties: {
						...graph.nodeLib[id].properties || {},
						[prop]: value,
						...additionalChange
					}
				}
			};
		}
		if (prop === NodeProperties.Selected) {
			graph.selected = graph.selected ? graph.selected + (value ? 1 : -1) : 0;
			if (value) {
				graph.markedSelectedNodeIds = [ ...(graph.markedSelectedNodeIds || []), id ].unique();
			} else {
				graph.markedSelectedNodeIds = (graph.markedSelectedNodeIds || []).filter((x: any) => x !== id);
			}
		}
		if (prop === NodeProperties.NODEType && value === NodeTypes.Function) {
			if (fast) {
				if (!graph.functionNodes) {
					graph.functionNodes = {};
				}
				graph.functionNodes[id] = true;
			} else {
				graph.functionNodes = { ...graph.functionNodes, ...{ [id]: true } };
			}
		} else if (graph.functionNodes[id] && prop === NodeProperties.NODEType) {
			delete graph.functionNodes[id];
			if (!fast) {
				graph.functionNodes = { ...graph.functionNodes };
			}
		}

		if (prop === NodeProperties.NODEType && value === NodeTypes.ClassNode) {
			if (fast) {
				if (!graph.classNodes) {
					graph.classNodes = {};
				}
				graph.classNodes[id] = true;
			} else {
				graph.classNodes = { ...graph.classNodes, ...{ [id]: true } };
			}
		} else if (graph.classNodes[id] && prop === NodeProperties.NODEType) {
			delete graph.classNodes[id];
			if (!fast) {
				graph.classNodes = { ...graph.classNodes };
			}
		}
	}
	return graph;
}

export function updateLinkProperty(graph: any, options: any) {
	const { id, value, prop } = options;
	if (id && prop && graph.linkLib && graph.linkLib[id]) {
		if (fast) {
			if (!graph.linkLib[id]) {
				graph.linkLib[id] = {};
			}

			if (!graph.linkLib[id].properties) {
				graph.linkLib[id].properties = {};
			}

			graph.linkLib[id].properties[prop] = value;
		} else {
			graph.linkLib[id] = {
				...graph.linkLib[id],
				...{
					properties: {
						...graph.linkLib[id].properties || {},
						[prop]: value
					}
				}
			};
		}
	}
	return graph;
}

export function updateGroupProperty(graph: any, options: any) {
	const { id, value, prop } = options;
	if (id && prop && graph.groupLib && graph.groupLib[id]) {
		if (fast) {
			if (!graph.groupLib[id]) {
				graph.groupLib[id] = {};
			}
			if (!graph.groupLib[id].properties) {
				graph.groupLib[id].properties = {};
			}
			graph.groupLib[id].properties[prop] = value;
		} else {
			graph.groupLib[id] = {
				...graph.groupLib[id],
				...{
					properties: {
						...graph.groupLib[id].properties || {},
						[prop]: value
					}
				}
			};
		}
	}
	return graph;
}

function noSameLink(graph: any, ops: any) {
	return !findLink(graph, ops);
	// return !graph.links.some(x => {
	//   const temp = graph.linkLib[x];
	//   return temp && temp.source === ops.source && temp.target === ops.target;
	// });
}
function createGroup() {
	return {
		id: uuidv4(),
		leaves: [],
		groups: [],
		properties: {}
	};
}
function createNode(nodeType?: any): Node {
	return {
		id: uuidv4(),
		dirty: {},
		propertyVersions: {
			text: 1
		},
		properties: {
			text: nodeType || Titles.Unknown
		}
	};
}

function createLink(target: any, source: any, properties: {}) {
	properties = properties || {};
	return {
		id: uuidv4(),
		source,
		target,
		properties
	};
}
function copyLink(link: any) {
	return {
		...JSON.parse(JSON.stringify(link))
	};
}
export function duplicateNode(nn: any) {
	return {
		...nn
	};
}
export function duplicateLink(nn: { source: any; target: any }, nodes: string | any[]) {
	return {
		...nn,
		source: nodes.indexOf(nn.source),
		target: nodes.indexOf(nn.target)
	};
}

function GetNodesInsideGroup(
	graph: { groupsNodes: { [x: string]: {} }; childGroups: { [x: string]: any } },
	t: string,
	seenGroups: any = {}
) {
	let res = Object.keys(graph.groupsNodes[t]);
	for (const i in graph.childGroups[t]) {
		if (!seenGroups[i]) {
			seenGroups = {
				...seenGroups,
				[i]: true
			};
			res = [ ...res, ...GetNodesInsideGroup(graph, i, seenGroups) ];
		}
	}

	return res;
}
export const GroupImportanceOrder = {
	[NodeTypes.Model]: 1,
	[NodeTypes.Function]: 1,
	[NodeTypes.Method]: 1,
	[NodeTypes.Property]: 4,
	[NodeTypes.ValidationList]: 5,
	[NodeTypes.OptionList]: 6,
	[NodeTypes.Parameter]: 4,
	[NodeTypes.Permission]: 4,
	[NodeTypes.Attribute]: 8,
	[NodeTypes.ValidationList]: 10,
	[NodeTypes.ValidationListItem]: 12,
	[NodeTypes.ModelItemFilter]: 13
};

export function SetVisible(graph: any, clearPinned: boolean = false) {
	graph.visibleNodes = {};
	let nodes = GetNodesByProperties({ [NodeProperties.Pinned]: true }, graph);
	nodes.forEach((node: Node) => {
		if (GetNodeProp(node, NodeProperties.Pinned)) {
			if (clearPinned) {
				if (node) node.properties[NodeProperties.Pinned] = false;
				graph.visibleNodes[node.id] = false;
			} else {
				graph.visibleNodes[node.id] = true;
			}
		}
	});
	if (graph.depth && !isNaN(graph.depth) && parseInt(graph.depth)) {
		[].interpolate(0, parseInt(graph.depth), (x: number) => {
			Object.keys(graph.visibleNodes).forEach((t) => {
				for (const h in graph.nodeLinks[t]) {
					if (x > 1 && !graph.visibleNodes[h]) {
						graph.visibleNodes[h] = 2;
					} else {
						graph.visibleNodes[h] = true;
					}
				}
			});
		});
	}
	return graph;
}
function getDepth(groupId: string, graph: { groupLib: { [x: string]: any }; parentGroup: { [x: string]: {} } }) {
	let res = 0;
	if (graph.groupLib[groupId]) {
		if (graph.parentGroup[groupId]) {
			const parent = Object.keys(graph.parentGroup[groupId])[0];
			if (parent) {
				res += getDepth(parent, graph);
			}
		}
		res += 1;
	}
	return res;
}
export function FilterGraph(graph: any) {
	const filteredGraph = createGraph();
	filteredGraph.id = graph.id;
	filteredGraph.linkLib = { ...graph.linkLib };
	filteredGraph.nodesGroups = { ...graph.nodesGroups };
	filteredGraph.groupsNodes = { ...graph.groupsNodes };
	filteredGraph.groups = [ ...graph.groups ];
	filteredGraph.groupLib = { ...graph.groupLib };
	filteredGraph.childGroups = { ...graph.childGroups };
	filteredGraph.parentGroup = { ...graph.parentGroup };
	filteredGraph.links = [
		...graph.links.filter((linkId: string | number) => {
			const { target, source } = graph.linkLib[linkId];
			if (graph.visibleNodes[target] && graph.visibleNodes[source]) {
				return true;
			}
			delete filteredGraph.linkLib[linkId];

			return false;
		})
	];
	Object.keys(graph.nodesGroups).forEach((nodeId) => {
		if (!graph.visibleNodes[nodeId]) {
			const temp = graph.nodesGroups[nodeId];
			// for (const i in temp)
			Object.keys(temp).forEach((i) => {
				filteredGraph.groupsNodes[i] = { ...filteredGraph.groupsNodes[i] };
				delete filteredGraph.groupsNodes[i][nodeId];
				if (Object.keys(filteredGraph.groupsNodes[i]).length === 0) {
					delete filteredGraph.groupsNodes[i];
				}
			});
			delete filteredGraph.nodesGroups[nodeId];
		}
	});
	Object.keys(filteredGraph.groupLib).sort((b, a) => getDepth(a, graph) - getDepth(b, graph)).forEach((group) => {
		if (filteredGraph.groupLib[group].leaves) {
			filteredGraph.groupLib[group] = { ...filteredGraph.groupLib[group] };
			filteredGraph.groupLib[group].leaves = [
				...filteredGraph.groupLib[group].leaves.filter((x: string | number) => graph.visibleNodes[x])
			];
			filteredGraph.groupLib[group].groups = [
				...filteredGraph.groupLib[group].groups.filter((x: string | number) => filteredGraph.groupLib[x])
			];
			if (!filteredGraph.groupLib[group].leaves.length && !filteredGraph.groupLib[group].groups.length) {
				filteredGraph.groups = [ ...filteredGraph.groups.filter((x: string) => x !== group) ];
				delete filteredGraph.groupLib[group];
			}
		}
	});
	Object.keys(graph.childGroups).forEach((group) => {
		if (!filteredGraph.groupsNodes[group]) {
			delete filteredGraph.childGroups[group];
		} else {
			for (const t in filteredGraph.childGroups[group]) {
				if (!filteredGraph.groupsNodes[t]) {
					filteredGraph.childGroups[group] = {
						...filteredGraph.childGroups[group]
					};
					delete filteredGraph.childGroups[group][t];
				}
			}
		}
	});
	Object.keys(graph.parentGroup).forEach((group) => {
		if (!filteredGraph.groupsNodes[group]) {
			delete filteredGraph.parentGroup[group];
		} else {
			for (const t in filteredGraph.parentGroup[group]) {
				if (!filteredGraph.groupsNodes[t]) {
					filteredGraph.parentGroup[group] = {
						...filteredGraph.parentGroup[group]
					};
					delete filteredGraph.parentGroup[group][t];
				}
			}
		}
	});
	Object.keys(graph.visibleNodes).forEach((nodeId) => {
		filteredGraph.nodeLib[nodeId] = graph.nodeLib[nodeId];
		filteredGraph.nodes.push(nodeId);
		filteredGraph.nodeConnections[nodeId] = {
			...graph.nodeConnections[nodeId]
		};
		filteredGraph.nodeLinks[nodeId] = { ...graph.nodeLinks[nodeId] };

		Object.keys(graph.nodeLinks[nodeId] || {}).forEach((t) => {
			if (!filteredGraph.linkLib[t]) {
				filteredGraph.nodeLinks[nodeId] = {
					...filteredGraph.nodeLinks[nodeId]
				};
				delete filteredGraph.nodeLinks[nodeId][t];
			}
		});
	});

	return filteredGraph;
}

export enum VisualCommand {
	ADD_NODE = 'ADD_NODE',
	REMOVE_NODE = 'REMOVE_NODE',
	ADD_CONNECTION = 'ADD_CONNECTION',
	REMOVE_LINK = 'REMOVE_CONNECTION'
}
export interface VisualOperation {
	command: VisualCommand;
	nodeId?: string;
	linkId?: string;
}
export function UpdateVisualGrpah(visualGraph: Graph | null, graph: Graph, visualCommand: VisualOperation) {
	if (!visualGraph) {
		visualGraph = createGraph();
	}
	let nodeGroups: string[] = [];
	switch (visualCommand.command) {
		case VisualCommand.ADD_NODE:
			if (visualCommand.nodeId) {
				let newNode = GetNode(graph, visualCommand.nodeId);
				if (newNode) {
					visualGraph = addNode(visualGraph, newNode);
					let links = GetLinksForNode(graph, { id: newNode.id });
					links.map((link: GraphLink) => {
						if (!getLink(visualGraph, link)) {
							let otherNode = newNode && link.source == newNode.id ? link.target : link.source;
							if (visualGraph && GetNode(visualGraph, otherNode)) {
								visualGraph = addLink(visualGraph, link, link);
							}
						}
					});
				}
				if (graph.nodesGroups[visualCommand.nodeId]) {
					Object.keys(graph.nodesGroups[visualCommand.nodeId]).forEach((t) => {
						if (nodeGroups.indexOf(t) === -1) {
							nodeGroups.push(t);
							let ancestors = getGroupAncenstors(graph, t);
							ancestors.forEach((ancestor: string) => {
								if (nodeGroups.indexOf(ancestor) === -1) {
									nodeGroups.push(ancestor);
								}
							});
						}
					});
				}
			}
			break;
		case VisualCommand.REMOVE_NODE:
			if (visualCommand.nodeId) {
				visualGraph = removeNode(visualGraph, { id: visualCommand.nodeId });
			}
			if (visualGraph && visualGraph.groups) {
				visualGraph.groups = visualGraph.groups.filter((x) => graph.groupsNodes[x]);
			}
			break;
		case VisualCommand.ADD_CONNECTION:
			let link: GraphLink = getLink(graph, { id: visualCommand.linkId });
			visualGraph = addLink(visualGraph, link, link);
			break;
		case VisualCommand.REMOVE_LINK:
			visualGraph = removeLink(visualGraph, visualCommand.linkId);
			break;
	}
	if (visualGraph) {
		visualGraph.groupLib = graph.groupLib;
		visualGraph.groups = graph.groups; // nodeGroups;
		visualGraph.groupsNodes = graph.groupsNodes;
		visualGraph.childGroups = graph.childGroups;
		visualGraph.nodesGroups = graph.nodesGroups;
		visualGraph.parentGroup = graph.parentGroup;
		visualGraph.id = graph.id;
	}
	return visualGraph;
}
export function VisualProcess(graph: any, clearPinned: boolean = false) {
	if (Paused()) {
		return null;
	}
	const vgraph = createGraph();
	vgraph.id = graph.id;
	graph = SetVisible(graph, clearPinned);
	vgraph.visibleNodes = { ...graph.visibleNodes };
	graph = FilterGraph(graph);
	const collapsedNodes = graph.nodes.filter((node: string | number) =>
		GetNodeProp(graph.nodeLib[node], NodeProperties.Collapsed)
	);
	const collapsingGroups: any = {};
	collapsedNodes.forEach((t: string) => {
		if (graph.nodesGroups[t]) {
			const t_importance = GroupImportanceOrder[GetNodeProp(graph.nodeLib[t], NodeProperties.NODEType)] || 1000;
			const sortedGroups = Object.keys(graph.nodesGroups[t])
				.filter((nodeGroupKey) => {
					const nodesInGroup = GetNodesInsideGroup(graph, nodeGroupKey);
					const moreImportantNode = nodesInGroup.find((n) => {
						if (n === t) {
							return false;
						}
						const _type = GetNodeProp(graph.nodeLib[n], NodeProperties.NODEType);
						const n_importance = GroupImportanceOrder[_type] || 1000;

						if (n_importance > t_importance) {
							return false;
						}
						return true;
					});
					if (moreImportantNode) {
						return false;
					}
					return true;
				})
				.sort((b, a) => Object.keys(graph.groupsNodes[a]).length - Object.keys(graph.groupsNodes[b]).length);
			if (sortedGroups.length) {
				collapsingGroups[sortedGroups[0]] = true;
			}
		}
	});
	const smallestsNonCrossingGroups = Object.keys(collapsingGroups).filter((cg) => {
		for (const g_ in graph.parentGroup[cg]) {
			if (collapsingGroups[g_]) {
				return false;
			}
		}
		return true;
	});
	let disappearingNodes: any = {};
	smallestsNonCrossingGroups.forEach((t) => {
		const dt: any = {};
		let head: any = null;
		let mostimportant = 10000;
		const _nodes = GetNodesInsideGroup(graph, t);
		_nodes.forEach((t) => {
			const type = GetGroupProperty(graph.nodeLib[t], NodeProperties.NODEType);
			dt[t] = true;
			if (GroupImportanceOrder[type] < mostimportant) {
				head = t;
				mostimportant = GroupImportanceOrder[type];
			}
		});
		delete dt[head];
		Object.keys(dt).forEach((i) => {
			dt[i] = head;
		});

		disappearingNodes = { ...disappearingNodes, ...dt };
	});

	vgraph.nodes = [ ...graph.nodes.filter((x: string | number) => !disappearingNodes[x]) ];
	vgraph.nodeLib = {};
	vgraph.nodes.forEach((t: string | number) => {
		vgraph.nodeLib[t] = graph.nodeLib[t];
	});
	vgraph.links = graph.links
		.map((x: string | number) => {
			// Find any link that should be disappearing, and make it go away
			const { source, target } = graph.linkLib[x];
			let dupLink;
			if (disappearingNodes[source] && disappearingNodes[target]) {
				// the link is going totally away;
				return false;
			}
			if (disappearingNodes[source]) {
				dupLink = copyLink(graph.linkLib[x]);
				dupLink.source = disappearingNodes[source];
				dupLink.id = `${dupLink.source}${dupLink.target}`;
				vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
			} else if (disappearingNodes[target]) {
				dupLink = copyLink(graph.linkLib[x]);
				dupLink.target = disappearingNodes[target];
				dupLink.id = `${dupLink.source}${dupLink.target}`;
				vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
			} else {
				dupLink = copyLink(graph.linkLib[x]);
				dupLink.id = `${dupLink.source}${dupLink.target}`;
				vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
			}
			if (dupLink.source === dupLink.target) {
				return false;
			}
			return dupLink.id;
		})
		.filter((x: any) => x);

	const vgroups = graph.groups
		.map((group: string | number) => {
			const oldgroup: any = graph.groupLib[group];
			const newgroup: any = createGroup();
			newgroup.id = `${oldgroup.id}`;
			if (oldgroup && oldgroup.leaves) {
				oldgroup.leaves.forEach((leaf: string | number) => {
					if (vgraph.nodeLib[leaf]) {
						newgroup.leaves.push(leaf);
					}
				});
			}
			if (newgroup.leaves.length) {
				vgraph.groupLib[newgroup.id] = newgroup;

				return newgroup.id;
			}
			return null;
		})
		.filter((x: any) => x);
	vgroups.forEach((group: string | number) => {
		vgraph.groupLib[group].groups = (graph.groupLib[group].groups || []).filter((og: string | number) => {
			if (vgraph.groupLib[og]) {
				return true;
			}
			return false;
		});
	});
	vgraph.groups = vgroups;
	return vgraph;
}
