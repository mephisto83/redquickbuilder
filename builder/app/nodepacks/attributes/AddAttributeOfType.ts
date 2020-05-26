import { uuidv4 } from '../../utils/array';
import { NodeProperties } from '../../constants/nodetypes';
import { Node, Graph } from '../../methods/graph_types';
export default function AddAttributeOfType(args: any = {}) {
	// node0
	if (!args.property) {
		throw new Error('no args.property');
	}
	// attributename
	if (!args.attributename) {
		throw new Error('missing attributename argument');
	}
	if (!args.uiAttributeType) {
		throw new Error('missing args.uiAttributeType');
	}
	let context = {
		...args,
		node0: args.property
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
					operation: 'NEW_ATTRIBUTE_NODE',
					options: {
						parent: context.node0,
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'attribute-link',
								'attribute-link': {}
							}
						},
						callback: function(node: Node, graph: Graph, group: any) {
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
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node1,
						value: '' + args.attributename + ''
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'uiAttributeType',
						id: context.node1,
						value: args.uiAttributeType
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
					id: context.node1,
					properties: viewPackages
				};
			}
		}
	];
	return [
		...result,
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
