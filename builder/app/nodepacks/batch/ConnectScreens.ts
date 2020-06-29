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
	GetNodeByProperties,
	GetMethodProps,
	GetNodesByProperties,
	GetNodeTitle,
	updateComponentProperty,
	ComponentApiKeys
} from '../../actions/uiactions';
import { NodeTypes, NodeProperties, LinkType, LinkPropertyKeys } from '../../constants/nodetypes';
import { MethodFunctions, FunctionTemplateKeys, FunctionTypes } from '../../constants/functiontypes';
import { ViewTypes } from '../../constants/viewtypes';
import ScreenConnectGet from '../screens/ScreenConnectGet';
import ScreenConnectGetAll from '../screens/ScreenConnectGetAll';
import ScreenConnectCreate from '../screens/ScreenConnectCreate';
import ScreenConnectUpdate from '../screens/ScreenConnectUpdate';
import SetupApiBetweenComponent from '../../nodepacks/SetupApiBetweenComponents';

import { Node, GraphLink } from '../../methods/graph_types';
import { GetNodeLinkedTo, findLink, GetNodesLinkedTo } from '../../methods/graph_methods';
import MethodProps, {
	MethodDescription,
	ViewMoutingProps,
	ViewMounting,
	MountingDescription
} from '../../interface/methodprops';

export default async function ConnectScreens(progresFunc: any, filter?: any) {
	const allscreens = NodesByType(null, NodeTypes.Screen);
	const screens = allscreens.filter(ScreenOptionFilter);
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
					let mountingProps: ViewMoutingProps = GetLinkProperty(agentLink, LinkPropertyKeys.MountingProps);
					let viewMounting: ViewMounting | null = GetViewMounting(mountingProps, viewType);
					if (viewMounting) {
						SetupViewMouting(screen, viewMounting, { agent, model, viewType });
					}
				} else {
					console.log('Agent link missing, this should never happen');
					throw new Error('agent link missing');
				}
			} else {
				console.log(
					`No agent access description for agent: ${GetNodeTitle(agent)} model: ${GetNodeTitle(
						agent
					)} viewType: ${viewType}`
				);
			}
			// Setup mounting functions
		});
}
function SetupViewMouting(
	screen: Node,
	viewMounting: ViewMounting,
	information: { agent: string; model: string; viewType: string }
) {
	viewMounting.mountings.forEach((mounting: MountingDescription) => {
		SetupMountDescription(mounting, screen);
	});
}
function SetupMountDescription(mounting: MountingDescription, screen: Node) {
	let graph = GetCurrentGraph();
	let screenOptions: Node[] = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	let { methodDescription } = mounting;
	if (methodDescription) {
		let methodFunctionProperties = MethodFunctions[methodDescription.functionType];
		if (methodFunctionProperties && methodFunctionProperties.parameters) {
			let { parameters } = methodFunctionProperties.parameters;
			if (parameters) {
				let { template } = parameters;
				Object.keys(template).map((paramName: string) => {
					let changeParam = false;
					if (template[paramName].defaultValue) {
						//change the value, to the name of the parameters
						console.log('change the value, to the name of the parameters');
						changeParam = true;
					}
					if (!changeParam) {
						screenOptions.forEach((screenOption: Node) => {
							if (!changeParam) {
								graphOperation(
									SetupApiBetweenComponent({
										component_a: {
											id: screen.id,
											external: paramName,
											internal: paramName
										},
										component_b: {
											id: screenOption.id,
											external: paramName,
											internal: paramName
										}
									})
								)(GetDispatchFunc(), GetStateFunc());
							}
						});
					} else {
						UpdateValueApiToDifferentName(screen, paramName);
					}
				});
			}
		}
	}
}

function UpdateValueApiToDifferentName(screen: Node, paramName: string) {
	let graph = GetCurrentGraph();
	let externalApi = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ComponentExternalApi
	}).find((v: string) => GetNodeTitle(v) === ComponentApiKeys.Value);
	let internalApi = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ComponentApi
	}).find((v: string) => GetNodeTitle(v) === ComponentApiKeys.Value);

	updateComponentProperty(externalApi.id, NodeProperties.UIText, paramName);
	updateComponentProperty(internalApi.id, NodeProperties.UIText, paramName);
}

function GetViewMounting(mountingProps: ViewMoutingProps, viewType: string): ViewMounting | null {
	let temp: any = mountingProps;
	if (temp && temp[viewType]) {
		return temp[viewType];
	}
	return null;
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
						let methodProps: any = GetLinkProperty(agentLink, LinkPropertyKeys.MethodProps);
						if (methodProps) {
							if (methodProps[viewType]) {
								return true;
							}
						}
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
					let methodProps: any = GetLinkProperty(agentLink, LinkPropertyKeys.MethodProps);
					if (methodProps) {
						if (methodProps[viewType]) {
							result = agentLink;
							return true;
						}
					}
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

				graphOperation([ ...commands ])(GetDispatchFunc(), GetStateFunc());
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
