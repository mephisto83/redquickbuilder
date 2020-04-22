/* eslint-disable func-names */

import { uuidv4 } from '../utils/array';
import { NodeProperties, LinkProperties } from '../constants/nodetypes';

export default function(args: any = {}) {
	// node0,node1

	// menu_name, menu_name, index, menu_name, navigate_function
	if (!args.menu_name) {
		throw new Error('missing menu_name argument');
	}
	if (!args.navigate_function) {
		throw new Error('missing navigate_function argument');
	}
	if (!args.menuGeneration) {
		throw new Error('missing menuGeneration argument');
	}
	if (!args.component) {
		throw new Error('missing component arguments');
	}

	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const context = {
		...args,
		uiType: args.uiType || 'ElectronIO',
		node0: args.component,
		node1: viewPackages[NodeProperties.ViewPackage]
	};
	const result = [
		function() {
			return [
				{
					operation: 'NEW_COMPONENT_NODE',
					options: {
						parent: context.node0,
						groupProperties: {},
						properties: {
							UIType: context.uiType,
							'view-package': viewPackages[NodeProperties.ViewPackage]
						},
						linkProperties: {
							properties: {
								type: 'component',
								stroke: '#B7245C',
								component: {}
							}
						},
						callback: function(node: { id: any; }) {
							context.node2 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'component-type',
						id: context.node2,
						value: 'Button'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node2,
						value: 'Button'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'ComponentApi',
						linkProperties: {
							properties: {
								type: 'component-internal-api',
								'component-internal-api': {}
							}
						},
						parent: context.node2,
						groupProperties: {},
						properties: {
							text: 'label',
							Pinned: false,
							UseAsValue: true,
							'view-package': context.node1
						},
						callback: function(node: { id: any; }, graph: any, group: any) {
							context.node3 = node.id;
							context.group0 = group;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'ComponentExternalApi',
						parent: context.node2,
						linkProperties: {
							properties: {
								type: 'component-external-api',
								'component-external-api': {}
							}
						},
						groupProperties: {},
						properties: {
							text: 'label',
							Pinned: false,
							'view-package': context.node1
						},
						callback: function(node: { id: any; }) {
							context.node4 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_LINK_BETWEEN_NODES',
					options: {
						source: context.node3,
						target: context.node4,
						properties: {
							type: 'component-internal-connection',
							'component-internal-connection': {}
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node4,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CONNECT_TO_TITLE_SERVICE',
					options: {
						id: context.node4
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'EventMethod',
						properties: {
							EventType: 'onClick',
							text: 'onClick',
							'view-package': context.node1
						},
						links: [
							{
								target: context.node2,
								linkProperties: {
									properties: { ...LinkProperties.EventMethod }
								}
							}
						],
						callback: function(node: { id: any; }) {
							context.node5 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'EventMethodInstance',
						parent: context.node5,
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'EventMethodInstance',
								EventMethodInstance: {}
							}
						},
						properties: {
							text: 'onClick Instance',
							Pinned: false,
							'view-package': context.node1,
							AutoDelete: {
								properties: {
									nodeType: 'component-api-connector'
								}
							}
						},
						callback: function(node: { id: any; }, graph: any, group: any) {
							context.node6 = node.id;
							context.group1 = group;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node2,
						value: `${args.menu_name}`
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'component-type',
						id: context.node2,
						value: 'Menu'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'ComponentApi',
						linkProperties: {
							properties: {
								type: 'component-internal-api',
								'component-internal-api': {}
							}
						},
						parent: context.node2,
						groupProperties: {},
						properties: {
							text: 'value',
							Pinned: false,
							UseAsValue: true
						},
						callback: function(node: { id: any; }) {
							context.node7 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'ComponentExternalApi',
						parent: context.node2,
						linkProperties: {
							properties: {
								type: 'component-external-api',
								'component-external-api': {}
							}
						},
						groupProperties: {},
						properties: {
							text: 'value',
							Pinned: false
						},
						callback: function(node: { id: any; }) {
							context.node8 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_LINK_BETWEEN_NODES',
					options: {
						source: context.node7,
						target: context.node8,
						properties: {
							type: 'component-internal-connection',
							'component-internal-connection': {}
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node8,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback: function(node: { id: any; }) {
							context.node9 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node9,
						value: `${args.menu_name} Menu Data Source`
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'nodeType',
						id: context.node9,
						value: 'data-chain'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'EntryPoint',
						id: context.node9,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node9,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'DataChainFunctionType',
						id: context.node9,
						value: 'Pass'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						parent: context.node9,
						nodeType: 'data-chain',
						groupProperties: {
							GroupEntryNode: context.node9,
							GroupExitNode: context.node9
						},
						properties: {
							Pinned: false,
							ChainParent: context.node9
						},
						linkProperties: {
							properties: {
								type: 'data-chain-link',
								'data-chain-link': {}
							}
						},
						links: [],
						callback: function(node: { id: any; }, graph: any, group: any) {
							context.node10 = node.id;
							context.group2 = group;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node10,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'DataChainFunctionType',
						id: context.node10,
						value: context.buildMethod || 'Lambda'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Lambda',
						id: context.node10,
						value: `${context.menuGeneration}`
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node10,
						value: 'return menu'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						parent: context.node10,
						nodeType: 'data-chain',
						groupProperties: {
							id: context.group2
						},
						properties: {
							ChainParent: context.node10
						},
						linkProperties: {
							properties: {
								type: 'data-chain-link',
								'data-chain-link': {}
							}
						},
						callback: function(node: { id: any; }) {
							context.node11 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node11,
						value: 'convert to graph'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'AsOutput',
						id: context.node11,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'DataChainFunctionType',
						id: context.node11,
						value: 'Lambda'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Lambda',
						id: context.node11,
						value:
							'(array: []) => {\n    let graph = RedGraph.create();\n\n    array.map((item: any) => {\n        RedGraph.addNode(graph, item, null);\n    }).forEach((item: any) => {\n        if (item && item.parent) {\n            RedGraph.addLink(graph, item.parent, item.id)\n        }\n    });\n    return graph;\n}'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'NEW_LINK',
					options: {
						target: context.node9,
						source: context.node8,
						properties: {
							type: 'data-chain-link',
							'data-chain-link': {},
							singleLink: true,
							nodeTypes: [ 'data-chain' ]
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node6,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback: function(node: { id: any; }) {
							context.node12 = node.id;
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node12,
						value: `${args.menu_name} Navigate To Pages`
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'nodeType',
						id: context.node12,
						value: 'data-chain'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'EntryPoint',
						id: context.node12,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'AsOutput',
						id: context.node12,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'DataChainFunctionType',
						id: context.node12,
						value: 'Lambda'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node12,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Lambda',
						id: context.node12,
						value: `${args.navigate_function}`
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'NEW_LINK',
					options: {
						target: context.node12,
						source: context.node6,
						properties: {
							type: 'data-chain-link',
							'data-chain-link': {},
							singleLink: true,
							nodeTypes: [ 'data-chain' ]
						}
					}
				}
			];
		}
	];
	const clearPinned = [
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node1,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node2,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node3,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node4,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node5,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node6,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node7,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node8,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node9,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node10,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node11,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node12,
					value: false
				};
			}
		}
	];
	const applyViewPackages = [
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node2,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node3,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node4,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node5,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node6,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node7,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node8,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node9,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node10,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node11,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node12,
					properties: viewPackages
				};
			}
		}
	];
	return [
		...result,
		...clearPinned,
		...applyViewPackages,
		function() {
			if (context.callback) {
				context.entry = context.node0;
				context.callback(context);
			}
			return [];
		}
	];
}
