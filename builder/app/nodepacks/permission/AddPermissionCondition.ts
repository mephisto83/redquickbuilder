import { uuidv4 } from '../../utils/array';
import { NodeProperties } from '../../constants/nodetypes';
export interface PermissionItem {
	property: string;
	validators: any[];
}
export default function(args: {
	permissionNode?: any;
	functionType: string;
	properties: PermissionItem[];
	viewPackages?: any;
}) {
	// node0,node2,node3,node4,node5,node6,node7,node8

	//
	if (!args.permissionNode) {
		throw new Error('no permission nod');
	}
	if (!args.functionType) {
		// 'Create/Object => Object'
		throw new Error('no function type set');
	}
	let context: any = {
		...args,
		node0: args.permissionNode
	};
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	let conditionProperties = {};
	args.properties.forEach((prop: PermissionItem) => {
		let validators: any = {};
		prop.validators.forEach((vali) => {
			validators[uuidv4()] = vali;
		});
		conditionProperties = {
			...conditionProperties,
			...{
				[prop.property]: {
					validators
				}
			}
		};
	});

	let result = [
		function() {
			return [
				{
					operation: 'NEW_CONDITION_NODE',
					options: {
						parent: context.node0,
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'condtion',
								condtion: {}
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
						prop: 'Condition',
						id: context.node1,
						value: {
							methods: {
								[context.functionType]: {
									agent: {
										properties: conditionProperties
									}
								}
							}
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
						id: context.node1,
						prop: 'Executor',
						value: {
							properties: conditionProperties
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
					id: context.node4,
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
					id: context.node1,
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
