import { GetNodesLinkedTo } from '../../methods/graph_methods';
import {
	GetCurrentGraph,
	GetNodeProp,
	GetNodesByProperties,
	REMOVE_NODE,
	addInstanceFunc,
	ADD_NEW_NODE,
	ADD_LINK_BETWEEN_NODES,
	GetNodeTitle,
	UPDATE_NODE_PROPERTY,
	ComponentApiKeys,
	ScreenOptionFilter,
	GetNodeByProperties,
	AddLinkBetweenNodes,
	CreateNewNode
} from '../../actions/uiactions';
import {
	LinkType,
	NodeProperties,
	LinkProperties,
	NodeTypes,
	Methods,
	UIActionMethods,
	UIActionMethodParameterTypes,
	LinkPropertyKeys
} from '../../constants/nodetypes';
import { ComponentLifeCycleEvents, ComponentEvents, ComponentTypeKeys } from '../../constants/componenttypes';
import AddLifeCylcleMethodInstance from '../AddLifeCylcleMethodInstance';
import CreateNavigateToScreenDC from '../CreateNavigateToScreenDC';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';
import { uuidv4 } from '../../utils/array';
import StoreModelArrayStandard from '../StoreModelArrayStandard';
import AppendValidations from './AppendValidations';
import { Node } from '../../methods/graph_types';
export default function ScreenConnectGetAll(args: any = {}) {
	let { node, method } = args;
	const { navigateTo } = args;
	if (!node) {
		throw 'no node';
	}
	if (!method) {
		throw 'no method';
	}

	const graph = GetCurrentGraph();
	const screenOptions = GetNodesLinkedTo(graph, {
		id: node,
		link: LinkType.ScreenOptions
	}).filter(ScreenOptionFilter);
	const result: any = [];
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	screenOptions.forEach((screenOption: { id: any }) => {
		const components = GetNodesLinkedTo(graph, {
			id: screenOption.id,
			link: LinkType.Component
		});

		components.forEach((component: { id: any }) => {
			const internalComponentApi = GetNodesLinkedTo(graph, {
				id: component.id,
				link: LinkType.ComponentInternalApi
			});

			internalComponentApi
				.filter((x: any) => GetNodeProp(component, NodeProperties.ComponentType) === ComponentTypeKeys.List)
				.filter((x: any) =>
					[
						ComponentApiKeys.Value,
						ComponentApiKeys.Index,
						ComponentApiKeys.Item,
						ComponentApiKeys.Separators
					].some((v) => v === GetNodeTitle(x))
				)
				.forEach((internal: { id: any }) => {
					result.push(() => {
						return [
							{
								operation: UPDATE_NODE_PROPERTY,
								options: {
									id: internal.id,
									properties: {
										[NodeProperties.AsLocalContext]: true
									}
								}
							}
						];
					});
				});

			const listItems = GetNodesLinkedTo(graph, {
				id: component.id,
				link: LinkType.ListItem
			});

			listItems.map((listItem: { id: any }) => {
				const subcomponents = GetNodesLinkedTo(graph, {
					id: listItem.id,
					link: LinkType.Component
				});
				const executeButtons = subcomponents.filter((x: any) => GetNodeProp(x, NodeProperties.ExecuteButton));
				if (executeButtons && executeButtons.length === 1) {
					const subcomponent = executeButtons[0];
					const valueComponentApiNodeItems = GetNodesLinkedTo(graph, {
						id: subcomponent.id,
						link: LinkType.ComponentInternalApi
					}).find((x: any) => GetNodeTitle(x) === ComponentApiKeys.Value);
					let valueNavigateTargetApiItems: { id: any };
					if (navigateTo) {
						valueNavigateTargetApiItems = GetNodesLinkedTo(graph, {
							id: navigateTo,
							link: LinkType.ComponentExternalApi
						}).find((x: any) => GetNodeTitle(x) === ComponentApiKeys.Value);
					}
					const events = GetNodesLinkedTo(graph, {
						id: subcomponent.id,
						link: LinkType.EventMethod
					}).filter((x: any) =>
						[ ComponentEvents.onClick, ComponentEvents.onPress ].some(
							(v) => v === GetNodeProp(x, NodeProperties.EventType)
						)
					);
					events.map((evnt: { id: any }) => {
						const eventMethodInstances = GetNodesLinkedTo(graph, {
							id: evnt.id,
							link: LinkType.EventMethodInstance
						});
						eventMethodInstances.map((eventMethodInstance: any) => {
							const vp = GetNodeProp(eventMethodInstance, NodeProperties.ViewPackage);
							if (vp) {
								const inPackageNodes = GetNodesByProperties({
									[NodeProperties.ViewPackage]: vp
								});

								inPackageNodes.forEach((inPackageNode) => {
									result.push({
										operation: REMOVE_NODE,
										options(graph: any) {
											return {
												id: inPackageNode.id
											};
										}
									});
								});
							}
						});

						let _instanceNode: any = null;
						let _navigateContext = null;
						const lambdaFunc = '(v: any) => ({ value: v })';

						result.push(
							...[
								{
									operation: ADD_NEW_NODE,
									options: addInstanceFunc(
										evnt,
										(instanceNode: any) => {
											_instanceNode = instanceNode;
										},
										viewPackages
									)
								}
							],
							...(navigateTo
								? // See nots in the ScreenConnectGet
									CreateNavigateToScreenDC({
										screen: navigateTo,
										node: () => _instanceNode.id,
										lambda: lambdaFunc,
										viewPackages,
										callback: (navigateContext: any) => {
											_navigateContext = navigateContext;
										}
									})
								: []),
							{
								operation: ADD_LINK_BETWEEN_NODES,
								options() {
									return {
										source: _instanceNode.id,
										target: valueComponentApiNodeItems.id,
										properties: {
											...LinkProperties.ComponentApi
										}
									};
								}
							},
							valueNavigateTargetApiItems
								? {
										operation: UPDATE_NODE_PROPERTY,
										options() {
											return {
												id: valueNavigateTargetApiItems.id,
												properties: {
													[NodeProperties.IsUrlParameter]: true
												}
											};
										}
									}
								: null
						);
					});
				}

				result.push(
					...AppendValidations({
						subcomponents,
						component,
						methodType: Methods.Update,
						screen_option: screenOption,
						method,
						viewPackages
					})
				);
			});
		});

		const lifeCylcleMethods = GetNodesLinkedTo(graph, {
			id: screenOption.id,
			link: LinkType.LifeCylceMethod
		});

		lifeCylcleMethods
			.filter((x: any) => GetNodeProp(x, NodeProperties.UIText) === ComponentLifeCycleEvents.ComponentDidMount)
			.map((lifeCylcleMethod: { id: any }) => {
				const lifeCylcleMethodInstances = GetNodesLinkedTo(graph, {
					id: lifeCylcleMethod.id,
					link: LinkType.LifeCylceMethodInstance
				});
				lifeCylcleMethodInstances.map((lifeCylcleMethodInstance: any) => {
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
				let cycleInstance: any = null;
				let storeModelDataChain: null = null;
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
								target: method,
								source: cycleInstance.id,
								graph: currentGraph,
								viewPackages
							});
						}
						return [];
					},
					// ...StoreModelArrayStandard({
					// 	viewPackages,
					// 	model: GetNodeProp(node, NodeProperties.Model),
					// 	modelText: GetNodeTitle(node),
					// 	state_key: `${GetNodeTitle(GetNodeProp(node, NodeProperties.Model))} State`,
					// 	callback: (context: { entry: any }) => {
					// 		storeModelDataChain = context.entry;
					// 	}
					// }),
					() => {
						return [
							() => {
								let uiMethodNode: Node = GetNodeByProperties({
									[NodeProperties.UIActionMethod]: UIActionMethods.StoreModelArray,
									[NodeProperties.NODEType]: NodeTypes.UIMethod
								});
								let stateKey: Node = GetNodeByProperties({
									[NodeProperties.NODEType]: NodeTypes.StateKey,
									[NodeProperties.StateKey]: GetNodeProp(node, NodeProperties.Model)
								});
								let res: any[] = [];
								if (!stateKey) {
									res.push(() => {
										return CreateNewNode(
											{
												[NodeProperties.StateKey]: GetNodeProp(node, NodeProperties.Model),
												[NodeProperties.UIText]: `${GetNodeTitle(
													GetNodeProp(node, NodeProperties.Model)
												)} State`,
												[NodeProperties.NODEType]: NodeTypes.StateKey
											},
											(node: Node) => {
												stateKey = node;
											}
										);
									});
								}
								if (!uiMethodNode) {
									res.push(() => {
										return CreateNewNode(
											{
												[NodeProperties.UIActionMethod]: UIActionMethods.StoreModelArray,
												[NodeProperties.UIText]: UIActionMethods.StoreModelArray,
												[NodeProperties.NODEType]: NodeTypes.UIMethod
											},
											(node: Node) => {
												uiMethodNode = node;
											}
										);
									});
								}
								res.push(() => {
									return AddLinkBetweenNodes(cycleInstance.id, uiMethodNode.id, {
										...LinkProperties.UIMethod,
										parameters: [
											{
												type: UIActionMethodParameterTypes.FunctionParameter,
												value: 'a'
											},
											{
												type: UIActionMethodParameterTypes.ModelKey,
												value: GetNodeProp(node, NodeProperties.Model)
											},
											{
												type: UIActionMethodParameterTypes.StateKey,
												value: stateKey.id
											}
										]
									});
								});
								res.push(() => {
									return AddLinkBetweenNodes(cycleInstance.id, uiMethodNode.id, {
										...LinkProperties.StateKey,
										stateKey: stateKey.id
									});
								});
								return res;
							}
						];
					},
					(graph: any) => {
						return [
							{
								operation: ADD_LINK_BETWEEN_NODES,
								options() {
									return {
										target: storeModelDataChain,
										source: cycleInstance.id,
										properties: {
											...LinkProperties.DataChainLink,
											singleLink: true,
											nodeTypes: [ NodeTypes.DataChain ]
										}
									};
								}
							}
						];
					}
				);
			});
	});

	return result.filter((x: any) => x);
}
