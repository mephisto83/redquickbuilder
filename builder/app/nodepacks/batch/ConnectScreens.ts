import {
	NodesByType,
	GetNodeProp,
	GetMethodNodeProp,
	GetStateFunc,
	GetDispatchFunc,
	graphOperation,
	ScreenOptionFilter,
	GetLinkProperty,
	GetCurrentGraph,
	GetMethodProps,
	GetNodesByProperties,
	GetNodeTitle,
	AddLinkBetweenNodes
} from '../../actions/uiActions';

import { NodeTypes, NodeProperties, LinkType, LinkPropertyKeys, LinkProperties } from '../../constants/nodetypes';
import { MethodFunctions, FunctionTemplateKeys } from '../../constants/functiontypes';
import { ViewTypes } from '../../constants/viewtypes';
import ScreenConnectGet from '../screens/ScreenConnectGet';
import ScreenConnectGetAll from '../screens/ScreenConnectGetAll';
import ScreenConnectCreate from '../screens/ScreenConnectCreate';
import SetupEffect, { GetEffect } from './ConnectScreen/SetupEffect';
import ScreenConnectUpdate from '../screens/ScreenConnectUpdate';

import { Node, GraphLink } from '../../methods/graph_types';
import { GetNodeLinkedTo, findLink, SetPause, Paused, GetNodesLinkedTo } from '../../methods/graph_methods';
import {
	MethodDescription,
	ViewMoutingProps,
	ViewMounting,
	Effect,
	EffectProps,
	RoutingProps,
	Routing,
	ScreenEffectApiProps,
	ScreenEffectApi,
	DashboardViewMount,
	DashboardEffect,
	DashboardRouting,
	DashboardScreenEffectApiProps,
	ScreenVisualInsert
} from '../../interface/methodprops';
import SetupViewMouting, { GetViewMounting, GetDashboardViewMounting } from './ConnectScreen/SetupViewMouting';
import SetupRoute, { GetRoute } from './ConnectScreen/SetupRoute';
import { RedressScreenProperties } from './RedressProperties';
import SetupScreenEffects, { GetScreenEffectApi } from './ConnectScreen/SetupScreenEffects';
import AddDefaultAgentExistsDatachains from './AddDefaultAgentExistsDatachains';

export default async function ConnectScreens(progresFunc: any, filter?: any) {
	const allscreens = NodesByType(null, NodeTypes.Screen);
	const screens = allscreens.filter(ScreenOptionFilter);
	let paused = Paused();
	SetPause(true);
	await screens
		.filter((screen: any) => (filter ? filter(screen) : true))
		.forEachAsync(async (screen: Node, index: number, total: number) => {
			const viewType = GetNodeProp(screen, NodeProperties.ViewType);
			const agent = GetNodeProp(screen, NodeProperties.Agent);
			const model = GetNodeProp(screen, NodeProperties.Model);

			// Get Agent Access Description
			let agentAccessDescription: Node | null = GetAgentAccessDescriptionNode(agent, model, viewType);
			if (agentAccessDescription) {
				let agentLink = GetAgentAccessDescriptionAgentLink(agent, model, viewType);
				if (agentLink) {
					AddDefaultAgentExistsDatachains(screen);
					let mountingProps: ViewMoutingProps = GetLinkProperty(agentLink, LinkPropertyKeys.MountingProps);
					let viewMounting: ViewMounting | null = GetViewMounting(mountingProps, viewType);
					if (viewMounting) {
						SetupViewMouting(screen, viewMounting, { agent, model, viewType, agentAccessDescription });
					}
					let effectProps: EffectProps = GetLinkProperty(agentLink, LinkPropertyKeys.EffectProps);
					let effect: Effect | null = GetEffect(effectProps, viewType);
					if (effect) {
						SetupEffect(screen, effect, { agent, model, viewType, agentAccessDescription });
					}

					let routingProps: RoutingProps = GetLinkProperty(agentLink, LinkPropertyKeys.RoutingProps);
					let route: Routing | null = GetRoute(routingProps, viewType);
					if (route) {
						SetupRoute(screen, route, { agent, model, viewType, agentAccessDescription });
					}
					let screenEffectsProps: ScreenEffectApiProps = GetLinkProperty(
						agentLink,
						LinkPropertyKeys.ScreenEffectApiProps
					);
					let screenEffects: ScreenEffectApi[] | null = GetScreenEffectApi(screenEffectsProps, viewType);
					if (screenEffects) {
						SetupScreenEffects(screen, screenEffects, { agent, model, viewType, agentAccessDescription });
					}
					let screenVisualInsertApiProps: { [str: string]: ScreenVisualInsert[] } = GetLinkProperty(agentLink, LinkPropertyKeys.ScreenVisualInsertApiProps);
					if (screenVisualInsertApiProps) {
						SetupVisualInsertsMethods(screen, screenVisualInsertApiProps)
					}

				} else {
					console.log('Agent link missing, this should never happen');
					throw new Error('agent link missing');
				}
			} else {
				if (GetNodeProp(screen, NodeProperties.IsDashboard)) {
					console.log('Is dashboard, find the access');
					AddDefaultAgentExistsDatachains(screen);
					let navigationScreen = GetNavigationScreen(screen);
					if (navigationScreen) {
						let dashboardAccesses: Node[] = GetNodesLinkedTo(GetCurrentGraph(), {
							id: navigationScreen.id,
							link: LinkType.DashboardAccess
						});
						dashboardAccesses.forEach((dashboardAccess: Node) => {
							let agent = GetNodeLinkedTo(GetCurrentGraph(), {
								id: dashboardAccess.id,
								link: LinkType.AgentAccess
							});
							if (agent) {
								let agentLink = findLink(GetCurrentGraph(), {
									source: agent.id,
									target: dashboardAccess.id
								});
								if (agentLink) {
									let mountingProps: ViewMounting = GetLinkProperty(
										agentLink,
										LinkPropertyKeys.DashboardViewMountProps
									);
									let viewMounting: ViewMounting = mountingProps;
									if (viewMounting) {
										SetupViewMouting(screen, viewMounting, {
											agent,
											model,
											viewType,
											agentAccessDescription: dashboardAccess
										});
									}

									let effectProps: Effect = GetLinkProperty(
										agentLink,
										LinkPropertyKeys.DashboardEffectProps
									);
									let effect: Effect = effectProps;
									if (effect) {
										SetupEffect(screen, effect, {
											agent,
											model,
											viewType,
											agentAccessDescription: dashboardAccess
										});
									}

									let routingProps: Routing = GetLinkProperty(
										agentLink,
										LinkPropertyKeys.DashboardRoutingProps
									);
									let route: Routing = routingProps;
									if (route) {
										SetupRoute(screen, route, {
											agent,
											model,
											viewType,
											agentAccessDescription: dashboardAccess
										});
									}

									let screenEffectsProps: ScreenEffectApi[] = GetLinkProperty(
										agentLink,
										LinkPropertyKeys.DashboardScreenEffectApiProps
									);
									let screenEffects: ScreenEffectApi[] = screenEffectsProps;
									if (screenEffects) {
										SetupScreenEffects(screen, screenEffects, {
											agent,
											model,
											viewType,
											agentAccessDescription: dashboardAccess
										});
									}
									let screenVisualInsertApiProps: ScreenVisualInsert[] = GetLinkProperty(agentLink, LinkPropertyKeys.DashboardScreenVisualInsertApiProps);
									if (screenVisualInsertApiProps) {
										SetupVisualInserts(screen, screenVisualInsertApiProps)
									}

								}
							}
						});
					}
				} else {
					console.log(
						`No agent access description for agent: ${GetNodeTitle(agent)} model: ${GetNodeTitle(
							agent
						)} viewType: ${viewType}`
					);
				}
			}
			// Setup mounting functions

			RedressScreenProperties(screen.id);
		});
	SetPause(paused);
}

export async function ConnectScreenListRoutes(progresFunc: any, filter?: any) {
	const allscreens = NodesByType(null, NodeTypes.Screen);
	const screens = allscreens.filter(ScreenOptionFilter);
	let paused = Paused();
	SetPause(true);
	await screens
		.filter((screen: any) => (filter ? filter(screen) : true))
		.forEachAsync(async (screen: Node, index: number, total: number) => {
			const viewType = GetNodeProp(screen, NodeProperties.ViewType);
			const agent = GetNodeProp(screen, NodeProperties.Agent);
			const model = GetNodeProp(screen, NodeProperties.Model);

			// Get Agent Access Description
			let agentAccessDescription: Node | null = GetAgentAccessDescriptionNode(agent, model, viewType);
			if (agentAccessDescription) {
				let agentLink = GetAgentAccessDescriptionAgentLink(agent, model, viewType);
				if (agentLink) {

					let routingProps: RoutingProps = GetLinkProperty(agentLink, LinkPropertyKeys.RoutingProps);
					let route: Routing | null = GetRoute(routingProps, viewType);
					if (route) {
						SetupRoute(screen, route, { agent, model, viewType, agentAccessDescription }, true);
					}
				} else {
					console.log('Agent link missing, this should never happen');
					throw new Error('agent link missing');
				}
			} else {
				if (GetNodeProp(screen, NodeProperties.IsDashboard)) {
					let navigationScreen = GetNavigationScreen(screen);
					if (navigationScreen) {
						let dashboardAccesses: Node[] = GetNodesLinkedTo(GetCurrentGraph(), {
							id: navigationScreen.id,
							link: LinkType.DashboardAccess
						});
						dashboardAccesses.forEach((dashboardAccess: Node) => {
							let agent = GetNodeLinkedTo(GetCurrentGraph(), {
								id: dashboardAccess.id,
								link: LinkType.AgentAccess
							});
							if (agent) {
								let agentLink = findLink(GetCurrentGraph(), {
									source: agent.id,
									target: dashboardAccess.id
								});
								if (agentLink) {
									let routingProps: Routing = GetLinkProperty(
										agentLink,
										LinkPropertyKeys.DashboardRoutingProps
									);
									let route: Routing = routingProps;
									if (route) {
										SetupRoute(screen, route, {
											agent,
											model,
											viewType,
											agentAccessDescription: dashboardAccess
										}, true);
									}
								}
							}
						});
					}
				} else {
					console.log(
						`No agent access description for agent: ${GetNodeTitle(agent)} model: ${GetNodeTitle(
							agent
						)} viewType: ${viewType}`
					);
				}
			}
		});
	SetPause(paused);
}

function GetNavigationScreen(screen: Node) {
	let screenImplemenetation = GetNodeLinkedTo(GetCurrentGraph(), {
		id: screen.id,
		link: LinkType.NavigationScreenImplementation
	});
	return screenImplemenetation;
}

function GetAgentAccessDescriptionNode(agentId: string, modelId: string, viewType: string): Node | null {
	let graph = GetCurrentGraph();
	let agentAccessDescriptions: Node[] = NodesByType(null, NodeTypes.AgentAccessDescription);
	return (
		agentAccessDescriptions.find((agentAccess: Node) => {
			let model = GetNodeLinkedTo(graph, {
				id: agentAccess.id,
				link: LinkType.ModelAccess
			});
			if (model && model.id === modelId) {
				let agent = GetNodeLinkedTo(graph, {
					id: agentAccess.id,
					link: LinkType.AgentAccess
				});
				if (agent && agent.id === agentId) {
					let agentLink = findLink(graph, {
						target: agentAccess.id,
						source: agent.id
					});
					if (agentLink) {
						return GetLinkProperty(agentLink, viewType);

						// let methodProps: any = GetLinkProperty(agentLink, LinkPropertyKeys.MethodProps);
						// if (methodProps) {
						// 	if (methodProps[viewType]) {
						// 		return true;
						// 	}
						// }
					}
				}
			}
			return false;
		}) || null
	);
}
function GetAgentAccessDescriptionAgentLink(agentId: string, modelId: string, viewType: string): GraphLink | null {
	let graph = GetCurrentGraph();
	let agentAccessDescriptions: Node[] = NodesByType(null, NodeTypes.AgentAccessDescription);
	let result: GraphLink | null = null;
	agentAccessDescriptions.find((agentAccess: Node) => {
		let model = GetNodeLinkedTo(graph, {
			id: agentAccess.id,
			link: LinkType.ModelAccess
		});
		if (model && model.id === modelId) {
			let agent = GetNodeLinkedTo(graph, {
				id: agentAccess.id,
				link: LinkType.AgentAccess
			});
			if (agent && agent.id === agentId) {
				let agentLink = findLink(graph, {
					target: agentAccess.id,
					source: agent.id
				});
				if (agentLink) {
					if (GetLinkProperty(agentLink, viewType)) {
						result = agentLink;
						return true;
					}
					// let methodProps: any = GetLinkProperty(agentLink, LinkPropertyKeys.MethodProps);
					// if (methodProps) {
					// 	if (methodProps[viewType]) {
					// 		result = agentLink;
					// 		return true;
					// 	}
					// }
				}
			}
		}
		return false;
	});
	return result;
}
export async function ConnectScreens_Old(progresFunc: any, filter?: any) {
	const allscreens = NodesByType(null, NodeTypes.Screen);
	const screens = allscreens.filter(ScreenOptionFilter);
	await screens
		.filter((screen: any) => (filter ? filter(screen) : true))
		.forEachAsync(async (screen: any, index: any, total: any) => {
			const viewType = GetNodeProp(screen, NodeProperties.ViewType);

			const methods = GetPossibleMethods(screen);

			const navigateToScreens = GetPossibleNavigateScreens(screen, allscreens);

			const componentsDidMounts = GetPossibleComponentDidMount(screen);

			if (methods.length) {
				let commands = [];
				switch (viewType) {
					case ViewTypes.Get:
						commands = ScreenConnectGet({
							method: methods[0].id,
							node: screen.id,
							navigateTo: navigateToScreens.length ? navigateToScreens[0].id : null
						});
						break;
					case ViewTypes.GetAll:
						commands = ScreenConnectGetAll({
							method: methods[0].id,
							node: screen.id,
							navigateTo: navigateToScreens.length ? navigateToScreens[0].id : null
						});
						break;
					case ViewTypes.Create:
						commands = ScreenConnectCreate({
							method: methods[0].id,
							node: screen.id
						});
						break;
					case ViewTypes.Update:
						commands = ScreenConnectUpdate({
							method: methods[0].id,
							componentDidMountMethods: componentsDidMounts.map((x: any) => x.id),
							node: screen.id
						});
						break;
					default:
						break;
				}

				graphOperation([...commands])(GetDispatchFunc(), GetStateFunc());
			}
			await progresFunc(index / total);
		});
}

export function GetPossibleNavigateScreens(screen: any, allscreens: any) {
	const screens = allscreens || NodesByType(null, NodeTypes.Screen);
	const viewType = GetNodeProp(screen, NodeProperties.ViewType);
	const screenModel = GetNodeProp(screen, NodeProperties.Model);
	const agentId = GetNodeProp(screen, NodeProperties.Agent);

	return screens
		.filter((x: { id: any }) => x.id !== screen.id)
		.filter((x: any) => {
			if (viewType === ViewTypes.Get) {
				return GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Update;
			}
			return GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Get;
		})
		.filter((x: any) => {
			if (screenModel) {
				const agent = GetMethodNodeProp(x, FunctionTemplateKeys.Agent);
				return agent === agentId;
			}
			return false;
		})
		.filter((x: any) => {
			if (screenModel) {
				const modelOutput = GetNodeProp(x, NodeProperties.Model);
				return modelOutput === screenModel;
			}
			return true;
		});
}

export function GetPossibleComponentDidMount(screen: any) {
	const screenModel = GetNodeProp(screen, NodeProperties.Model);
	return NodesByType(null, NodeTypes.Method)
		.filter(
			(x: any) => (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method === ViewTypes.Get
		)
		.filter((x: string | Node) => {
			if (screenModel) {
				const modelOutput =
					GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) ||
					GetMethodNodeProp(x, FunctionTemplateKeys.Model);
				return modelOutput === screenModel;
			}
			return true;
		});
}
export function GetAccessAgentPreferredMethods(screen: any, agentId: string, screenModel: string, viewType: string) {
	const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);
	const graph = GetCurrentGraph();
	let result: Node[] = [];
	agentAccesses.filter((agentAccess: Node, mindex: any) => {
		let model = GetNodeLinkedTo(graph, {
			id: agentAccess.id,
			link: LinkType.ModelAccess
		});
		let agent = GetNodeLinkedTo(graph, {
			id: agentAccess.id,
			link: LinkType.AgentAccess
		});
		if (model && agent) {
			let agentLink = findLink(graph, {
				target: agentAccess.id,
				source: agent.id
			});
			if (agentLink) {
				let methodProps: any = GetLinkProperty(agentLink, LinkPropertyKeys.MethodProps);
				if (methodProps) {
					let methodDescription: MethodDescription = methodProps[viewType];
					if (methodDescription) {
						methodDescription.functionType;
						let functionType = methodDescription.functionType;
						if (functionType) {
							result.push(
								...GetNodesByProperties({
									[NodeProperties.FunctionType]: functionType,
									[NodeProperties.NODEType]: NodeTypes.Method
								}).filter((methodNode: Node) => {
									let methodProps = GetMethodProps(methodNode);
									return (
										methodProps[FunctionTemplateKeys.Model] === model.id &&
										methodProps[FunctionTemplateKeys.Agent] === agent.id
									);
								})
							);
						}
					}
				}
			}
		}
	});

	return result;
}
export function GetPossibleMethods(screen: any) {
	const viewType = GetNodeProp(screen, NodeProperties.ViewType);
	const screenModel = GetNodeProp(screen, NodeProperties.Model);
	const agentId = GetNodeProp(screen, NodeProperties.Agent);

	let preferredMethods = GetAccessAgentPreferredMethods(screen, agentId, screenModel, viewType);
	if (preferredMethods && preferredMethods.length) {
		return preferredMethods;
	}
	return NodesByType(null, NodeTypes.Method)
		.filter((x: string | Node) => {
			if (screenModel) {
				const agent = GetMethodNodeProp(x, FunctionTemplateKeys.Agent);
				return agent === agentId;
			}
			return false;
		})
		.filter((x: any) => {
			const functionType = MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {};
			return functionType.method === viewType && !functionType.isFetchCompatible;
		})
		.filter((x: string | Node) => {
			if (screenModel) {
				const modelOutput =
					GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) ||
					GetMethodNodeProp(x, FunctionTemplateKeys.Model);
				return modelOutput === screenModel;
			}
			return true;
		});
}

export function SetupVisualInsertsMethods(screen: Node, screenVisualInsertApiProps: { [str: string]: ScreenVisualInsert[] }) {
	if (screenVisualInsertApiProps) {
		let methods = ['Get', 'GetAll', 'Update', 'Create'];
		methods.forEach((method: string) => {
			if (screenVisualInsertApiProps[method]) {
				SetupVisualInserts(screen, screenVisualInsertApiProps[method]);
			}
		})
	}
}
export function SetupVisualInserts(screen: Node, screenVisualInsertApiProps: ScreenVisualInsert[]) {
	let screenOptions: Node[] = GetNodesLinkedTo(GetCurrentGraph(), {
		id: screen.id,
		componentType: NodeTypes.ScreenOption
	});
	let results: any[] = [];
	screenVisualInsertApiProps.forEach((svi: ScreenVisualInsert) => {
		if (svi && svi.isReference && svi.reference) {
			let reference = svi.reference;
			screenOptions.forEach((sco: Node) => {
				results.push(AddLinkBetweenNodes(reference, sco.id, {
					...LinkProperties.ScreenVisualInsert
				}));
			})
		}
	});

	graphOperation(results)(GetDispatchFunc(), GetStateFunc());
}