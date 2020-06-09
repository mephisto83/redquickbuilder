import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';
export default function StoreUserInDataLake(args: {
	userId: string;
	callback: Function;
	viewPackages: any;
	user: string;
}) {
	// node1

	// user
	if (!args.user) {
		throw new Error('missing user argument');
	}
	let context: any = {
		...args,
		node1: args.userId
	};
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	let result = [
		function(_graph: any) {
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

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node0,
						value: 'Store User ' + args.user + ' in Data Lake'
					}
				}
			];
		},

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'nodeType',
						id: context.node0,
						value: 'LifeCylceMethod'
					}
				}
			];
		},

		function(_graph: any) {
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

		function(_graph: any) {
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

		function(_graph: any) {
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

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Lambda',
						id: context.node0,
						value:
							'(user: #{user}): #{user} => {\n    let dispatch: Function = GetDispatch();\n\n    if (dispatch) {\n        dispatch(Batch(UIC(APP_STATE, UIKeys.USER_ID, user.id)));\n    }\n    \n    return user;\n}\n\n'
					}
				}
			];
		},

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'LambdaInsertArguments',
						id: context.node0,
						value: {
							user: context.node1
						}
					}
				}
			];
		},

		function(_graph: any) {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						parent: context.node0,
						nodeType: 'data-chain',
						groupProperties: null,
						properties: {
							ChainParent: context.node0
						},
						linkProperties: {
							properties: {
								type: 'data-chain-link',
								'data-chain-link': {}
							}
						},
						callback: function(node: { id: any }) {
							context.node2 = node.id;
						}
					}
				}
			];
		},

		function(_graph: any) {
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

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'DataChainFunctionType',
						id: context.node2,
						value: 'Lambda'
					}
				}
			];
		},

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node2,
						value: 'store user id in data lake'
					}
				}
			];
		},

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Lambda',
						id: context.node2,
						value:
							'(user: #{user}) : #{user} => {\n    let dispatch: Function = GetDispatch();\n    let getState: Function = GetState();\n\n    dispatch(Batch(UIModels(Models.#{user}, user)));\n\n    return user;\n}\n\n'
					}
				}
			];
		},

		function(_graph: any) {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'LambdaInsertArguments',
						id: context.node2,
						value: {
							user: context.node1
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
					id: context.node2,
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
