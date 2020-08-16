import { uuidv4 } from '../../utils/array';
import { NodeProperties } from '../../constants/nodetypes';
import { Graph, Node } from '../../methods/graph_types';
export default function(args: any = {}) {
	let context = {
		...args
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
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Pinned',
						id: context.node0,
						value: true
					}
				}
			];
		},

		function(graph: Graph) {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node0,
						value: 'Hide Component Style'
					}
				}
			];
		},

		function(graph: Graph) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'nodeType',
						id: context.node0,
						value: 'Style'
					}
				}
			];
		},

		function(graph: Graph) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: NodeProperties.HideStyle,
						id: context.node0,
						value: true
					}
				}
			];
		},

		function(graph: Graph) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Style',
						id: context.node0,
						value: {
							display: 'none'
						}
					}
				}
			];
		},

		function(graph: Graph) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Style',
						id: context.node0,
						value: {
							display: 'none'
						}
					}
				}
			];
		},

		function(graph: Graph) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Style',
						id: context.node0,
						value: {
							display: 'none'
						}
					}
				}
			];
		},

		function(graph: Graph) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Style',
						id: context.node0,
						value: {
							display: 'none'
						}
					}
				}
			];
		}
	];
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
