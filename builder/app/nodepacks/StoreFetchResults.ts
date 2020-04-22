import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';
export default function StoreFetchResults(args: any = {}) {
	//

	//

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
						callback: function(node: { id: any; }) {
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
						value: 'Store Fetched Models'
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
						callback: function(node: { id: any; }, graph: any, group: any) {
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
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'DataChainFunctionType',
						id: context.node1,
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
						id: context.node1,
						value: 'x => {'
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
						id: context.node1,
						value: 'x => {\n'
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
						id: context.node1,
						value: 'x => {\n\n'
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
						id: context.node1,
						value: '(x: any) => {\n  if(x) {\n\n}'
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
						id: context.node1,
						value: '(x: any) => {\n  if(x) {\n\n\n}'
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
						id: context.node1,
						value: '(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n  ]\n\n}'
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
						id: context.node1,
						value: '(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n\n  ]\n\n}'
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
						id: context.node1,
						value: '(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n\n}) \n  ]\n\n}'
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
						id: context.node1,
						value: '(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n )\n}) \n  ]\n\n}'
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
						id: context.node1,
						value: '(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n     x[model].map((item, index) => {\n  )\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n     x[model].map((item: any, index: Number) => {\n}\n  )\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n     x[model].map((item: any, index: Number) => {\n return \n}\n  )\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n    Object.keys(x).forEach(model=> {\n Batch(\n     x[model].map((item: any, index: Number) => {\n return UIModels(\n}\n  )\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n   Object.keys(x).forEach((model: any) => {\n dispatch(Batch(\n     UIModels(model, x[model])));\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n   \nObject.keys(x).forEach((model: any) => {\n dispatch(Batch(\n     UIModels(model, x[model])));\n}) \n  ]\n\n}'
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
						id: context.node1,
						value:
							'(x: any) => {\n  if(x) {\n   \nconst dispatch = GetDispatch();\nObject.keys(x).forEach((model: any) => {\n dispatch(Batch(\n     UIModels(model, x[model])));\n}) \n  }\n\n}'
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
						value: 'store models in state'
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
		},
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
