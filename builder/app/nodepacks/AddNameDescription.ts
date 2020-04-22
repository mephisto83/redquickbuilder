export default function(args: any = {}) {
	// node1
	let context = {
		...args
	};

	return [
		function() {
			return [
				{
					operation: 'NEW_PROPERTY_NODE',
					options: {
						parent: context.node0,
						properties: {
							uiAttributeType: 'STRING'
						},
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'property-link',
								'property-link': {}
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
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node1,
						value: 'Name'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'NEW_PROPERTY_NODE',
					options: {
						parent: context.node0,
						properties: {
							uiAttributeType: 'STRING'
						},
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'property-link',
								'property-link': {}
							}
						},
						callback: function(node: any) {
							context.node2 = node.id;
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
						id: context.node2,
						value: 'Description'
					}
				}
			];
		}
	];
}
