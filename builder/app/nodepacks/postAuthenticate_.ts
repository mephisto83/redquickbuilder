/* eslint-disable func-names */
import { uuidv4 } from '../utils/array';

export default function(args: any = {}) {
	// node0,node1,node2

	//

	let context: any = null;

	const result = [
		function() {
			context = {
				...args,
				node0: uuidv4(),
				node1: args.head(),
				node2: args.tail()
			};
			return [];
		},
		function() {
			return [
				{
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						source: context.node1,
						target: context.node2,
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
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'data-chain',
						parent: context.node1,
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'data-chain-link',
								'data-chain-link': {}
							}
						},
						properties: {
							ChainParent: context.node1
						},
						links: [
							function() {
								return [
									{
										target: context.node2,
										linkProperties: {
											properties: {
												type: 'data-chain-link',
												'data-chain-link': {}
											}
										}
									}
								];
							}
						],
						callback(node: any) {
							context.node3 = node.id;
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
						source: context.node1,
						target: context.node3,
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
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						id: context.node2,
						value: context.node3,
						prop: 'ChainParent'
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
						value: 'SetBearerAccessToken'
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
						value: 'set bearer token'
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
