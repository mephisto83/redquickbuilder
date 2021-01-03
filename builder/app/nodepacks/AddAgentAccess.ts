/* eslint-disable func-names */

import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';
import { GetNodeTitle } from '../actions/uiActions';

export default function AddAgentAccess(args: any = {}) {
	// node1,node2
	args.model = GetNodeTitle(args.dashboardId || args.modelId);
	args.agent = GetNodeTitle(args.agentId);
	const {
		linkProps,
		methodProps,
		routingProps,
		mountingProps,
		effectProps,
		screenEffectApiProps,
		screenVisualInsertApiProps,
		dashboardAccessProps,
		dashboardViewMountProps,
		componentDidMountApiProps,
		dashboardComponentDidMountApiProps,
		dashboardEffectProps,
		dashboardRoutingProps,
		dashboardScreenEffectApiProps
	} = args;
	// model, agent
	if (!args.model) {
		throw new Error('missing model argument');
	}
	if (!args.agent) {
		throw new Error('missing agent argument');
	}
	const context = {
		...args,
		node1: args.dashboardId || args.modelId,
		node2: args.agentId
	};
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	const result = [
		function () {
			return [
				{
					operation: 'NEW_NODE',
					options: {
						callback: function (node: { id: any }) {
							context.node0 = node.id;
						}
					}
				}
			];
		},

		function () {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: context.node0,
						value: `[Access] ${args.model} by ${args.agent}`
					}
				}
			];
		},

		function () {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'nodeType',
						id: context.node0,
						value: 'action'
					}
				}
			];
		},

		function () {
			return [
				{
					operation: 'CHANGE_NODE_PROPERTY',
					options: {
						prop: 'nodeType',
						id: context.node0,
						value: 'AgentAccessDescription'
					}
				}
			];
		},

		function () {
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

		function () {
			return [
				{
					operation: 'NEW_LINK',
					options: {
						target: context.node1,
						source: context.node0,
						properties: {
							type: args.dashboardId ? 'DashboardAccess' : 'ModelAccess',
							ModelAccess: {},
							nodeTypes: ['model']
						}
					}
				}
			];
		},

		function () {
			return [
				{
					operation: 'NEW_LINK',
					options: {
						source: context.node2,
						target: context.node0,
						properties: {
							type: 'AgentAccess',
							AgentAccess: {},
							nodeTypes: ['model'],
							...linkProps,
							methodProps,
							routingProps,
							mountingProps,
							screenEffectApiProps,
							screenVisualInsertApiProps,
							componentDidMountApiProps,
							dashboardComponentDidMountApiProps,
							effectProps,
							dashboardScreenEffectApiProps,
							dashboardEffectProps,
							dashboardAccessProps,
							dashboardViewMountProps,
							dashboardRoutingProps,
							properties: {
								isAgent: true
							}
						}
					}
				}
			];
		}
	];
	const clearPinned = [
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node0,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node1,
					value: false
				};
			}
		},
		{
			operation: 'CHANGE_NODE_PROPERTY',
			options() {
				return {
					prop: 'Pinned',
					id: context.node2,
					value: false
				};
			}
		}
	];
	const applyViewPackages = [
		{
			operation: 'UPDATE_NODE_PROPERTY',
			options() {
				return {
					id: context.node0,
					properties: viewPackages
				};
			}
		}
	];
	return [
		...result,
		...clearPinned,
		...applyViewPackages,
		function () {
			if (context.callback) {
				context.entry = context.node0;
				context.callback(context);
			}
			return [];
		}
	];
}
