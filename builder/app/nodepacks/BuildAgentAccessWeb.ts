import { NodesByType, LinksByType } from '../methods/graph_methods';
import { NodeTypes, LinkProperties, LinkPropertyKeys, NodeProperties, LinkType } from '../constants/nodetypes';
import {
	REMOVE_NODE,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetCurrentGraph,
	AddLinkBetweenNodes,
	CreateNewNode,
	GetNodeTitle,
	REMOVE_LINK
} from '../actions/uiactions';
import AddAgentAccess from './AddAgentAccess';
import { ScreenEffectApi, ScreenEffect, ViewMounting, MountingDescription } from '../interface/methodprops';
import { GraphLink } from '../methods/graph_types';

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
	const contextParams = NodesByType(graph, NodeTypes.ContextualParameters);
	let screenEffects = NodesByType(graph, NodeTypes.ScreenEffectApi);
	let links = LinksByType(graph, LinkType.NavigationScreen);
	const result: any[] = [ ...contextParams, ...agentAccesss, ...screenEffects ].map((v: any) => ({
		operation: REMOVE_NODE,
		options() {
			return {
				id: v.id
			};
		}
	}));
	result.push(
		links.map((link: GraphLink) => {
			return {
				operation: REMOVE_LINK,
				options() {
					return {
						id: link.id
					};
				}
			};
		})
	);
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
					let urlParametersForMounting: string[] = getUrlParametersForMounting(mounting);

					result.push(...temp, () =>
						screenEffectGen(screenEffect, agentAccessContext, urlParametersForMounting, dashboard, agent)
					);
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
							return Object.keys(screenEffect).filter((d) => screenEffect[d]).map((key: string) => {
								let urlParametersForMounting = mounting[key]
									? getUrlParametersForMounting(mounting[key])
									: [];

								return screenEffectGen(
									screenEffect[key],
									agentAccessContext,
									urlParametersForMounting,
									model,
									agent
								);
							});
						},
						() => {
							let result: any[] = [];
							Object.keys(effects).filter((d) => effects[d]).forEach((key) => {
								let _effects = effects[key];
								if (_effects && _effects.length) {
									_effects.forEach((_ef: ScreenEffectApi) => {
										let newnode: any;
										let contextualNode: any;
										let urlParametersForMounting = mounting[key]
											? getUrlParametersForMounting(mounting[key])
											: [];
										let contextualParameters = CreateNewNode(
											{
												[NodeProperties.NODEType]: NodeTypes.ContextualParameters,
												[NodeProperties.ContextParams]: urlParametersForMounting,
												[NodeProperties.DataChain]: effects[key].dataChain,
												[NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(
													agent
												)} ${key} CP`
											},
											(node: any) => {
												contextualNode = node;
											}
										);
										result.push(
											CreateNewNode(
												{
													[NodeProperties.NODEType]: NodeTypes.ScreenEffectApi,
													[NodeProperties.DataChain]: _ef.dataChain,
													[NodeProperties.UIText]: _ef.name
												},
												(node: any) => {
													newnode = node;
												}
											),
											contextualParameters,
											function() {
												return AddLinkBetweenNodes(
													contextualNode.id,
													effects[key].dataChain,
													LinkProperties.ContextualParameters
												);
											},
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

function screenEffectGen(
	screenEffect: any,
	agentAccessContext: any,
	urlParametersForMounting: string[],
	dashboard: any,
	agent: any
): any {
	return () => {
		return screenEffect
			.filter((x: ScreenEffectApi) => agentAccessContext && x.dataChain)
			.map((effect: ScreenEffectApi) => {
				let newnode: any;
				let contextualNode: any;
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
				let contextualParameters = CreateNewNode(
					{
						[NodeProperties.NODEType]: NodeTypes.ContextualParameters,
						[NodeProperties.ContextParams]: urlParametersForMounting,
						[NodeProperties.DataChain]: effect.dataChain,
						[NodeProperties.UIText]: `${GetNodeTitle(dashboard)} ${GetNodeTitle(agent)} CP`
					},
					(node: any) => {
						contextualNode = node;
					}
				);
				return [
					createNewNode,
					contextualParameters,
					function() {
						return AddLinkBetweenNodes(
							contextualNode.id,
							effect.dataChain,
							LinkProperties.ContextualParameters
						);
					},
					function() {
						return AddLinkBetweenNodes(newnode.id, effect.dataChain, LinkProperties.ScreenEffectApi);
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
	};
}

function getUrlParametersForMounting(mounting: any) {
	let urlParametersForMounting: string[] = [];
	if (mounting) {
		let viewMounting: ViewMounting = mounting;
		if (viewMounting && viewMounting.mountings) {
			viewMounting.mountings.forEach((mounting: MountingDescription) => {
				if (mounting.source) {
					urlParametersForMounting.push(...Object.keys(mounting.source));
				}
			});
		}
	}
	urlParametersForMounting = urlParametersForMounting.unique();
	return urlParametersForMounting;
}
