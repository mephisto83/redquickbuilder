import { uuidv4 } from '../utils/array';
export default function FourColumnSection(args: any = {}) {
	// node0,node1,node3,node4,node5
	let context = {
		node0: args.component,
		node1: uuidv4(),
		node3: uuidv4(),
		node4: uuidv4(),
		node5: uuidv4(),
		node6: uuidv4(),
		node7: uuidv4(),
		...args
	};

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
										[context.node4]: {},
										[context.node5]: {},
										[context.node6]: {},
										[context.node7]: {}
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
								[context.node4]: {
									style: {
										display: 'flex',
										flex: null,
										height: '100%',
										borderStyle: 'solid',
										borderWidth: 1,
										width: '25%'
									},
									children: {},
									cellModel: {},
									properties: {
										tags: [ 'SideContainer', 'LeftContainer' ]
									},
									cellModelProperty: {},
									cellRoot: {},
									cellEvents: {}
								},
								[context.node5]: {
									style: {
										display: 'flex',
										flex: null,
										height: '100%',
										borderStyle: 'solid',
										borderWidth: 1,
										width: '25%'
									},
									children: {},
									cellModel: {},
									properties: {
										tags: [ 'MainSection' ]
									},
									cellModelProperty: {},
									cellRoot: {},
									cellEvents: {}
								},
								[context.node6]: {
									style: {
										display: 'flex',
										flex: null,
										height: '100%',
										borderStyle: 'solid',
										borderWidth: 1,
										width: '25%'
									},
									children: {},
									cellModel: {},
									properties: {
										tags: [ 'SecondaryMain' ]
									},
									cellModelProperty: {},
									cellRoot: {},
									cellEvents: {}
								},
								[context.node7]: {
									style: {
										display: 'flex',
										flex: null,
										height: '100%',
										borderStyle: 'solid',
										borderWidth: 1,
										width: '25%'
									},
									children: {},
									cellModel: {},
									properties: {
										tags: [ 'SideContainer', 'RightContainer' ]
									},
									cellModelProperty: {},
									cellRoot: {},
									cellEvents: {}
								}
							}
						}
					}
				}
			];
		},
		function() {
			if (context.callback) {
				context.containers = [ context.node4, context.node5, context.node6, context.node7 ];
				context.callback(context);
			}
			return [];
		}
	];
}
