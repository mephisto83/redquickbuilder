import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';
export default function(args: any = {}) {
	// node0,node1

	//
	if (!args.dataChain) {
		throw 'missing data chain to append getIds data chain node';
	}
	if (!args.dataChainGroup) {
		throw 'missing data chain group to append getIds data chain node';
	}
	let context = {
		...args,
		node0: args.dataChain,
		node1: args.dataChainGroup
	};
	let result = [
		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'AsOutput',
						id: context.node0,
						value: false
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
							id: context.node1
						},
						properties: {
							ChainParent: context.node0
						},
						linkProperties: {
							properties: {
								type: 'data-chain-link',
								'data-chain-link': {}
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
						prop: 'AsOutput',
						id: context.node2,
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
						id: context.node2,
						value: 'Get Model Ids'
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
						value: 'get ids'
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
	return [
		...result,
		...clearPinned,
		function() {
			if (context.callback) {
				context.entry = context.node0;
				context.callback(context);
			}
			return [];
		}
	];
}
