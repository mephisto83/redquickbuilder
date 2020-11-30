import { uuidv4 } from '../../../utils/array';
import { NodeProperties, LinkProperties } from '../../../constants/nodetypes';
import { GetNodeTitle, ADD_LINK_BETWEEN_NODES } from '../../../actions/uiActions';
export default function AddShouldShowDataChain(args: {
	linkProperty?: any;
	id: string;
	viewPackages?: any;
	name: string;
}) {
	//

	// name
	if (!args.name) {
		args.name = `Should Show ${GetNodeTitle(args.id)}`;
	}
	let context: any = {
		...args
	};
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	let result: any[] = [
		function() {
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

		function() {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node0,
						value: '' + args.name + ''
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
						prop: 'Lambda',
						id: context.node0,
						value:
							'(args: { name: string }): boolean => {\r\n\r\n    // write logic for checking if a user can see menu\r\n\r\n    return true;\r\n}'
					}
				}
			];
		}
	];
	result.push({
		operation: ADD_LINK_BETWEEN_NODES,
		options: () => {
			return {
				target: context.node0,
				source: args.id,
				properties: args.linkProperty || { ...LinkProperties.DataChainShouldShow }
			};
		}
	});
	let clearPinned: any[] = [];
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
