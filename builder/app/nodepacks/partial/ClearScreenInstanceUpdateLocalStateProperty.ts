/* eslint-disable func-names */

import { uuidv4 } from '../../utils/array';
import { NodeProperties } from '../../constants/nodetypes';
import { GetNodeTitle, GetCodeName } from '../../actions/uiActions';

export default function(args: any = {}) {
	// node1,node2
	args.propertyName = args.propertyName || GetNodeTitle(args.property);
	// propertyName
	if (!args.propertyName) {
		throw new Error('missing propertyName argument');
	}
	if (!args.screen) {
		throw new Error('missing screen');
	}
	const context = {
		...args,
		node1: args.model,
		node2: args.property
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
						value: `clear local ${args.propertyName}`
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
						prop: 'DataChainFunctionType',
						id: context.node0,
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
						id: context.node0,
						value: `(params: any) => {\n   let { value, viewModel = ViewModelKeys.${GetCodeName(
							context.screen
						)} } = (params || {});\n   let dispatch = GetDispatch();\n   let getState = GetState(); \n// #{model}\n  \n dispatch(clearScreenInstance(viewModel, '#{model~prop}', { update: true, value})); \n\t\n\n   return params;\n}`
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						source: context.node0
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
						id: context.node0,
						value: {
							model: context.node1,
							prop: context.node2
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
						target: context.node1,
						source: context.node0,
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
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						target: {
							model: context.node1,
							prop: context.node2
						},
						source: context.node0
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
						id: context.node0,
						value: {
							model: context.node1,
							prop: context.node2
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
						source: context.node0,
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
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node0,
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
