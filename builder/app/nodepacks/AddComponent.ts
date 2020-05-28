export default function(args: any = {}) {
	// node0

	//
	if (!args.component) {
		throw 'missing component';
	}

	let context = {
		...args,
		node0: args.component
	};
	let result = [
		function() {
			return [
				{
					operation: 'NEW_COMPONENT_NODE',
					options: {
						parent: context.node0,
						groupProperties: {},
						properties: {
							UIType: context.uiType || 'ElectronIO'
						},
						linkProperties: {
							properties: {
								type: 'component',
								stroke: '#B7245C',
								component: {}
							}
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
						prop: 'component-type',
						id: context.node1,
						value: args.componentType || 'Button'
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
						value: args.componentName || args.componentType || 'Button'
					}
				}
			];
		},
		args.skipLabel
			? null
			: function() {
					return [
						{
							operation: 'ADD_NEW_NODE',
							options: {
								nodeType: 'ComponentApi',
								linkProperties: {
									properties: {
										type: 'component-internal-api',
										'component-internal-api': {}
									}
								},
								parent: context.node1,
								groupProperties: {},
								properties: {
									text: 'label',
									Pinned: false,
									UseAsValue: true
								},
								callback: function(node: any, graph: any, group: any) {
									context.node2 = node.id;
									context.group0 = group;
								}
							}
						}
					];
				},

		args.skipLabel
			? null
			: function() {
					return [
						{
							operation: 'ADD_NEW_NODE',
							options: {
								nodeType: 'ComponentExternalApi',
								parent: context.node1,
								linkProperties: {
									properties: {
										type: 'component-external-api',
										'component-external-api': {}
									}
								},
								groupProperties: {},
								properties: {
									text: 'label',
									Pinned: false
								},
								callback: function(node: any) {
									context.node3 = node.id;
								}
							}
						}
					];
				},

		args.skipLabel
			? null
			: function() {
					return [
						{
							operation: 'ADD_LINK_BETWEEN_NODES',
							options: {
								source: context.node2,
								target: context.node3,
								properties: {
									type: 'component-internal-connection',
									'component-internal-connection': {}
								}
							}
						}
					];
				},

		args.skipLabel
			? null
			: function() {
					return [
						{
							operation: 'CHANGE_NODE_PROPERTY',
							options: {
								prop: 'Pinned',
								id: context.node3,
								value: true
							}
						}
					];
				},

		args.skipLabel
			? null
			: function() {
					return [
						{
							operation: 'CONNECT_TO_TITLE_SERVICE',
							options: {
								id: context.node3
							}
						}
					];
				}
	];
	let clearPinned = !args.clearPinned
		? []
		: [
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
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: function() {
						return {
							prop: 'Pinned',
							id: context.node3,
							value: false
						};
					}
				}
			];
	return [
		...result,
		...clearPinned,
		function() {
			if (context.callback) {
				context.entry = context.node1;
				context.callback(context);
			}
			return [];
		}
	];
}
