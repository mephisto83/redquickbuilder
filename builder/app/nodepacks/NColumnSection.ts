import { uuidv4 } from '../utils/array';
export default function NColumnSection(args: { component: string; count: number; callback?: Function }) {
	// node0,node1,node3,node4,node5

	let context: any = {
		node0: args.component,
		node1: uuidv4(),
		node3: uuidv4(),
		...args
	};
	let { count } = args;
	let nodes: { [st: string]: {} } = {};
	for (var i = 0; i < count; i++) {
		nodes[uuidv4()] = {};
	}
	let properties: { [st: string]: {} } = {};
	Object.keys(nodes).forEach((key: string, index: number) => {
		properties[key] = {
			style: {
				display: 'flex',
				flex: null,
				height: '100%',
				borderStyle: 'solid',
				borderWidth: 1,
				width: index / Object.keys(nodes).length + '%'
			},
			children: {},
			cellModel: {},
			properties: {
				tags: [ `ColumnSection`, `ColumnSection-${index}` ]
			},
			cellModelProperty: {},
			cellRoot: {},
			cellEvents: {}
		};
	});
	return [
		function() {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'Layout',
						id: context.node0,
						value: {
							layout: {
								[context.node1]: {
									[context.node3]: {
										...nodes
									}
								}
							},
							properties: {
								[context.node1]: {
									style: {
										display: 'flex',
										flex: 1,
										height: '100%',
										borderStyle: 'solid',
										borderWidth: 1,
										flexDirection: 'column'
									},
									children: {},
									cellModel: {},
									properties: {},
									cellModelProperty: {},
									cellRoot: {},
									cellEvents: {}
								},
								[context.node3]: {
									style: {
										display: 'flex',
										flex: 1,
										height: '100%',
										borderStyle: 'solid',
										borderWidth: 1
									},
									children: {},
									cellModel: {},
									properties: {
										tags: []
									},
									cellModelProperty: {},
									cellRoot: {},
									cellEvents: {}
								},
								...properties
							}
						}
					}
				}
			];
		},
		function() {
			if (context.callback) {
				context.containers = Object.keys(nodes);
				context.callback(context);
			}
			return [];
		}
	];
}
