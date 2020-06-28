import { GetNodesLinkedTo, getLinkInstance, GetNodeLinkedTo } from '../../methods/graph_methods';
import {
	GetCurrentGraph,
	GetNodeProp,
	GetNodesByProperties,
	REMOVE_NODE,
	ADD_NEW_NODE,
	addInstanceFunc,
	GetNodeTitle,
	ComponentApiKeys,
	UPDATE_NODE_PROPERTY,
	GetNodeByProperties,
	UPDATE_LINK_PROPERTY,
	GetNodeById,
	GetCodeName,
	ADD_LINK_BETWEEN_NODES,
	ComponentEventTo,
	GetComponentExternalApiNode,
	ScreenOptionFilter
} from '../../actions/uiactions';
import {
	LinkType,
	NodeProperties,
	LinkPropertyKeys,
	LinkProperties,
	UITypes,
	NodeTypes,
	Methods
} from '../../constants/nodetypes';
import { ComponentLifeCycleEvents, ComponentEvents } from '../../constants/componenttypes';
import AddLifeCylcleMethodInstance from '../AddLifeCylcleMethodInstance';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';
import { uuidv4 } from '../../utils/array';
import ModifyUpdateLinks from '../ModifyUpdateLinks';
import AppendValidations from './AppendValidations';
import AppendPostMethod from './AppendPostMethod';
import GetModelObjectFromSelector from '../GetModelObjectFromSelector';
import LoadModel from '../LoadModel';
import ClearScreenInstance from '../datachain/ClearScreenInstance';
import { Graph } from '../../methods/graph_types';

export default function ScreenConnectUpdate(args: any = {}) {
	let { node, method } = args;
	let { componentDidMountMethods } = args;
	if (!node) {
		throw new Error('no node');
	}
	if (!method) {
		throw new Error('no method');
	}
	if (!componentDidMountMethods) {
		throw new Error('no componentDidMountMethods');
	}
	if (!Array.isArray(componentDidMountMethods)) {
		componentDidMountMethods = [ componentDidMountMethods ];
	}
	const graph = GetCurrentGraph();
	const screenOptions = GetNodesLinkedTo(graph, {
		id: node,
		link: LinkType.ScreenOptions
	}).filter(ScreenOptionFilter);
	let result = [];
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const valueNavigateTargetApi = GetNodesLinkedTo(graph, {
		id: node,
		link: LinkType.ComponentExternalApi
	}).find((x: any) => GetNodeTitle(x) === ComponentApiKeys.Value);

	result.push(
		valueNavigateTargetApi
			? {
					operation: UPDATE_NODE_PROPERTY,
					options() {
						return {
							id: valueNavigateTargetApi.id,
							properties: {
								[NodeProperties.IsUrlParameter]: true
							}
						};
					}
				}
			: null
	);
	screenOptions.forEach((screenOptionInstance: { id: any }) => {
		const lifeCylcleMethods = GetNodesLinkedTo(graph, {
			id: screenOptionInstance.id,
			link: LinkType.LifeCylceMethod
		});

		// With a variety of parameters, this will need to be generalized to handle
		// all the possible parameters.
		const valueScreenOptionNavigateTargetApi = GetNodesLinkedTo(graph, {
			id: screenOptionInstance.id,
			link: LinkType.ComponentInternalApi
		}).find((x: any) => GetNodeTitle(x) === ComponentApiKeys.Value);

		lifeCylcleMethods
			.filter((x: any) => GetNodeProp(x, NodeProperties.UIText) === ComponentLifeCycleEvents.ComponentDidMount)
			.forEach((lifeCylcleMethod: { id: any }) => {
				const lifeCylcleMethodInstances = GetNodesLinkedTo(graph, {
					id: lifeCylcleMethod.id,
					link: LinkType.LifeCylceMethodInstance
				});
				lifeCylcleMethodInstances.forEach((lifeCylcleMethodInstance: any) => {
					const vp = GetNodeProp(lifeCylcleMethodInstance, NodeProperties.ViewPackage);
					if (vp) {
						const inPackageNodes = GetNodesByProperties({
							[NodeProperties.ViewPackage]: vp
						});

						inPackageNodes.forEach((inPackageNode) => {
							result.push({
								operation: REMOVE_NODE,
								options() {
									return {
										id: inPackageNode.id
									};
								}
							});
						});
					}
				});
				componentDidMountMethods.forEach((componentDidMountMethod: any) => {
					let dataChainForLoading: null = null;
					let cycleInstance: any = null;
					result.push(
						...AddLifeCylcleMethodInstance({
							node: lifeCylcleMethod.id,
							viewPackages,
							callback: (_cycleInstance: any) => {
								cycleInstance = _cycleInstance;
							}
						}),
						(currentGraph: any) => {
							if (cycleInstance) {
								return ConnectLifecycleMethod({
									connectToParameter: !valueScreenOptionNavigateTargetApi
										? null
										: (ae: any) => {
												switch (GetNodeProp(ae, NodeProperties.UIText)) {
													case 'modelId':
														return {
															target: valueScreenOptionNavigateTargetApi.id,
															linkProperties: {
																properties: {
																	...LinkProperties.ComponentApi
																}
															}
														};
													default:
														return false;
												}
											},
									target: componentDidMountMethod,
									source: cycleInstance.id,
									graph: currentGraph,
									viewPackages
								});
							}
							return [];
						},
						...LoadModel({
							screen: node,
							viewPackages,
							model_view_name: `Load ${GetCodeName(GetNodeProp(node, NodeProperties.Model))} into state`,
							model_item: `Models.${GetCodeName(GetNodeProp(node, NodeProperties.Model))}`,
							callback: (context: { entry: any }) => {
								dataChainForLoading = context.entry;
							}
						}),
						{
							operation: ADD_LINK_BETWEEN_NODES,
							options() {
								return {
									target: dataChainForLoading,
									source: cycleInstance.id,
									properties: {
										...LinkProperties.DataChainLink
									}
								};
							}
						}
					);
				});
			});

		const components = GetNodesLinkedTo(graph, {
			id: screenOptionInstance.id,
			link: LinkType.Component
		});
		components.forEach((component: { id: any }) => {
			const subcomponents = GetNodesLinkedTo(graph, {
				id: component.id,
				link: LinkType.Component
			});

			const executiveButtons = subcomponents.filter((x: any) => GetNodeProp(x, NodeProperties.ExecuteButton));
			if (executiveButtons.length === 1) {
				// There should be only 1 execute button
				const executeButton = executiveButtons[0];

				const onEvents = GetNodesLinkedTo(graph, {
					id: executeButton.id,
					link: LinkType.EventMethod
				}).filter((x: any) =>
					[ ComponentEvents.onClick, ComponentEvents.onPress ].some(
						(v) => v === GetNodeProp(x, NodeProperties.EventType)
					)
				);
				const uiType = GetNodeProp(screenOptionInstance, NodeProperties.UIType);
				let eventType: string | null = null;
				switch (uiType) {
					case UITypes.ReactNative:
						eventType = 'onPress';
						break;
					default:
						eventType = 'onClick';
						break;
				}
				let newEventNode: null = null;
				if (onEvents.length === 0) {
					result.push(() =>
						ComponentEventTo(executeButton.id, eventType, (eventNode: any) => {
							newEventNode = eventNode;
						})
					);
					onEvents.push({ newEventNode: () => newEventNode });
				}
				onEvents.forEach((onEventHandler: { newEventNode: any; id: any }) => {
					if (!onEventHandler.newEventNode) {
						const t = GetNodesLinkedTo(graph, {
							id: onEventHandler.id,
							link: LinkType.EventMethodInstance
						});
						if (t && t.length) {
							t.forEach((instance: { id: any }) => {
								const vp = GetNodeProp(instance, NodeProperties.ViewPackage);
								const parentViewPackage = GetNodeProp(onEventHandler, NodeProperties.ViewPackage);
								if (vp && vp !== parentViewPackage) {
									const inPackageNodes = GetNodesByProperties({
										[NodeProperties.ViewPackage]: GetNodeProp(instance, NodeProperties.ViewPackage)
									});

									inPackageNodes.forEach((inPackageNode) => {
										result.push({
											operation: REMOVE_NODE,
											options() {
												return {
													id: inPackageNode.id
												};
											}
										});
									});
								} else {
									result.push({
										operation: REMOVE_NODE,
										options() {
											return {
												id: instance.id
											};
										}
									});
								}
							});
						}
					}
					let instanceNodeItem: any = null;
					let modelDataChain: any = null;
					const modelSelectorNode = GetNodeByProperties({
						[NodeProperties.NODEType]: NodeTypes.Selector,
						[NodeProperties.Model]: GetNodeProp(node, NodeProperties.Model)
					});
					result.push(
						...[
							{
								operation: ADD_NEW_NODE,
								options: addInstanceFunc(
									onEventHandler.newEventNode ? onEventHandler.newEventNode : onEventHandler,
									(instanceNode: any) => {
										instanceNodeItem = instanceNode;
									},
									viewPackages
								)
							}
						],
						...GetModelObjectFromSelector({
							model: GetNodeTitle(node),
							viewPackages,
							callback: (newContext: { entry: string }, tempGraph: Graph) => {
								modelDataChain = GetNodeById(newContext.entry, tempGraph);
							}
						}),
						(currentGraph: any) => {
							if (instanceNodeItem) {
								return ConnectLifecycleMethod({
									target: method,
									selectorNode: () => modelSelectorNode.id,
									dataChain: () => modelDataChain.id,
									source: instanceNodeItem.id,
									graph: currentGraph,
									viewPackages
								});
							}
							return [];
						}
					);

					result.push(
						{
							operation: UPDATE_LINK_PROPERTY,
							options(currentGraph: any) {
								const link = getLinkInstance(currentGraph, {
									target: instanceNodeItem.id,
									source: onEventHandler.id
								});
								if (link)
									return {
										id: link.id,
										prop: LinkPropertyKeys.InstanceUpdate,
										value: true
									};
							}
						},
						...AppendPostMethod({
							method,
							viewPackages,
							handler: () => instanceNodeItem.id
						})
					);
				});
			}

			result.push(
				...AppendValidations({
					subcomponents,
					component,
					InstanceUpdate: true,
					methodType: Methods.Update,
					screen_option: screenOptionInstance,
					method,
					viewPackages
				})
			);

			const screenOption = screenOptionInstance;
			let clearScreenContext: any = null;
			let componentDidMountInstance: any = null;
			let componentDidMount: any = null;
			result.push(
				...ClearScreenInstance({
					viewPackages,
					update: true,
					screen: node,
					title: `Clear ${GetNodeTitle(node)} State`,
					model: GetNodeProp(node, NodeProperties.Model),
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
						(v: any) =>
							GetNodeProp(v, NodeProperties.EventType) === ComponentLifeCycleEvents.ComponentDidMount
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
				},
				() => ({
					operation: ADD_LINK_BETWEEN_NODES,
					options() {
						if (!componentDidMountInstance) {
							console.log(`screen : ${GetNodeTitle(node)}`);
							console.log(node);
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
				() => ({
					operation: ADD_LINK_BETWEEN_NODES,
					options(gg: any) {
						const valueExternalApiNode = GetComponentExternalApiNode(
							ComponentApiKeys.Value,
							screenOption.id,
							gg
						);
						return {
							source: clearScreenContext.entry,
							target: valueExternalApiNode.id,
							properties: { ...LinkProperties.DataChainInputLink }
						};
					}
				})
			);
		});
	});
	result = [ ...result ].filter((x) => x);
	return result;
}
