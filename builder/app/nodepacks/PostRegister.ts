/* eslint-disable func-names */
export default function(args: any = {}) {
	// node0
	const context = {
		node2: args.screen,
		name: args.name,
		node3: args.clickInstance,
		node5: args.pressInstance,
		...args
	};

	return [
		function() {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback(node: any) {
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
						value: 'Post Authenticate'
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
						callback(node: any) {
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
						prop: 'DataChainFunctionType',
						id: context.node1,
						value: 'Navigate'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'REMOVE_LINK_BETWEEN_NODES',
					options: {
						target: context.node1
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
						id: context.node1,
						value: context.node2
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_LINK_BETWEEN_NODES',
					options: {
						source: context.node1,
						target: context.node2,
						properties: {
							type: 'data-chain-link',
							'data-chain-link': {}
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
						value: context.name || 'Post Register'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'NavigationAction',
						id: context.node1,
						value: 'Replace'
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
						value: 'Navigate to Authenticate Screen'
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
						prop: 'EntryPoint',
						id: context.node0,
						value: true
					}
				}
			];
		},

		context.node3
			? function() {
					return [
						{
							operation: 'NEW_LINK',
							options: {
								target: context.node3,
								source: context.node0,
								properties: {
									type: 'data-chain-link',
									'data-chain-link': {},
									singleLink: true,
									nodeTypes: [ 'data-chain' ]
								}
							}
						}
					];
				}
			: false,

		context.node5
			? function() {
					return [
						{
							operation: 'NEW_LINK',
							options: {
								target: context.node5,
								source: context.node0,
								properties: {
									type: 'data-chain-link',
									'data-chain-link': {},
									singleLink: true,
									nodeTypes: [ 'data-chain' ]
								}
							}
						}
					];
				}
			: false,
		...[]
			.interpolate(0, 6, (x: any) => {
				if (x !== 2) {
					return {
						operation: 'CHANGE_NODE_PROPERTY',
						options() {
							return {
								prop: 'Pinned',
								id: context[`node${x}`],
								value: false
							};
						}
					};
				}
				return null;
			})
			.filter((x: any) => x)
	].filter((x) => x);
}
