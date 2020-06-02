import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';
export default function DashboardScreenNavigation(args: {
	modelTitle: string;
	component: string;
	model: string;
	viewPackages?: any;
	agent: string;
	skipCreate: boolean;
}) {
	if (!args.model) {
		throw new Error('missing model argument');
	}
	if (!args.component) {
		throw new Error('missing component argument');
	}

	let context: any = {
		...args,
		node0: args.component,
		node2: args.model
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
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'NavigationScreen',
						parent: context.node0,
						linkProperties: {
							properties: {
								type: 'NavigationScreen',
								NavigationScreen: {}
							}
						},
						properties: {
							text: 'Nav Screen',
							IsDashboard: true
						},
						callback: function(node: any) {
							context.node1 = node.id;
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
						prop: 'text',
						id: context.node1,
						value: '' + args.modelTitle + ' get'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Model',
						id: context.node1,
						value: context.node2
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'text',
						id: context.node1,
						value: '' + args.modelTitle + ' get all'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'IsDashboard',
						id: context.node1,
						value: false
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Agent',
						id: context.node1,
						value: context.agent
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'view-type',
						id: context.node1,
						value: 'GetAll'
					}
				}
			];
		},

		context.skipCreate
			? null
			: function() {
					return [
						{
							operation: 'ADD_NEW_NODE',
							options: {
								nodeType: 'NavigationScreen',
								parent: context.node0,
								linkProperties: {
									properties: {
										type: 'NavigationScreen',
										NavigationScreen: {}
									}
								},
								properties: {
									text: 'Nav Screen',
									IsDashboard: true
								},
								callback: function(node: { id: any }) {
									context.node3 = node.id;
								}
							}
						}
					];
				},

		context.skipCreate
			? null
			: function() {
					return [
						{
							operation: 'CHANGE_NODE_PROPERTY',
							options: {
								prop: 'IsDashboard',
								id: context.node3,
								value: false
							}
						}
					];
				},

		context.skipCreate
			? null
			: function() {
					return [
						{
							operation: 'CHANGE_NODE_PROPERTY',
							options: {
								prop: 'text',
								id: context.node3,
								value: '' + args.modelTitle + ' Create'
							}
						}
					];
				},

		context.skipCreate
			? null
			: function() {
					return [
						{
							operation: 'CHANGE_NODE_PROPERTY',
							options: {
								prop: 'Model',
								id: context.node3,
								value: context.node2
							}
						}
					];
				},

		context.skipCreate
			? null
			: function() {
					return [
						{
							operation: 'CHANGE_NODE_PROPERTY',
							options: {
								prop: 'view-type',
								id: context.node3,
								value: 'Create'
							}
						}
					];
				},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'NavigationScreen',
						parent: context.node1,
						linkProperties: {
							properties: {
								type: 'NavigationScreen',
								NavigationScreen: {}
							}
						},
						properties: {
							text: 'Nav Screen',
							IsDashboard: true
						},
						callback: function(node: { id: any }) {
							context.node4 = node.id;
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
						prop: 'text',
						id: context.node4,
						value: '' + args.modelTitle + ' Get'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Model',
						id: context.node4,
						value: context.node2
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'IsDashboard',
						id: context.node4,
						value: false
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'view-type',
						id: context.node4,
						value: 'Get'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'NavigationScreen',
						parent: context.node4,
						linkProperties: {
							properties: {
								type: 'NavigationScreen',
								NavigationScreen: {}
							}
						},
						properties: {
							text: 'Nav Screen',
							IsDashboard: true
						},
						callback: function(node: { id: any }) {
							context.node5 = node.id;
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
						prop: 'text',
						id: context.node5,
						value: '' + args.modelTitle + ' Update'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'IsDashboard',
						id: context.node5,
						value: false
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Model',
						id: context.node5,
						value: context.node2
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'view-type',
						id: context.node5,
						value: 'Update'
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
		},
		context.skipCreate
			? null
			: {
					operation: 'CHANGE_NODE_PROPERTY',
					options: function() {
						return {
							prop: 'Pinned',
							id: context.node3,
							value: false
						};
					}
				},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options: function() {
				return {
					prop: 'Pinned',
					id: context.node4,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options: function() {
				return {
					prop: 'Pinned',
					id: context.node5,
					value: false
				};
			}
		}
	];
	let applyViewPackages = [
		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Agent',
						id: context.node1,
						value: context.agent
					}
				}
			];
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options: function() {
				return {
					id: context.node1,
					properties: viewPackages
				};
			}
		},
		context.skipCreate
			? null
			: function() {
					return [
						{
							operation: 'CHANGE_NODE_PROPERTY',
							options: {
								prop: 'Agent',
								id: context.node3,
								value: context.agent
							}
						}
					];
				},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options: function() {
				return {
					id: context.node3,
					properties: viewPackages
				};
			}
		},
		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Agent',
						id: context.node4,
						value: context.agent
					}
				}
			];
		},
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options: function() {
				return {
					id: context.node4,
					properties: viewPackages
				};
			}
		},
		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Agent',
						id: context.node5,
						value: context.agent
					}
				}
			];
		},

		{
			operation: 'UPDATE_NODE_PROPERTY',
			options: function() {
				return {
					id: context.node5,
					properties: viewPackages
				};
			}
		}
	];
	return [
		...result,
		// ...clearPinned,
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
