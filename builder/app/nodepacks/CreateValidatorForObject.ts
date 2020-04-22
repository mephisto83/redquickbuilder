/* eslint-disable no-unused-vars */

import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';

export default function(args: any = {}) {
	// node2,node4

	// model, model, model
	if (!args.model) {
		throw new Error('missing model argument');
	}
	if (!args.method) {
		throw new Error('missing method argument');
	}
	if (!args.modelId) {
		throw new Error('missing model argument');
	}
	if (!args.methodType) {
		args.methodType = 'Method Type';
	}
	let methodType = args.methodType;

	const context = {
		...args,
		node2: args.modelId,
		node4: args.method
	};
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	const result = [
		function() {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback: function(node: { id: any; }) {
							context.node0 = node.id;
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
						id: context.node0,
						value: `Validate ${methodType} ${args.model}`
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node0,
						value: `Validate ${args.model} Object`
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
						id: context.node0,
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
						prop: 'nodeType',
						id: context.node0,
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
						id: context.node0,
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
						id: context.node0,
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
						parent: context.node0,
						nodeType: 'data-chain',
						groupProperties: {
							GroupEntryNode: context.node0,
							GroupExitNode: context.node0
						},
						properties: {
							Pinned: false,
							ChainParent: context.node0
						},
						linkProperties: {
							properties: {
								type: 'data-chain-link',
								'data-chain-link': {}
							}
						},
						links: [],
						callback: function(node: { id: any; }, graph: any, group: any) {
							context.node1 = node.id;
							context.group0 = group;
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
						id: context.node1,
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
						id: context.node1,
						value: false
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
						id: context.node1,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node1,
						value: 'check for dirty object'
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
						id: context.node1,
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
						id: context.node1,
						value:
							'(x: any)=> {\n let { object, dirty, focus, blur, focused } = x;\n  let result = {}\n  if(dirty) {\n      //#{model}\n      if(Object.keys(dirty).some(key => dirty[key]))\n {//updated \n        return { ...x, validated: true  };\n      }\n  }\n    // only dirty fields, will be validatated.\n return { valid: false, validated:false };\n}'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						source: context.node1
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'LambdaInsertArguments',
						id: context.node1,
						value: {
							model: context.node2
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
						target: context.node2,
						source: context.node1,
						properties: {
							type: 'LambdaInsertArguments',
							LambdaInsertArguments: {}
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
						parent: context.node1,
						nodeType: 'data-chain',
						groupProperties: {
							id: context.group0
						},
						properties: {
							ChainParent: context.node1
						},
						linkProperties: {
							properties: {
								type: 'data-chain-link',
								'data-chain-link': {}
							}
						},
						callback: function(node: { id: any; }) {
							context.node3 = node.id;
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
						prop: 'DataChainFunctionType',
						id: context.node3,
						value: 'MethodBaseValidation'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						source: context.node3
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'uiModelType',
						id: context.node3,
						value: context.node2
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_LINK_BETWEEN_NODES',
					options: {
						target: context.node2,
						source: context.node3,
						properties: {
							type: 'model-type-link',
							'model-type-link': {}
						}
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						source: context.node3
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Method',
						id: context.node3,
						value: context.node4
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
							type: 'data-chain-link',
							'data-chain-link': {}
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
						id: context.node3,
						value: `validation ${args.model}`
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
						id: context.node3,
						value: true
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
		}
	];
	const applyViewPackages = [
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node0,
					properties: viewPackages
				};
			}
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node1,
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
