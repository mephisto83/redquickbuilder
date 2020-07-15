import { ViewMounting, MountingDescription, ViewMoutingProps, MethodDescription } from '../../../interface/methodprops';
import { SetupInformation } from './SetupInformation';
import { Node } from '../../../methods/graph_types';
import {
	GetCurrentGraph,
	GetNodeTitle,
	NodeTypes,
	addInstanceFunc,
	ADD_NEW_NODE,
	ADD_LINK_BETWEEN_NODES,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty,
	ComponentApiKeys,
	GetComponentExternalApiNode,
	GetComponentExternalApiNodes
} from '../../../actions/uiactions';
import {
	GetNodesLinkedTo,
	GetNodeProp,
	GetNodeLinkedTo,
	SetPause,
	Paused,
	SOURCE
} from '../../../methods/graph_methods';
import { LinkType, NodeProperties, LinkProperties } from '../../../constants/nodetypes';
import { MethodFunctions } from '../../../constants/functiontypes';
import { uuidv4 } from '../../../utils/array';
import ClearScreenInstance from '../../datachain/ClearScreenInstance';
import { ComponentLifeCycleEvents } from '../../../constants/componenttypes';
import ConnectComponentDidMount from '../ConnectComponentDidMount';
import { SetupApi, SetupApiToBottom, SetupApiValueDownToTheBottomComponent } from './Shared';

export default function SetupViewMouting(screen: Node, viewMounting: ViewMounting, information: SetupInformation) {
	console.log('setup view mounting');
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
	let methodId = mouting.methodDescription ? mouting.methodDescription.methodId : null;
	if (methodId) {
		let cycleInstances: string[] = [];
		setup_options.forEach((screenOption: Node) => {
			ConnectComponentDidMount({
				screen: screen.id,
				screenOption: screenOption.id,
				methods: methodId ? [ methodId ] : [],
				callback: (_cycleInstances: string[]) => {
					cycleInstances = _cycleInstances;
				}
			});
    });
    // connect datachain to cycleInstances.
	} else {
		console.warn('missing reference to method: SetupViewMounting');
	}
}

function addClearScreen(screen: Node) {
	console.log('add clear screen');
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
			}),
			() => ({
				operation: ADD_LINK_BETWEEN_NODES,
				options(gg: any) {
					const viewModelExternalApiNode = GetComponentExternalApiNode(
						ComponentApiKeys.ViewModel,
						screenOption.id,
						gg
					);
					return {
						source: clearScreenContext.entry,
						target: viewModelExternalApiNode.id,
						properties: { ...LinkProperties.DataChainInputLink }
					};
				}
			}),
			(gg: any) => {
				const valueExternalApiNodes = GetComponentExternalApiNodes(screenOption.id, gg);
				return valueExternalApiNodes.map((valueExternalApiNode: Node) => {
					return {
						operation: ADD_LINK_BETWEEN_NODES,
						options() {
							return {
								source: clearScreenContext.entry,
								target: valueExternalApiNode.id,
								properties: { ...LinkProperties.DataChainInputLink }
							};
						}
					};
				});
			}
		);
		graphOperation(result)(GetDispatchFunc(), GetStateFunc());
	});
}

function SetupMountDescription(mounting: MountingDescription, screen: Node) {
	console.log('setup mount description');
	let graph = GetCurrentGraph();
	let screenOptions: Node[] = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	let { methodDescription } = mounting;
	if (methodDescription) {
		SetupMethodParametersForComponent(methodDescription, screenOptions, screen);
	}
}

function SetupMethodParametersForComponent(methodDescription: MethodDescription, screenOptions: Node[], screen: Node) {
	console.log('setup method description');
	console.log(methodDescription);
	let methodFunctionProperties = MethodFunctions[methodDescription.functionType];
	if (methodFunctionProperties && methodFunctionProperties.parameters) {
		let { parameters } = methodFunctionProperties.parameters;
		console.log('parameters');
		console.log(parameters);
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

					// Setup the api values all the way down to the bottom components
					SetupApiValueDownToTheBottomComponent(screen, paramName);
				});
				updateComponentProperty(screen.id, NodeProperties.UIText, GetNodeProp(screen, NodeProperties.UIText));
			}
		}
	}
}

function SetInternalScreenOptionsParamToUrlParameter(screen: Node, paramName: string) {
	console.log(`[${GetNodeTitle(screen)}] set interface screen options param to url parameter: ${paramName}`);

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
	console.log(`set screen param to url :${paramName}`);
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
	console.log(`get view mounting ${viewType}`);
	let temp: any = mountingProps;
	if (temp && temp[viewType]) {
		return temp[viewType];
	}
	return null;
}

function UpdateValueApiToDifferentName(screen: Node, paramName: string) {
	console.log('update value api to different name');
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
	console.log('change value api to different name');
	console.log(`paramName :${paramName}`);
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
