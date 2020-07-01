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
	ComponentApiKeys,
	ADD_NEW_NODE,
	addInstanceFunc,
	ADD_LINK_BETWEEN_NODES
} from '../../actions/uiactions';
import { NodeTypes, NodeProperties, LinkType, LinkPropertyKeys, LinkProperties } from '../../constants/nodetypes';
import { MethodFunctions, FunctionTemplateKeys, FunctionTypes } from '../../constants/functiontypes';
import { ViewTypes } from '../../constants/viewtypes';
import ScreenConnectGet from '../screens/ScreenConnectGet';
import ScreenConnectGetAll from '../screens/ScreenConnectGetAll';
import ScreenConnectCreate from '../screens/ScreenConnectCreate';
import ScreenConnectUpdate from '../screens/ScreenConnectUpdate';
import SetupApiBetweenComponent from '../../nodepacks/SetupApiBetweenComponents';

import { Node, GraphLink } from '../../methods/graph_types';
import {
	GetNodeLinkedTo,
	findLink,
	GetNodesLinkedTo,
	TARGET,
	SOURCE,
	SetPause,
	Paused
} from '../../methods/graph_methods';
import MethodProps, {
	MethodDescription,
	ViewMoutingProps,
	ViewMounting,
	MountingDescription
} from '../../interface/methodprops';
import ConnectComponentDidMount from './ConnectComponentDidMount';
import { GetDispatch } from '../../templates/electronio/v1/app/actions/uiactions';
import ClearScreenInstance from '../datachain/ClearScreenInstance';
import { uuidv4 } from '../../utils/array';
import { ComponentLifeCycleEvents } from '../../constants/componenttypes';

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
						SetupViewMouting(screen, viewMounting, { agent, model, viewType, agentAccessDescription });
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
interface SetupInformation {
	agent: string;
	model: string;
	viewType: string;
	agentAccessDescription: Node;
}
function SetupViewMouting(screen: Node, viewMounting: ViewMounting, information: SetupInformation) {
	viewMounting.mountings.forEach((mounting: MountingDescription) => {
		SetupMountDescription(mounting, screen);
		SetupMountingMethod(mounting, screen, information);
	});
	if (viewMounting.clearScreen) {
		addClearScreen(screen);
	}
}

function SetupMountingMethod(mouting: MountingDescription, screen: Node, information: SetupInformation) {
	let graph = GetCurrentGraph();
	let setup_options = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	let methodId = GetNodeProp(information.agentAccessDescription, NodeProperties.Method);
	setup_options.forEach((screenOption: Node) => {
		ConnectComponentDidMount({
			screen: screen.id,
			screenOption: screenOption.id,
			methods: [ methodId ]
		});
	});
}

function addClearScreen(screen: Node) {
	let graph = GetCurrentGraph();
	let setup_options = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	setup_options.forEach((screenOption: Node) => {
		let viewPackages = {
			[NodeProperties.ViewPackage]: uuidv4()
		};

		let clearScreenContext: any = null;
		let componentDidMountInstance: any = null;
		let componentDidMount: any = null;
		let result: any[] = [];
		result.push(
			...ClearScreenInstance({
				viewPackages,
				update: true,
				screen: screen.id,
				title: `Clear ${GetNodeTitle(screen)} State`,
				model: GetNodeProp(screen, NodeProperties.Model),
				callback: (temp: any) => {
					clearScreenContext = temp;
				}
			}),
			(gg: any) => {
				componentDidMount = GetNodesLinkedTo(gg, {
					id: screenOption.id,
					link: LinkType.LifeCylceMethod,
					componentType: NodeTypes.LifeCylceMethod
				}).find(
					(v: any) => GetNodeProp(v, NodeProperties.EventType) === ComponentLifeCycleEvents.ComponentDidMount
				);

				if (componentDidMount) {
					componentDidMountInstance = GetNodeLinkedTo(gg, {
						id: componentDidMount.id,
						link: LinkType.LifeCylceMethodInstance,
						componentType: NodeTypes.LifeCylceMethodInstance
					});
					if (!componentDidMountInstance) {
						console.log('create a component did mount instance');
						return {
							operation: ADD_NEW_NODE,
							options: addInstanceFunc(
								componentDidMount,
								(instanceNode: any) => {
									componentDidMountInstance = instanceNode;
								},
								viewPackages,
								{ lifecycle: true }
							)
						};
					}
				}
				return null;
			},
			// - clear screen -
			() => ({
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					if (!componentDidMountInstance) {
						console.log(`screen : ${GetNodeTitle(screen)}`);
						console.log(screen);
						console.log('componentDidMount');
						console.log(componentDidMount);
					}
					return {
						target: clearScreenContext.entry,
						source: componentDidMountInstance.id,
						properties: { ...LinkProperties.CallDataChainLink }
					};
				}
			})
		);
		graphOperation(result)(GetDispatchFunc(), GetStateFunc());
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
				if (template) {
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
									SetupApi(screen, paramName, screenOption);
								}
							});
						} else {
							UpdateValueApiToDifferentName(screen, paramName);
						}

						SetScreenParamToUrl(screen, paramName);
						SetInternalScreenOptionsParamToUrlParameter(screen, paramName);
						updateComponentProperty(
							screen.id,
							NodeProperties.UIText,
							GetNodeProp(screen, NodeProperties.UIText)
						);
						// Setup the api values all the way down to the bottom components
						SetupApiValueDownToTheBottomComponent(screen, paramName);
					});
				}
			}
		}
	}
}

function SetupApi(parent: Node, paramName: string, child: Node) {
	graphOperation(
		SetupApiBetweenComponent({
			component_a: {
				id: parent.id,
				external: paramName,
				internal: paramName
			},
			component_b: {
				id: child.id,
				external: paramName,
				internal: paramName
			}
		})
	)(GetDispatchFunc(), GetStateFunc());
}
function SetInternalScreenOptionsParamToUrlParameter(screen: Node, paramName: string) {
	let graph = GetCurrentGraph();
	let screenOptions = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});

	screenOptions.forEach((screenOption: Node) => {
		let internalApi = GetNodesLinkedTo(graph, {
			id: screenOption.id,
			link: LinkType.ComponentInternalApi
		}).find((v: Node) => GetNodeTitle(v) === paramName);
		if (internalApi) {
			updateComponentProperty(internalApi.id, NodeProperties.IsUrlParameter, true);
		}
	});
}
function SetupApiValueDownToTheBottomComponent(screen: Node, paramName: string) {
	let graph = GetCurrentGraph();
	let screenOptions = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	let seen: string[] = [];
	let paused = Paused();
	SetPause(true);
	screenOptions.forEach((screenOption: Node) => {
		SetupApiToBottom(screenOption, paramName, seen);
	});
	SetPause(paused);
}

function SetupApiToBottom(parent: Node, paramName: string, seen: string[]) {
	let graph = GetCurrentGraph();
	seen.push(parent.id);
	let components: Node[] = GetNodesLinkedTo(graph, {
		id: parent.id,
		componentType: NodeTypes.ComponentNode,
		direction: SOURCE
	});
	debugger;
	components
		.filter((component: Node) => {
			return seen.indexOf(component.id) === -1;
		})
		.forEach((component: Node) => {
			SetupApi(parent, paramName, component);
			SetupApiToBottom(component, paramName, seen);
		});
}

function ChangeValueApiToDifferentName(screeOrOption: Node, paramName: string) {
	let graph = GetCurrentGraph();
	let externalApi = GetNodesLinkedTo(graph, {
		id: screeOrOption.id,
		link: LinkType.ComponentExternalApi
	}).find((v: Node) => GetNodeTitle(v) === ComponentApiKeys.Value);
	let internalApi = GetNodesLinkedTo(graph, {
		id: screeOrOption.id,
		link: LinkType.ComponentInternalApi
	}).find((v: Node) => GetNodeTitle(v) === ComponentApiKeys.Value);

	if (externalApi) {
		updateComponentProperty(externalApi.id, NodeProperties.UIText, paramName);
	}

	if (internalApi) {
		updateComponentProperty(internalApi.id, NodeProperties.UIText, paramName);
	}
}
function SetScreenParamToUrl(screen: Node, paramName: string) {
	let graph = GetCurrentGraph();
	let externalApi = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ComponentExternalApi
	}).find((v: Node) => GetNodeTitle(v) === paramName);

	if (externalApi) {
		updateComponentProperty(externalApi.id, NodeProperties.IsUrlParameter, paramName);
		updateComponentProperty(externalApi.id, NodeProperties.UIText, paramName);
	}
}
function UpdateValueApiToDifferentName(screen: Node, paramName: string) {
	let graph = GetCurrentGraph();
	let screenOptions = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	ChangeValueApiToDifferentName(screen, paramName);
	screenOptions.forEach((screenOption: Node) => {
		ChangeValueApiToDifferentName(screenOption, paramName);
	});
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
