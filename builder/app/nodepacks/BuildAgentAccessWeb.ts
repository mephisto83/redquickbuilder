import { NodesByType } from '../methods/graph_methods';
import { NodeTypes, LinkProperties, LinkPropertyKeys, NodeProperties } from '../constants/nodetypes';
import {
	REMOVE_NODE,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetCurrentGraph,
	AddLinkBetweenNodes,
	CreateNewNode
} from '../actions/uiactions';
import AddAgentAccess from './AddAgentAccess';
import { ScreenEffectApi, ScreenEffect } from '../interface/methodprops';

export default function BuildAgentAccessWeb(args: any) {
	const {
		dashboardAccess,
		dashboardRouting,
		dashboardViewMount,
		dashboardScreenEffect,
		dashboardEffect,
		dashboards,
		agents,
		models,
		agentViewMount,
		agentRouting,
		agentScreenEffect,
		agentAccess,
		agentMethod,
		agentEffect
	} = args;

	const graph = GetCurrentGraph();

	const agentAccesss = NodesByType(graph, NodeTypes.AgentAccessDescription);
	let screenEffects = NodesByType(graph, NodeTypes.ScreenEffectApi);
	const result: any[] = [ ...agentAccesss, ...screenEffects ].map((v: any) => ({
		operation: REMOVE_NODE,
		options() {
			return {
				id: v.id
			};
		}
	}));
	dashboards.forEach((dashboard: any) => {
		agents.forEach((agent: any) => {
			if (dashboardAccess && dashboardAccess[agent] && dashboardAccess[agent][dashboard]) {
				const values = dashboardAccess[agent][dashboard];
				const routing =
					dashboardRouting[agent] && dashboardRouting[agent][dashboard]
						? dashboardRouting[agent][dashboard] || {}
						: {};
				const mounting =
					dashboardViewMount[agent] && dashboardViewMount[agent][dashboard]
						? dashboardViewMount[agent][dashboard] || {}
						: {};
				const effects =
					dashboardEffect[agent] && dashboardEffect[agent][dashboard]
						? dashboardEffect[agent][dashboard] || {}
						: {};
				const screenEffect =
					dashboardScreenEffect[agent] && dashboardScreenEffect[agent][dashboard]
						? dashboardScreenEffect[agent][dashboard] || []
						: [];
				if (values && values.access) {
					let agentAccessContext: any = null;
					let temp: any = AddAgentAccess({
						dashboardId: dashboard,
						agentId: agent,
						linkProps: {},
						[LinkPropertyKeys.DashboardScreenEffectApiProps]: screenEffect,
						[LinkPropertyKeys.DashboardAccessProps]: values,
						[LinkPropertyKeys.DashboardRoutingProps]: { ...routing },
						[LinkPropertyKeys.DashboardViewMountProps]: { ...mounting },
						[LinkPropertyKeys.DashboardEffectProps]: { ...effects },
						callback: ($: { entry: string }) => {
							agentAccessContext = $;
						}
					});
					result.push(...temp, () => {
						return screenEffect
							.filter((x: ScreenEffectApi) => agentAccessContext && x.dataChain)
							.map((effect: ScreenEffectApi) => {
								let newnode: any;
								let createNewNode = CreateNewNode(
									{
										[NodeProperties.NODEType]: NodeTypes.ScreenEffectApi,
										[NodeProperties.DataChain]: effect.dataChain,
										[NodeProperties.UIText]: effect.name
									},
									(node: any) => {
										newnode = node;
									}
								);
								return [
									...createNewNode,
									function() {
										return AddLinkBetweenNodes(
											newnode.id,
											effect.dataChain,
											LinkProperties.ScreenEffectApi
										);
									},
									function() {
										return AddLinkBetweenNodes(
											newnode.id,
											agentAccessContext.entry,
											LinkProperties.ScreenEffectApi
										);
									}
								];
							});
					});
				}
			}
		});
	});
	models.forEach((model: any, modelIndex: any) => {
		agents.forEach((agent: any, agentIndex: any) => {
			if (agentAccess && agentAccess[agentIndex] && agentAccess[agentIndex][modelIndex]) {
				const values = agentAccess[agentIndex][modelIndex];
				const methods =
					agentMethod[agentIndex] && agentMethod[agentIndex][modelIndex]
						? agentMethod[agentIndex][modelIndex] || {}
						: {};
				const routing =
					agentRouting[agentIndex] && agentRouting[agentIndex][modelIndex]
						? agentRouting[agentIndex][modelIndex] || {}
						: {};
				const screenEffect =
					agentScreenEffect[agent] && agentScreenEffect[agent][model]
						? agentScreenEffect[agent][model] || {}
						: {};
				const mounting =
					agentViewMount[agentIndex] && agentViewMount[agentIndex][modelIndex]
						? agentViewMount[agentIndex][modelIndex] || {}
						: {};
				const effects =
					agentEffect[agentIndex] && agentEffect[agentIndex][modelIndex]
						? agentEffect[agentIndex][modelIndex] || {}
						: {};
				if (values) {
					let agentAccessContext: any = null;
					result.push(
						...AddAgentAccess({
							modelId: model,
							agentId: agent,
							linkProps: { ...values },
							[LinkPropertyKeys.ScreenEffectApiProps]: { ...screenEffect },
							[LinkPropertyKeys.MethodProps]: { ...methods },
							[LinkPropertyKeys.RoutingProps]: { ...routing },
							[LinkPropertyKeys.MountingProps]: { ...mounting },
							[LinkPropertyKeys.EffectProps]: { ...effects },
							callback: ($: { entry: string }) => {
								agentAccessContext = $;
							}
						}),
						() => {
							let result: any[] = [];
							Object.keys(effects).filter((d) => effects[d]).forEach((key) => {
								let _effects = effects[key];
								if (_effects && _effects.length) {
									_effects.forEach((_ef: ScreenEffectApi) => {
										let newnode: any;
										result.push(
											...CreateNewNode(
												{
													[NodeProperties.NODEType]: NodeTypes.ScreenEffectApi,
													[NodeProperties.DataChain]: _ef.dataChain,
													[NodeProperties.UIText]: _ef.name
												},
												(node: any) => {
													newnode = node;
												}
											),
											function() {
												return AddLinkBetweenNodes(
													newnode.id,
													agentAccessContext.entry,
													LinkProperties.ScreenEffectApi
												);
											},
											function() {
												return AddLinkBetweenNodes(
													newnode.id,
													_ef.dataChain,
													LinkProperties.ScreenEffectApi
												);
											}
										);
									});
								}
							});
							return result;
						}
					);
				}
			}
		});
	});

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
