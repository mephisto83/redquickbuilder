import { ViewMounting, MountingDescription, ViewMoutingProps } from "../../../interface/methodprops";
import { SetupInformation } from "./SetupInformation";
import { Node } from "../../../methods/graph_types";
import { GetCurrentGraph, GetNodeTitle, NodeTypes, addInstanceFunc, ADD_NEW_NODE, ADD_LINK_BETWEEN_NODES, graphOperation, GetDispatchFunc, GetStateFunc, updateComponentProperty, ComponentApiKeys } from "../../../actions/uiactions";
import { GetNodesLinkedTo, GetNodeProp, GetNodeLinkedTo, SetPause, Paused, SOURCE } from "../../../methods/graph_methods";
import { LinkType, NodeProperties, LinkProperties } from "../../../constants/nodetypes";
import { MethodFunctions } from "../../../constants/functiontypes";
import { uuidv4 } from "../../../utils/array";
import ClearScreenInstance from "../../datachain/ClearScreenInstance";
import { ComponentLifeCycleEvents } from "../../../constants/componenttypes";
import SetupApiBetweenComponent from '../../../nodepacks/SetupApiBetweenComponents';
import ConnectComponentDidMount from "../ConnectComponentDidMount";

export default function SetupViewMouting(screen: Node, viewMounting: ViewMounting, information: SetupInformation) {
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


export function GetViewMounting(mountingProps: ViewMoutingProps, viewType: string): ViewMounting | null {
	let temp: any = mountingProps;
	if (temp && temp[viewType]) {
		return temp[viewType];
	}
	return null;
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