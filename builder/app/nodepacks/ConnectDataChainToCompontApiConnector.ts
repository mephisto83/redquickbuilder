export default function(args: any = {}) {
	// node0,node1

	//
	if (!args.componentApiConnector) {
		throw 'no component api connector';
	}
	if (!args.dataChain) {
		throw 'no data chain';
	}
	let context = {
		...args
	};
	let applyViewPackages: any = [];
	let result = [
		function() {
			context.node0 = args.componentApiConnector();
			context.node1 = args.dataChain();
			return [
				{
					operation: 'ADD_LINK_BETWEEN_NODES',
					options: {
						source: context.node0,
						target: context.node1,
						properties: {
							type: 'ComponentApiConnection',
							ComponentApiConnection: {}
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
