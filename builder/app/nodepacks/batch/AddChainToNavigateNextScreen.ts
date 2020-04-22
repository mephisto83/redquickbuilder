import { uuidv4 } from '../../utils/array';
import { NodeProperties } from '../../constants/nodetypes';

export default function(args: any = {}) {
	// node0,node1
	if (!args.dataChain) {
		throw new Error('No data chain ');
	}
	if (!args.screen) {
		throw new Error('No screen ');
	}
	//

	let context = {
		...args,
		node0: args.dataChain,
		node1: args.screen
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
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						source: context.node0,
						target: ''
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Screen',
						id: context.node0,
						value: context.node1
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_LINK_BETWEEN_NODES',
					options: {
						source: context.node0,
						target: context.node1,
						properties: {
							type: 'data-chain-link',
							'data-chain-link': {}
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
	let applyViewPackages: any = [];
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
