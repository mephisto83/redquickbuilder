import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';
import { UPDATE_NODE_PROPERTY } from '../actions/uiActions';
export default function(args: any = {}) {
	// node2

	// screen
	if (!args.screen) {
		throw 'missing screen argument';
	}
	let context: any = {
		...args,
		node2: args.viewModel
	};
	let {
		viewPackages = {
			[NodeProperties.ViewPackage]: uuidv4()
		}
	} = args;
	let result = [
		function() {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback: function(node: any) {
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
						value: 'Get ' + args.screen + ' view model'
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
						callback: function(node: any, graph: any, group: any) {
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
						prop: 'DataChainFunctionType',
						id: context.node1,
						value: 'ViewModelKey'
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
						prop: 'ViewModelKey',
						id: context.node1,
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
						source: context.node1,
						properties: {
							type: 'ViewModelKey',
							ViewModelKey: {}
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
						id: context.node1,
						value: 'get form view model'
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
						id: context.node1,
						value: true
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						target: context.node2,
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
						prop: 'ViewModelKey',
						id: context.node1,
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
						source: context.node1,
						properties: {
							type: 'ViewModelKey',
							ViewModelKey: {}
						}
					}
				}
			];
		}
	];
	let clearPinned = [
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options: function() {
				return {
					prop: 'Pinned',
					id: context.node1,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options: function() {
				return {
					prop: 'Pinned',
					id: context.node2,
					value: false
				};
			}
		}
	];
	let applyViewPackages = [
		{
			operation: UPDATE_NODE_PROPERTY,
			options: function() {
				return {
					id: context.node0,
					properties: viewPackages
				};
			}
		},
		{
			operation: UPDATE_NODE_PROPERTY,
			options: function() {
				return {
					id: context.node1,
					properties: viewPackages
				};
			}
		},
		{
			operation: UPDATE_NODE_PROPERTY,
			options: function() {
				return {
					id: context.node2,
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
