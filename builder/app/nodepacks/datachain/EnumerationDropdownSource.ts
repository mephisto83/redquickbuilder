import { uuidv4 } from '../../utils/array';
import { NodeProperties } from '../../constants/nodetypes';
import { GetNodeTitle, GetLambdaVariableTitle } from '../../actions/uiactions';

export default function(args: {
	viewPackages?: any;
	enumeration?: string;
	enumerationId: string;
	callback?: Function;
}) {
	// node1
	if (!args.enumerationId) {
		throw new Error('missing enumeration id');
	}
	args.enumeration = args.enumeration || GetNodeTitle(args.enumerationId);
	const enumerationModelName = GetLambdaVariableTitle(args.enumerationId, false, true);
	// enumeration
	if (!args.enumeration) {
		throw new Error('missing enumeration argument');
	}
	let context: any = {
		...args,
		node1: uuidv4()
	};
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	let result = [
		function(graph: any) {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback: function(node: { id: any }) {
							context.node0 = node.id;
						}
					}
				}
			];
		},

		function(graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node0,
						value: 'Get ' + args.enumeration + ' Enumeration Dropdown Option'
					}
				}
			];
		},

		function(graph: any) {
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

		function(graph: any) {
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

		function(graph: any) {
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

		function(graph: any) {
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

		function(graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Lambda',
						id: context.node0,
						value:
							'(str: string): { title: string, value: string }[] => {\n    return Object.entries(#{' +
							enumerationModelName +
							'}).map((args: string[]) => {\n  let [key, value] = args; \n        return {\n            title: titleService.get(key),\n            value: value\n        }\n    })\n}\n\n'
					}
				}
			];
		},

		function(graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'LambdaInsertArguments',
						id: context.node0,
						value: {
							[enumerationModelName]: args.enumerationId
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
