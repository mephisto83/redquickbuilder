export default function(args: any = {}) {
	//

	//

	let context = {
		...args
	};
	let result = [
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
						value: 'Configuration'
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
						value: 'configuration'
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
						prop: 'Domain',
						id: context.node0,
						value: 'localhost:44338'
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'UseHttps',
						id: context.node0,
						value: true
					}
				}
			];
		}
	];
	let clearPinned: any = [];
	return [
		...result,
		...clearPinned,
		function() {
			if (context.callback) {
				context.entry = context.node0;
				context.callback(context);
			}
			return [];
		}
	];
}
