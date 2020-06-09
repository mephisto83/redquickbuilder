import { uuidv4 } from '../../utils/array';
import { NodeProperties } from '../../constants/nodetypes';
import { Node } from '../../methods/graph_types';
export default function StoreModelInLake(args: {
	callback: Function;
	modelId: string;
	viewPackages: any;
	modelInsertName: string;
	model: string;
}) {
	// node1
	if (!args.modelInsertName) {
		throw new Error('missing modelInsertName');
	}
	// model
	if (!args.model) {
		throw new Error('missing model argument');
	}
	let { modelInsertName } = args;
	let context: any = {
		...args,
		node1: args.modelId
	};
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	let result = [
		function() {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback: function(node: Node) {
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
						value: 'Store ' + args.model + ' In lake'
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
						prop: 'AsOutput',
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
						value:
							'(a: #{' +
							modelInsertName +
							'}): #{' +
							modelInsertName +
							'} => {\n    let dispatch: Function = GetDispatch();\n    let getState: Function = GetState();\n\n    dispatch(Batch(UIModels(Models.#{' +
							modelInsertName +
							'}, a)));\n\n    return a;\n}\n'
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
							[modelInsertName]: context.node1
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
		}
	];
	let applyViewPackages = [
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options: function() {
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
