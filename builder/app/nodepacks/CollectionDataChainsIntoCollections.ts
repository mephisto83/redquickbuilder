import { uuidv4 } from '../utils/array';
import { NodeProperties, NodeTypes, LinkType, LinkProperties, UITypes } from '../constants/nodetypes';
import {
	NodesByType,
	GetNodeTitle,
	ADD_NEW_NODE,
	GetNodeProp,
	ADD_LINK_BETWEEN_NODES,
	GetCurrentGraph,
	GetNodeByProperties,
	executeGraphOperations,
	GetDispatchFunc,
	GetStateFunc,
	graphOperation
} from '../actions/uiactions';
import { GetNodesLinkedTo, GetNodeLinkedTo, TARGET, SOURCE } from '../methods/graph_methods';
import { NodeType } from '../components/titles';
import { Graph, Node } from '../methods/graph_types';

export default function(args: any = {}) {
	const result: any = [];
	const graph = GetCurrentGraph();
	const screens = NodesByType(null, NodeTypes.Screen);
	const screenWithoutDataChainCollection = screens;

	screenWithoutDataChainCollection.map((screen: any) => {
		const temp: any = {};
		const screenoptions: any = GetNodesLinkedTo(graph, {
			id: screen.id,
			link: LinkType.ScreenOptions
		});
		if (
			!GetNodesLinkedTo(graph, {
				id: screen.id,
				link: LinkType.DataChainCollectionReference
			}).length
		) {
			result.push({
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.DataChainCollection,
						linkProperties: {
							properties: {
								...LinkProperties.DataChainCollectionReference
							}
						},
						parent: screen.id,
						properties: {
							[NodeProperties.UIText]: `${GetNodeTitle(screen)}`,
							[NodeProperties.Pinned]: false
						},
						callback: (node: any) => {
							temp.screen = node;
						}
					};
				}
			});
		}

		screenoptions.map((screenoption: { id: any }) => {
			result.push((graph: any) => {
				const add_screenoption_reference = !GetNodesLinkedTo(graph, {
					id: screenoption.id,
					link: LinkType.DataChainCollectionReference
				}).length;

				const screen = GetNodeLinkedTo(graph, {
					id: screenoption.id,
					link: LinkType.ScreenOptions
				});

				let collectionReference: any;
				if (screen) {
					collectionReference = GetNodeLinkedTo(graph, {
						id: screen.id,
						link: LinkType.DataChainCollectionReference
					});
				}
				let temp: { id: any };
				return [
					add_screenoption_reference
						? {
								operation: ADD_NEW_NODE,
								options(graph: any) {
									return {
										nodeType: NodeTypes.DataChainCollection,
										linkProperties: {
											properties: {
												...LinkProperties.DataChainCollectionReference
											}
										},
										parent: screenoption.id,
										properties: {
											[NodeProperties.UIText]: `${GetNodeTitle(screenoption)}`,
											[NodeProperties.Pinned]: false
										},
										callback: (node: any) => {
											temp = node;
										}
									};
								}
							}
						: false,
					collectionReference && add_screenoption_reference
						? {
								operation: ADD_LINK_BETWEEN_NODES,
								options() {
									return {
										source: temp.id,
										target: collectionReference.id,
										properties: { ...LinkProperties.DataChainCollection }
									};
								}
							}
						: null
				];
			});

			const components = GetNodesLinkedTo(graph, {
				id: screenoption.id,
				link: LinkType.Component
			});

			components.map((component: { id: any }) => {
				const nodes_linked = GetNodesLinkedTo(graph, {
					id: component.id,
					link: LinkType.DataChainCollectionReference
				});
				if (nodes_linked.length) {
					return null;
				}

				result.push((graph: any) => {
					const screenoption = GetNodesLinkedTo(graph, {
						id: component.id,
						link: LinkType.Component
					}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption)[0];
					let collectionReference: any;
					if (screenoption) {
						collectionReference = GetNodeLinkedTo(graph, {
							id: screenoption.id,
							link: LinkType.DataChainCollectionReference
						});
					}
					let subtemp: { id: any };
					return [
						{
							operation: ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.DataChainCollection,
									linkProperties: {
										properties: {
											...LinkProperties.DataChainCollectionReference
										}
									},
									parent: component.id,
									properties: {
										[NodeProperties.UIText]: `${GetNodeTitle(component)}`,
										[NodeProperties.Pinned]: false
									},
									callback: (node: any) => {
										subtemp = node;
									}
								};
							}
						},
						collectionReference
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											source: subtemp.id,
											target: collectionReference.id,
											properties: { ...LinkProperties.DataChainCollection }
										};
									}
								}
							: null
					];
				});
			});

			GetNodesLinkedTo(graph, {
				id: screenoption.id,
				link: LinkType.LifeCylceMethod
			})
				.map((lifeCycleMethod: { id: any }) => {
					const res = GetNodesLinkedTo(graph, {
						id: lifeCycleMethod.id,
						link: LinkType.LifeCylceMethodInstance
					}).map((lifecylceInstanceMethod: { id: any }) => {
						const chains = [
							...GetNodesLinkedTo(graph, {
								id: lifecylceInstanceMethod.id,
								link: LinkType.DataChainLink
							}).filter((chain: { id: any }) => {
								return GetNodesLinkedTo(graph, {
									id: chain.id
								}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.DataChain)
									.length;
							}),
							...GetNodesLinkedTo(graph, {
								id: lifecylceInstanceMethod.id,
								link: LinkType.PreDataChainLink
							}).filter((chain: { id: any }) => {
								return GetNodesLinkedTo(graph, {
									id: chain.id
								}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.DataChain)
									.length;
							}),
							...GetNodesLinkedTo(graph, {
								id: lifecylceInstanceMethod.id,
								link: LinkType.CallDataChainLink
							}).filter((chain: { id: any }) => {
								return GetNodesLinkedTo(graph, {
									id: chain.id
								}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.DataChain)
									.length;
							})
						];
						return chains;
					});
					return res;
				})
				.flatten()
				.forEach((chain: { id: any }) => {
					result.push({
						operation: ADD_LINK_BETWEEN_NODES,
						options(ggraph: any) {
							let screenOptionCollectionReference;
							if (screenoption) {
								screenOptionCollectionReference = GetNodeLinkedTo(ggraph, {
									id: screenoption.id,
									link: LinkType.DataChainCollectionReference
								});
							}
							return {
								target: screenOptionCollectionReference.id,
								source: chain.id,
								properties: { ...LinkProperties.DataChainCollection }
							};
						}
					});
				});
		});
	});
	[ UITypes.ElectronIO, UITypes.ReactNative, UITypes.ReactWeb ].forEach((uiType) => {
		let sharedReferenceCollection = GetNodeByProperties(
			{
				[NodeProperties.SharedReferenceCollection]: true,
				[NodeProperties.UIType]: uiType
			},
			graph
		);
		if (!sharedReferenceCollection) {
			result.push({
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.DataChainCollection,
						properties: {
							[NodeProperties.UIText]: `Shared Components ${uiType}`,
							[NodeProperties.Pinned]: false,
							[NodeProperties.UIType]: uiType,
							[NodeProperties.SharedReferenceCollection]: true
						},
						callback: (node: any) => {
							sharedReferenceCollection = node;
						}
					};
				}
			});
		}
		const componentNodes = NodesByType(null, NodeTypes.ComponentNode).filter((x: any) => {
			return GetNodeProp(x, NodeProperties.UIType) === uiType;
		});
		// componentNodes
		// 	.map((d: any) => getTopComponent(graph, d))
		// 	.filter((x: any) => GetNodeProp(x, NodeProperties.SharedComponent))
		// 	.unique((x: any) => x.id);

		componentNodes
			.sort((a: any, b: any) => {
				const a_lineage = getComponentLineage(graph, a);
				const b_lineage = getComponentLineage(graph, b);
				const intersects = a_lineage.intersection(b_lineage);
				if (intersects.length === 0) {
					return 0;
				}
				if (a_lineage.length !== b_lineage.length) {
					return a_lineage.length - b_lineage.length;
				}
				return 0;
			})
			.forEach((component: { id: any }) => {
				result.push(function(graph: any) {
					const externalApiDataChains = getComponentExternalApiDataChains(graph, component);
					const internalApiDataChains = getComponentInternalApiDataChains(graph, component);
					const eventApiDataChains = getComponentEventDataChains(graph, component);
					let reference: any = null;
					const steps = [];
					reference = getCollectionReference(graph, component);
					if (!reference) {
						steps.push({
							operation: ADD_NEW_NODE,
							options(graph: any) {
								const parentReference = getParentCollectionReference(graph, component);
								if (true || parentReference) {
									return {
										nodeType: NodeTypes.DataChainCollection,
										properties: {
											[NodeProperties.UIText]: `${GetNodeTitle(component)}`,
											[NodeProperties.Pinned]: false
										},
										links: [
											{
												target: (parentReference || sharedReferenceCollection).id,
												linkProperties: {
													properties: {
														...LinkProperties.DataChainCollection
													}
												}
											},
											{
												linkProperties: {
													properties: {
														...LinkProperties.DataChainCollectionReference
													}
												},
												target: component.id
											}
										].filter((x) => x),
										callback: (node: any) => {
											reference = node;
										}
									};
								} else {
									console.log(component.id);
									//  throw "parent should have a reference before getting here";
								}
							}
						});
					}
					return [
						...steps,
						...[ ...externalApiDataChains, ...internalApiDataChains, ...eventApiDataChains ].map((dc) => {
							return {
								operation: ADD_LINK_BETWEEN_NODES,
								options(graph: any) {
									reference = reference || getCollectionReference(graph, component);
									return {
										target: reference.id,
										source: dc.id,
										properties: { ...LinkProperties.DataChainCollection }
									};
								}
							};
						})
					];
				});
			});
	});
	screens.forEach((screen: any) => {
		const screen_data_chains = [];
		const externalApiDataChains = getComponentExternalApiDataChains(graph, screen);
		const internalApiDataChains = getComponentInternalApiDataChains(graph, screen);
		const eventApiDataChains = getComponentEventDataChains(graph, screen);
		screen_data_chains.push(...externalApiDataChains, ...internalApiDataChains, ...eventApiDataChains);
		let reference: any = null;
		result.push(
			...[ ...screen_data_chains ].map((dc) => {
				return {
					operation: ADD_LINK_BETWEEN_NODES,
					options(graph: any) {
						reference = reference || getCollectionReference(graph, screen);
						return {
							target: reference.id,
							source: dc.id,
							properties: { ...LinkProperties.DataChainCollection }
						};
					}
				};
			})
		);
	});
	return result.filter((x: any) => x);
}

export function CollectionScreenWithoutDatachainDistributed(filter: any) {
	filter = filter || (() => true);
	const result: any = [];
	const graph = GetCurrentGraph();
	const screens = NodesByType(null, NodeTypes.Screen).filter((x: any) => filter(x));
	const screenWithoutDataChainCollection = screens;
	// .filter(screen => {
	//   return !GetNodesLinkedTo(graph, {
	//     id: screen.id,
	//     link: LinkType.DataChainCollectionReference
	//   }).length;
	// });
	screenWithoutDataChainCollection.map((screen: any) => {
		const temp: any = {};
		const screenoptions: any = GetNodesLinkedTo(graph, {
			id: screen.id,
			link: LinkType.ScreenOptions
		});
		if (
			!GetNodesLinkedTo(graph, {
				id: screen.id,
				link: LinkType.DataChainCollectionReference
			}).length
		) {
			result.push({
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.DataChainCollection,
						linkProperties: {
							properties: {
								...LinkProperties.DataChainCollectionReference
							}
						},
						parent: screen.id,
						properties: {
							[NodeProperties.UIText]: `${GetNodeTitle(screen)}`,
							[NodeProperties.Pinned]: false
						},
						callback: (node: any) => {
							temp.screen = node;
						}
					};
				}
			});
		}

		screenoptions.map((screenoption: { id: any }) => {
			result.push((graph: any) => {
				const add_screenoption_reference = !GetNodesLinkedTo(graph, {
					id: screenoption.id,
					link: LinkType.DataChainCollectionReference
				}).length;

				const screen = GetNodeLinkedTo(graph, {
					id: screenoption.id,
					link: LinkType.ScreenOptions
				});

				let collectionReference: any;
				if (screen) {
					collectionReference = GetNodeLinkedTo(graph, {
						id: screen.id,
						link: LinkType.DataChainCollectionReference
					});
				}
				let temp: { id: any };
				return [
					add_screenoption_reference
						? {
								operation: ADD_NEW_NODE,
								options(graph: any) {
									return {
										nodeType: NodeTypes.DataChainCollection,
										linkProperties: {
											properties: {
												...LinkProperties.DataChainCollectionReference
											}
										},
										parent: screenoption.id,
										properties: {
											[NodeProperties.UIText]: `${GetNodeTitle(screenoption)}`,
											[NodeProperties.Pinned]: false
										},
										callback: (node: any) => {
											temp = node;
										}
									};
								}
							}
						: false,
					collectionReference && add_screenoption_reference
						? {
								operation: ADD_LINK_BETWEEN_NODES,
								options() {
									return {
										source: temp.id,
										target: collectionReference.id,
										properties: { ...LinkProperties.DataChainCollection }
									};
								}
							}
						: null
				];
			});

			const components = GetNodesLinkedTo(graph, {
				id: screenoption.id,
				link: LinkType.Component
			});

			components.map((component: { id: any }) => {
				const nodes_linked = GetNodesLinkedTo(graph, {
					id: component.id,
					link: LinkType.DataChainCollectionReference
				});
				if (nodes_linked.length) {
					return null;
				}

				result.push((graph: any) => {
					const screenoption = GetNodesLinkedTo(graph, {
						id: component.id,
						link: LinkType.Component
					}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption)[0];
					let collectionReference: any;
					if (screenoption) {
						collectionReference = GetNodeLinkedTo(graph, {
							id: screenoption.id,
							link: LinkType.DataChainCollectionReference
						});
					}
					let subtemp: { id: any };
					return [
						{
							operation: ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.DataChainCollection,
									linkProperties: {
										properties: {
											...LinkProperties.DataChainCollectionReference
										}
									},
									parent: component.id,
									properties: {
										[NodeProperties.UIText]: `${GetNodeTitle(component)}`,
										[NodeProperties.Pinned]: false
									},
									callback: (node: any) => {
										subtemp = node;
									}
								};
							}
						},
						collectionReference
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											source: subtemp.id,
											target: collectionReference.id,
											properties: { ...LinkProperties.DataChainCollection }
										};
									}
								}
							: null
					];
				});
			});

			GetNodesLinkedTo(graph, {
				id: screenoption.id,
				link: LinkType.LifeCylceMethod
			})
				.map((lifeCycleMethod: { id: any }) => {
					const res = GetNodesLinkedTo(graph, {
						id: lifeCycleMethod.id,
						link: LinkType.LifeCylceMethodInstance
					}).map((lifecylceInstanceMethod: { id: any }) => {
						const chains = [
							...GetNodesLinkedTo(graph, {
								id: lifecylceInstanceMethod.id,
								link: LinkType.DataChainLink
							}).filter((chain: { id: any }) => {
								return GetNodesLinkedTo(graph, {
									id: chain.id
								}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.DataChain)
									.length;
							}),
							...GetNodesLinkedTo(graph, {
								id: lifecylceInstanceMethod.id,
								link: LinkType.PreDataChainLink
							}).filter((chain: { id: any }) => {
								return GetNodesLinkedTo(graph, {
									id: chain.id
								}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.DataChain)
									.length;
							}),
							...GetNodesLinkedTo(graph, {
								id: lifecylceInstanceMethod.id,
								link: LinkType.CallDataChainLink
							}).filter((chain: { id: any }) => {
								return GetNodesLinkedTo(graph, {
									id: chain.id
								}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.DataChain)
									.length;
							})
						];
						return chains;
					});
					return res;
				})
				.flatten()
				.forEach((chain: { id: any }) => {
					result.push({
						operation: ADD_LINK_BETWEEN_NODES,
						options(ggraph: any) {
							debugger;
							let screenOptionCollectionReference;
							if (screenoption) {
								screenOptionCollectionReference = GetNodeLinkedTo(ggraph, {
									id: screenoption.id,
									link: LinkType.DataChainCollectionReference
								});
							}
							if (!screenOptionCollectionReference) {
								throw new Error('missing screenOptionCollectionReference');
							}
							return {
								target: screenOptionCollectionReference.id,
								source: chain.id,
								properties: { ...LinkProperties.DataChainCollection }
							};
						}
					});
				});
		});
	});

	graphOperation(result.filter((x: any) => x))(GetDispatchFunc(), GetStateFunc());

	return result;
}
//this can be first
export function CollectionSharedReference() {
	const result: any = [];
	const graph = GetCurrentGraph();

	[ UITypes.ElectronIO, UITypes.ReactNative, UITypes.ReactWeb ].forEach((uiType) => {
		let sharedReferenceCollection = GetNodeByProperties(
			{
				[NodeProperties.SharedReferenceCollection]: true,
				[NodeProperties.UIType]: uiType
			},
			graph
		);
		if (!sharedReferenceCollection) {
			result.push({
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.DataChainCollection,
						properties: {
							[NodeProperties.UIText]: `Shared Components ${uiType}`,
							[NodeProperties.Pinned]: false,
							[NodeProperties.UIType]: uiType,
							[NodeProperties.SharedReferenceCollection]: true
						},
						callback: (node: any) => {
							sharedReferenceCollection = node;
						}
					};
				}
			});
		}
	});
	return result;
}
//this can be first
export function CollectionSharedMenuDataSource() {
	const result: any = [];
	const graph = GetCurrentGraph();

	let sharedMenuCollection = GetNodeByProperties(
		{
			[NodeProperties.SharedMenuCollection]: true
		},
		graph
	);
	if (!sharedMenuCollection) {
		result.push({
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.DataChainCollection,
					properties: {
						[NodeProperties.UIText]: `Menu Data Functions`,
						[NodeProperties.Pinned]: false,
						[NodeProperties.SharedMenuCollection]: true
					},
					callback: (node: any) => {
						sharedMenuCollection = node;
					}
				};
			}
		});
	}
	return result;
}
export function CollectionDataChainsRelatedToMenuSource(filter: any) {
	filter = filter || (() => true);
	const result: any = [];
	const graph = GetCurrentGraph();
	let sharedMenuCollection = GetNodeByProperties(
		{
			[NodeProperties.SharedMenuCollection]: true
		},
		graph
	);

	const menuDataSources = NodesByType(null, NodeTypes.MenuDataSource).filter((x: any) => filter(x));

	menuDataSources.forEach((menuDataSource: { id: any }) => {
		const steps: any[] = [];
		let connectedChains = GetNodesLinkedTo(graph, {
			id: menuDataSource.id,
			componentType: NodeTypes.DataChain
		});
		connectedChains.forEach((connectedChain: Node) => {
			if (sharedMenuCollection)
				steps.push({
					operation: ADD_LINK_BETWEEN_NODES,
					options() {
						return {
							target: sharedMenuCollection.id,
							source: connectedChain.id,
							properties: {
								...LinkProperties.DataChainCollection
							}
						};
					}
				});
		});
		result.push(...steps);
	});

	graphOperation(result.filter((x: any) => x))(GetDispatchFunc(), GetStateFunc());
}
export function CollectionConnectDataChainCollection(filter: any) {
	filter = filter || (() => true);
	const result: any = [];
	const graph = GetCurrentGraph();
	[ UITypes.ElectronIO, UITypes.ReactNative, UITypes.ReactWeb ].forEach((uiType) => {
		let sharedReferenceCollection = GetNodeByProperties(
			{
				[NodeProperties.SharedReferenceCollection]: true,
				[NodeProperties.UIType]: uiType
			},
			graph
		);

		const componentNodes = NodesByType(null, NodeTypes.ComponentNode)
			.filter((x: any) => filter(x))
			.filter((x: any) => {
				return GetNodeProp(x, NodeProperties.UIType) === uiType;
			});

		componentNodes.forEach((component: { id: any }) => {
			let reference: any = null;
			const steps = [];
			reference = getCollectionReference(graph, component);
			if (reference) {
				const parentReference = getParentCollectionReference(graph, component);
				if (parentReference || sharedReferenceCollection)
					steps.push({
						operation: ADD_LINK_BETWEEN_NODES,
						options() {
							return {
								target: (parentReference || sharedReferenceCollection).id,
								source: reference.id,
								properties: {
									...LinkProperties.DataChainCollection
								}
							};
						}
					});
			}
			result.push(...steps);
		});
	});

	graphOperation(result.filter((x: any) => x))(GetDispatchFunc(), GetStateFunc());
}

export function CollectionComponentNodes(filter: any) {
	filter = filter || (() => true);
	const result: any = [];
	const graph = GetCurrentGraph();
	[ UITypes.ElectronIO, UITypes.ReactNative, UITypes.ReactWeb ].forEach((uiType) => {
		let sharedReferenceCollection = GetNodeByProperties(
			{
				[NodeProperties.SharedReferenceCollection]: true,
				[NodeProperties.UIType]: uiType
			},
			graph
		);

		const componentNodes = NodesByType(null, NodeTypes.ComponentNode)
			.filter((x: any) => filter(x))
			.filter((x: any) => {
				return GetNodeProp(x, NodeProperties.UIType) === uiType;
			});
		componentNodes
			.sort((a: any, b: any) => {
				const a_lineage = getComponentLineage(graph, a);
				const b_lineage = getComponentLineage(graph, b);
				const intersects = a_lineage.intersection(b_lineage);
				if (intersects.length === 0) {
					return a_lineage.length - b_lineage.length;
				}
				if (a_lineage.length !== b_lineage.length) {
					return a_lineage.length - b_lineage.length;
				}
				return 0;
			})
			.forEach((component: { id: any }) => {
				result.push(function(graph: any) {
					const externalApiDataChains = getComponentExternalApiDataChains(graph, component);
					const internalApiDataChains = getComponentInternalApiDataChains(graph, component);
					const eventApiDataChains = getComponentEventDataChains(graph, component);
					let reference: any = null;
					const steps = [];
					reference = getCollectionReference(graph, component);
					if (!reference) {
						steps.push({
							operation: ADD_NEW_NODE,
							options(graph: any) {
								// const parentReference = getParentCollectionReference(graph, component);
								return {
									nodeType: NodeTypes.DataChainCollection,
									properties: {
										[NodeProperties.UIText]: `${GetNodeTitle(component)}`,
										[NodeProperties.Pinned]: false
									},
									links: [
										// !parentReference
										// 	? null
										// 	: {
										// 			target: parentReference.id,
										// 			linkProperties: {
										// 				properties: {
										// 					...LinkProperties.DataChainCollection
										// 				}
										// 			}
										// 		},
										{
											linkProperties: {
												properties: {
													...LinkProperties.DataChainCollectionReference
												}
											},
											target: component.id
										}
									].filter((x) => x),
									callback: (node: any) => {
										reference = node;
									}
								};
							}
						});
					}
					return [
						...steps,
						...[ ...externalApiDataChains, ...internalApiDataChains, ...eventApiDataChains ].map((dc) => {
							return {
								operation: ADD_LINK_BETWEEN_NODES,
								options(graph: any) {
									reference = reference || getCollectionReference(graph, component);
									return {
										target: reference.id,
										source: dc.id,
										properties: { ...LinkProperties.DataChainCollection }
									};
								}
							};
						})
					];
				});
			});
	});

	graphOperation(result.filter((x: any) => x))(GetDispatchFunc(), GetStateFunc());
}

export function CollectionScreenNodes(filter: any) {
	filter = filter || (() => true);
	const result: any = [];
	const graph = GetCurrentGraph();
	const screens = NodesByType(null, NodeTypes.Screen).filter((x: any) => filter(x));
	screens.forEach((screen: any) => {
		const screen_data_chains = [];
		const externalApiDataChains = getComponentExternalApiDataChains(graph, screen);
		const internalApiDataChains = getComponentInternalApiDataChains(graph, screen);
		const eventApiDataChains = getComponentEventDataChains(graph, screen);
		screen_data_chains.push(...externalApiDataChains, ...internalApiDataChains, ...eventApiDataChains);
		let reference: any = null;
		result.push(
			...[ ...screen_data_chains ].map((dc) => {
				return {
					operation: ADD_LINK_BETWEEN_NODES,
					options(graph: any) {
						reference = reference || getCollectionReference(graph, screen);
						return {
							target: reference.id,
							source: dc.id,
							properties: { ...LinkProperties.DataChainCollection }
						};
					}
				};
			})
		);
	});

	graphOperation(result.filter((x: any) => x))(GetDispatchFunc(), GetStateFunc());
}
export function getComponentLineage(graph: Graph, node: { id: any }): any {
	let parent = getParentComponent(graph, node);
	if (parent) {
		return [ ...getComponentLineage(graph, parent), node.id ];
	}
	return [ node.id ];
}
export function getParentCollectionReference(graph: any, node: { id: any }) {
	let parent = getParentComponent(graph, node);
	if (parent) {
		return GetNodeLinkedTo(graph, {
			id: parent.id,
			link: LinkType.DataChainCollectionReference
		});
	}

	return null;
}
export function getCollectionReference(graph: any, node: { id: any }) {
	return GetNodeLinkedTo(graph, {
		id: node.id,
		link: LinkType.DataChainCollectionReference
	});
}
export function getParentComponent(graph: any, node: { id: any }) {
	let parent = GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.Component,
		direction: TARGET
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode)[0];
	if (!parent) {
		parent = GetNodesLinkedTo(graph, {
			id: node.id,
			link: LinkType.Component,
			direction: TARGET
		}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption)[0];
	}
	if (!parent) {
		parent = GetNodesLinkedTo(graph, {
			id: node.id,
			link: LinkType.ListItem,
			direction: TARGET
		}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode)[0];
	}
	if (!parent) {
		parent = GetNodesLinkedTo(graph, {
			id: node.id,
			link: LinkType.ScreenOptions,
			direction: TARGET
		}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Screen)[0];
	}

	return parent;
}
export function getTopComponent(graph: Graph, node: any): any {
	const parent = getParentComponent(graph, node);
	if (parent) {
		return getTopComponent(graph, parent);
	}
	return node;
}
function getComponentExternalApiDataChains(graph: Graph, node: { id: any }) {
	const result: any[] = [];
	GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.ComponentExternalApi,
		direction: SOURCE
	}).map((res: { id: any }) => {
		result.push(
			...GetNodesLinkedTo(graph, {
				id: res.id,
				link: LinkType.DataChainLink,
				direction: SOURCE
			}).filter((x: any) => GetNodeProp(x, NodeProperties.EntryPoint))
		);
	});
	return result;
}

function getComponentInternalApiDataChains(graph: Graph, node: { id: any }) {
	const result: any[] = [];
	GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.ComponentInternalApi,
		direction: SOURCE
	}).map((res: { id: any }) => {
		result.push(
			...GetNodesLinkedTo(graph, {
				id: res.id,
				link: LinkType.DataChainLink,
				direction: SOURCE
			}).filter((x: any) => GetNodeProp(x, NodeProperties.EntryPoint))
		);
	});
	return result;
}

function getComponentEventDataChains(graph: Graph, node: { id: any }) {
	const result: any[] = [];
	GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.EventMethod,
		componentType: NodeTypes.EventMethod
	}).map((res: { id: any }) => {
		const instances = GetNodesLinkedTo(graph, {
			id: res.id,
			link: LinkType.EventMethodInstance,
			componentType: NodeTypes.EventMethodInstance
		});
		instances.map((res: { id: any }) => {
			result.push(
				...GetNodesLinkedTo(graph, {
					id: res.id,
					link: LinkType.DataChainLink,
					componentType: NodeTypes.DataChain
				}).filter((x: any) => GetNodeProp(x, NodeProperties.EntryPoint))
			);
		});
	});
	return result;
}

export function sortComponentByLineage(graph: Graph, a: { id: any }, b: { id: any }) {
	const a_lineage = getComponentLineage(graph, a);
	const b_lineage = getComponentLineage(graph, b);
	const intersects = a_lineage.intersection(b_lineage);
	if (intersects.length === 0) {
		return 0;
	}
	if (a_lineage.length !== b_lineage.length) {
		return a_lineage.length - b_lineage.length;
	}
	return 0;
}
