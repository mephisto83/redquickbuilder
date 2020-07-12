import {
	NodesByType,
	LinksByType,
	GetNodesByProperties,
	GetLinkBetween,
	updateLinkProperty
} from '../methods/graph_methods';
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
	REMOVE_LINK,
	GetNodeByProperties,
	GetNodeById,
	GetNodeProp,
	UpdateLinkProperty
} from '../actions/uiactions';
import AddAgentAccess from './AddAgentAccess';
import {
	ScreenEffectApi,
	ScreenEffect,
	ViewMounting,
	MountingDescription,
	DashboardRouting,
	Routing,
	RouteDescription,
	RoutingProps
} from '../interface/methodprops';
import { GraphLink, Graph } from '../methods/graph_types';
import { ViewTypes } from '../constants/viewtypes';

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
	const navigationScreens = NodesByType(graph, NodeTypes.NavigationScreen).filter(
		(x: Node) => !GetNodeProp(x, NodeProperties.IsDashboard)
	);
	let screenEffects = NodesByType(graph, NodeTypes.ScreenEffectApi);
	let links = LinksByType(graph, LinkType.NavigationScreen);
	const result: any[] = [
		...navigationScreens,
		...contextParams,
		...agentAccesss,
		...screenEffects
	].map((v: any) => ({
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
				const routing: Routing =
					dashboardRouting[agent] && dashboardRouting[agent][dashboard]
						? dashboardRouting[agent][dashboard] || {}
						: null;
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
						[LinkPropertyKeys.DashboardRoutingProps]: { ...routing || {} },
						[LinkPropertyKeys.DashboardViewMountProps]: { ...mounting },
						[LinkPropertyKeys.DashboardEffectProps]: { ...effects },
						callback: ($: { entry: string }) => {
							agentAccessContext = $;
						}
					});
					result.push(temp);

					let urlParametersForMounting: string[] = getUrlParametersForMounting(mounting);
					if (routing) {
						result.push(() => {
							return buildDashboardRouting(dashboard, agent, routing, () => agentAccessContext);
						});
					}
					result.push(() =>
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
				const routing: RoutingProps =
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
					if (routing) {
						result.push(() => {
							return buildAgentModelRouting(model, agent, routing, () => agentAccessContext, values);
						});
					}
				}
			}
		});
	});

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}

function buildAgentModelRouting(
	model: string,
	agent: string,
	dashboardRouting: RoutingProps,
	agentAccessContext: () => { entry: string },
	values: any
) {
	let graph = GetCurrentGraph();
	return Object.keys(ViewTypes)
		.filter((v) => v !== ViewTypes.Delete)
		.filter((v: string) => {
			return values[v];
		})
		.map((viewType) => {
			let result: any[] = [];
			let navigationScreen = GetNodesByProperties(
				{
					[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
					[NodeProperties.Model]: model,
					[NodeProperties.Agent]: agent,
					[NodeProperties.ViewType]: viewType
				},
				graph
			).find((x: Node) => !GetNodeProp(x, NodeProperties.IsDashboard));
			if (!navigationScreen) {
				result.push(
					CreateNewNode(
						{
							[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
							[NodeProperties.Agent]: agent,
							[NodeProperties.Model]: model,
							[NodeProperties.ViewType]: viewType,
							[NodeProperties.UIText]: `${GetNodeTitle(agent)} ${GetNodeTitle(model)} ${viewType}`
						},
						(_node: Node) => {
							navigationScreen = _node;
						}
					)
				);
			}
			result.push(() => {
				let routing = dashboardRouting[viewType];
				if (routing) return buildRouting(routing, navigationScreen, agent, agentAccessContext);
				return [];
			});
			return result;
		});
}
function buildDashboardRouting(
	dashboard: string,
	agent: string,
	dashboardRouting: Routing,
	agentAccessContext: () => { entry: string }
) {
	let navigationScreen = GetNodeById(dashboard);
	if (navigationScreen) {
		let routing = dashboardRouting;
		let results = buildRouting(routing, navigationScreen, agent, agentAccessContext);

		return results;
	}
	return [];
}
function buildRouting(
	routing: Routing,
	navigationScreen: any,
	agent: string,
	agentAccessContext: () => { entry: string }
) {
	return routing.routes.map((route: RouteDescription) => {
		let result: any[] = [];
		if (route.isDashboard && route.dashboard) {
			result.push(AddLinkBetweenNodes(navigationScreen.id, route.dashboard, LinkProperties.NavigationScreen));
		} else if (!route.isDashboard) {
			let targetNaviScreen = GetNodesByProperties(
				{
					[NodeProperties.Agent]: agent,
					[NodeProperties.Model]: route.model,
					[NodeProperties.ViewType]: route.viewType
				},
				GetCurrentGraph()
			).find((v: Node) => !GetNodeProp(v, NodeProperties.IsDashboard));
			let entry = agentAccessContext().entry;
			if (entry && !targetNaviScreen) {
				result.push(
					CreateNewNode(
						{
							[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
							[NodeProperties.Agent]: agent,
							[NodeProperties.Model]: route.model,
							[NodeProperties.ViewType]: route.viewType,
							[NodeProperties.UIText]: `${GetNodeTitle(agent)} ${GetNodeTitle(
								route.model
							)} ${route.viewType}`
						},
						(_node: Node) => {
							targetNaviScreen = _node;
						}
					)
				);
			}
			result.push(() => {
				return AddLinkBetweenNodes(navigationScreen.id, targetNaviScreen.id, LinkProperties.NavigationScreen);
			});
			result.push((currentGraph: Graph) => {
				let link = GetLinkBetween(navigationScreen.id, targetNaviScreen.id, currentGraph);
				if (link) return UpdateLinkProperty(link.id, LinkPropertyKeys.AgentAccess, agentAccessContext().entry);
				return [];
			});
			result.push((currentGraph: Graph) => {
				let link = GetLinkBetween(navigationScreen.id, targetNaviScreen.id, currentGraph);
				return UpdateLinkProperty(link.id, LinkPropertyKeys.RoutingDescriptionId, route.id);
			});
		}
		return result;
	});
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
