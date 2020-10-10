/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
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
	ComponentApiKeys,
	GetCodeName,
	GetComponentApiNode,
	Connect,
	UPDATE_NODE_PROPERTY,
	ScreenOptionFilter,
	GetLambdaVariableTitle,
	graphOperation,
	GetNodeByProperties,
	CreateNewNode,
	AddLinkBetweenNodes
} from '../../actions/uiactions';
import {
	LinkType,
	NodeProperties,
	LinkProperties,
	Methods,
	UIActionMethods,
	NodeTypes,
	LinkPropertyKeys,
	UIActionMethodParameterTypes
} from '../../constants/nodetypes';
import { ComponentLifeCycleEvents, ComponentEvents } from '../../constants/componenttypes';
import AddLifeCylcleMethodInstance from '../AddLifeCylcleMethodInstance';
import CreateNavigateToScreenDC from '../CreateNavigateToScreenDC';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';
import { uuidv4 } from '../../utils/array';
import AppendValidations from './AppendValidations';
import { TEMPLATE_PARAMETERS } from '../../constants/functiontypes';
import StoreModelInLake from '../datachain/StoreModelInLake';
import { Graph, Node } from '../../methods/graph_types';

export default function ScreenConnectGet(args: any = {}) {
	let { node: screen, method } = args;
	const { navigateTo } = args;
	if (!screen) {
		throw 'no screen';
	}
	if (!method) {
		throw 'no method';
	}

	const graph = GetCurrentGraph();
	const screen_options = GetNodesLinkedTo(graph, {
		id: screen,
		link: LinkType.ScreenOptions
	}).filter(ScreenOptionFilter);

	const result: any = [];
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	screen_options.map((screen_option: { id: any }) => {
		const components = GetNodesLinkedTo(graph, {
			id: screen_option.id,
			link: LinkType.Component
		});

		const internalComponentApis = GetNodesLinkedTo(graph, {
			id: screen_option.id,
			link: LinkType.ComponentInternalApi
		});

		components.map((component: { id: any }) => {
			const subcomponents = GetNodesLinkedTo(graph, {
				id: component.id,
				link: LinkType.Component
			});
			const buttonComponents = subcomponents.filter((x: any) => GetNodeProp(x, NodeProperties.ExecuteButton));
			if (buttonComponents && buttonComponents.length === 1) {
				const subcomponent = buttonComponents[0];
				const events = GetNodesLinkedTo(graph, {
					id: subcomponent.id,
					link: LinkType.EventMethod
				}).filter((x: any) =>
					[ ComponentEvents.onClick, ComponentEvents.onPress ].some(
						(v) => v === GetNodeProp(x, NodeProperties.EventType)
					)
				);
				if (navigateTo) {
					// const _valueNavigateTargetApi = GetNodesLinkedTo(graph, {
					// 	id: navigateTo,
					// 	link: LinkType.ComponentExternalApi
					// }).find((x: any) => GetNodeTitle(x) === ComponentApiKeys.Value);
					// HANDLED IN NEW Screen CONNECTION
					// result.push(
					// 	_valueNavigateTargetApi
					// 		? {
					// 				operation: UPDATE_NODE_PROPERTY,
					// 				options() {
					// 					return {
					// 						id: _valueNavigateTargetApi.id,
					// 						properties: {
					// 							[NodeProperties.IsUrlParameter]: true
					// 						}
					// 					};
					// 				}
					// 			}
					// 		: null
					// );
					// HANDLED IN NEW Screen CONNECTION
					// This will cause a chain update, so the url for the screen will get updated to include
					// the parameter, i think.
					// 	result.push(
					// 		_valueNavigateTargetApi
					// 			? {
					// 					operation: UPDATE_NODE_PROPERTY,
					// 					options() {
					// 						return {
					// 							id: navigateTo,
					// 							properties: {
					// 								[NodeProperties.UIText]: GetNodeProp(navigateTo, NodeProperties.UIText)
					// 							}
					// 						};
					// 					}
					// 				}
					// 			: null
					// 	);
					// }
					// HANDLED IN NEW Screen CONNECTION
					// const valueGetApi = GetNodesLinkedTo(graph, {
					// 	id: node,
					// 	link: LinkType.ComponentExternalApi
					// }).find((x: any) => GetNodeTitle(x) === ComponentApiKeys.Value);
					// result.push(
					// 	valueGetApi
					// 		? {
					// 				operation: UPDATE_NODE_PROPERTY,
					// 				options() {
					// 					return {
					// 						id: valueGetApi.id,
					// 						properties: {
					// 							[NodeProperties.IsUrlParameter]: true
					// 						}
					// 					};
					// 				}
					// 			}
					// 		: null
					// );
					// HANDLED IN NEW Screen CONNECTION
					// result.push(
					// 	valueGetApi
					// 		? {
					// 				operation: UPDATE_NODE_PROPERTY,
					// 				options() {
					// 					return {
					// 						id: node,
					// 						properties: {
					// 							[NodeProperties.UIText]: GetNodeProp(node, NodeProperties.UIText)
					// 						}
					// 					};
					// 				}
					// 			}
					// 		: null
					// );
					events.forEach((evnt: { id: any }) => {
						// const eventMethodInstances = GetNodesLinkedTo(graph, {
						// 	id: evnt.id,
						// 	link: LinkType.EventMethodInstance
						// });
						// eventMethodInstances.forEach((eventMethodInstance: any) => {
						// 	const vp = GetNodeProp(eventMethodInstance, NodeProperties.ViewPackage);
						// 	if (vp) {
						// 		const inPackageNodes = GetNodesByProperties({
						// 			[NodeProperties.ViewPackage]: vp
						// 		});

						// 		inPackageNodes.map((inPackageNode) => {
						// 			result.push({
						// 				operation: REMOVE_NODE,
						// 				options: function() {
						// 					return {
						// 						id: inPackageNode.id
						// 					};
						// 				}
						// 			});
						// 		});
						// 	}
						// });

						let _instanceNode: any = null;

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
								? // this can be updated to include different types of parameters,
									// checkout the lambda property for the arguments, setting it to the appropriate
									// lambda string will get use the parameters in the url that we desire.
									CreateNavigateToScreenDC({
										screen: navigateTo,
										node: () => _instanceNode.id,
										viewPackages
									})
								: []),
							(currentGraph: any) => {
								const valueComponentApiNode = GetComponentApiNode(
									ComponentApiKeys.Value,
									subcomponent.id,
									currentGraph
								);
								// if all the values can be calculated in the lambda,
								// this might not be necessary
								return {
									operation: ADD_LINK_BETWEEN_NODES,
									options: Connect(
										_instanceNode.id,
										valueComponentApiNode.id,
										LinkProperties.ComponentApi
									)
								};
							}
						);
					});
				}
			}
			result.push(
				...AppendValidations({
					subcomponents,
					component,
					screen_option,
					method,
					viewPackages
				})
			);
		});

		const lifeCylcleMethods = GetNodesLinkedTo(graph, {
			id: screen_option.id,
			link: LinkType.LifeCylceMethod
		});

		lifeCylcleMethods
			.filter((x: any) => GetNodeProp(x, NodeProperties.UIText) === ComponentLifeCycleEvents.ComponentDidMount)
			.map((lifeCylcleMethod: { id: any }) => {
				// const lifeCylcleMethodInstances = GetNodesLinkedTo(graph, {
				// 	id: lifeCylcleMethod.id,
				// 	link: LinkType.LifeCylceMethodInstance
				// });
				// lifeCylcleMethodInstances.map((lifeCylcleMethodInstance: any) => {
				// 	const vp = GetNodeProp(lifeCylcleMethodInstance, NodeProperties.ViewPackage);
				// 	if (vp) {
				// 		const inPackageNodes = GetNodesByProperties({
				// 			[NodeProperties.ViewPackage]: vp
				// 		});

				// 		inPackageNodes.map((inPackageNode) => {
				// 			result.push({
				// 				operation: REMOVE_NODE,
				// 				options: function() {
				// 					return {
				// 						id: inPackageNode.id
				// 					};
				// 				}
				// 			});
				// 		});
				// 	}
				// });
				const apiEndpoints: any = {};
				let cycleInstance: { id: any } | null = null;
				let datachain: string;
				result.push(
					...AddLifeCylcleMethodInstance({
						node: lifeCylcleMethod.id,
						viewPackages,
						callback: (_cycleInstance: any) => {
							cycleInstance = _cycleInstance;
						}
					}),
					(graph: any) => {
						if (cycleInstance) {
							return ConnectLifecycleMethod({
								target: method,
								source: cycleInstance.id,
								graph,
								viewPackages,
								callback: (context: { apiEndPoints: any[] }, graph: any) => {
									if (context.apiEndPoints) {
										context.apiEndPoints.filter((d: { id: any }) => {
											const temp = GetNodesLinkedTo(graph, {
												id: d.id,
												link: LinkType.ComponentApiConnection
											}).find((v: any) => TEMPLATE_PARAMETERS[GetCodeName(v)]);
											if (temp) {
												apiEndpoints[GetCodeName(temp)] = d;
											}
											return temp;
										});
									}
								}
							});
						}
						return [];
					},
					() => {
						return [
							() => {
								let uiMethodNode: Node = GetNodeByProperties({
									[NodeProperties.UIActionMethod]: UIActionMethods.StoreInLake,
									[NodeProperties.NODEType]: NodeTypes.UIMethod
								});
								let res: any[] = [];
								if (!uiMethodNode) {
									res.push(() => {
										return CreateNewNode(
											{
												[NodeProperties.UIActionMethod]: UIActionMethods.StoreInLake,
												[NodeProperties.UIText]: UIActionMethods.StoreInLake,
												[NodeProperties.NODEType]: NodeTypes.UIMethod
											},
											(node: Node) => {
												uiMethodNode = node;
											}
										);
									});
								}
								res.push(() => {
									return AddLinkBetweenNodes(cycleInstance ? cycleInstance.id : '', uiMethodNode.id, {
										...LinkProperties.UIMethod,
										[LinkPropertyKeys.ModelKey]: GetNodeProp(screen, NodeProperties.Model),
										parameters: [
											{
												type: UIActionMethodParameterTypes.FunctionParameter,
												value: 'a'
											},
											{
												type: UIActionMethodParameterTypes.ModelKey,
												value: GetNodeProp(screen, NodeProperties.Model)
											}
										]
									});
								});

								return res;
							}
						];
					},
					// (graph: Graph) => {
					// 	let model = GetNodeProp(screen, NodeProperties.Model, graph);
					// 	return StoreModelInLake({
					// 		modelId: model,
					// 		modelInsertName: GetLambdaVariableTitle(model, false, true),
					// 		model: GetNodeTitle(model),
					// 		viewPackages,
					// 		callback: (dcontext: { entry: string }) => {
					// 			datachain = dcontext.entry;
					// 		}
					// 	});
					// },
					// () => {
					// 	return [
					// 		{
					// 			operation: ADD_LINK_BETWEEN_NODES,
					// 			options() {
					// 				return {
					// 					properties: { ...LinkProperties.DataChainLink },
					// 					target: datachain,
					// 					source: cycleInstance ? cycleInstance.id : null
					// 				};
					// 			}
					// 		}
					// 	];
					// },
					() => {
						if (apiEndpoints) {
							return Object.keys(apiEndpoints).map((key) => {
								const apiEndpoint = apiEndpoints[key];
								let internalComponentApi = internalComponentApis.find(
									(v: any) => GetCodeName(v) === key
								);
								if (!internalComponentApi) {
									internalComponentApi = internalComponentApis.find(
										(v: any) => GetCodeName(v) === 'value'
									);
								}
								if (apiEndpoint && internalComponentApi) {
									return {
										operation: ADD_LINK_BETWEEN_NODES,
										options: {
											source: apiEndpoint.id,
											target: internalComponentApi.id,
											properties: { ...LinkProperties.ComponentApi }
										}
									};
								}
								return false;
							});
						}
					}
				);
			});
	});

	return result.filter((x: any) => x);
}
