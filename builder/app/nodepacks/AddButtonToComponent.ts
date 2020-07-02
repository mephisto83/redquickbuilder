import { uuidv4 } from '../utils/array';
import { NodeProperties, UITypes } from '../constants/nodetypes';
export default function(args: {
	clearPinned?: boolean;
	componentType?: string;
	viewPackages?: any;
	component: string;
	uiType?: string;
	callback?: Function;
}) {
	// node0
	let { uiType } = args;
	//
	if (!args.component) {
		throw 'missing component';
	}
	let eventName: string = '';
	if (uiType) {
		switch (uiType) {
			case UITypes.ReactNative:
				eventName = 'onPress';
				break;
			case UITypes.ReactWeb:
			case UITypes.ElectronIO:
				eventName = 'onClick';
				break;
		}
	}

	let context: any = {
		...args,
		node0: args.component
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
					operation: 'NEW_COMPONENT_NODE',
					options: {
						parent: context.node0,
						groupProperties: {},
						properties: {
							UIType: 'ElectronIO',
							...viewPackages
						},
						linkProperties: {
							properties: {
								type: 'component',
								stroke: '#B7245C',
								component: {}
							}
						},
						callback: function(node: { id: any }) {
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
						value: args.componentType || 'Button'
					}
				}
			];
		},

		function() {
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
							UseAsValue: true,
							...viewPackages
						},
						callback: function(node: { id: any }, graph: any, group: any) {
							context.node2 = node.id;
							context.group0 = group;
						}
					}
				}
			];
		},

		function() {
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
							Pinned: false,
							...viewPackages
						},
						callback: function(node: { id: any }) {
							context.node3 = node.id;
						}
					}
				}
			];
		},

		function() {
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

		function() {
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

		function() {
			return [
				{
					operation: 'CONNECT_TO_TITLE_SERVICE',
					options: {
						id: context.node3
					}
				}
			];
		},

		function() {
			return [
				{
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'EventMethod',
						properties: {
							EventType: eventName || 'onClick',
							text: eventName || 'onClick',
							...viewPackages
						},
						links: [
							function() {
								return [
									{
										target: context.node1,
										linkProperties: {
											properties: {
												type: 'EventMethod',
												EventMethod: {}
											}
										}
									}
								];
							}
						],
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
					operation: 'ADD_NEW_NODE',
					options: {
						nodeType: 'EventMethodInstance',
						parent: context.node4,
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'EventMethodInstance',
								EventMethodInstance: {}
							}
						},
						properties: {
							text: eventName ? `${eventName} Instance` : 'onClick Instance',
							Pinned: false,
							...viewPackages,
							AutoDelete: {
								properties: {
									nodeType: 'component-api-connector'
								}
							}
						},
						callback: function(node: { id: any }, graph: any, group: any) {
							context.node5 = node.id;
							context.group1 = group;
						}
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
	return [
		...result,
		...clearPinned,
		function() {
			if (context.callback) {
        context.entry = context.node0;
        context.event = context.node4;
				context.eventInstance = context.node5;
				context.callback(context);
			}
			return [];
		}
	];
}
