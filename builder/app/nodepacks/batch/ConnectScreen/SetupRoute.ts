import {
	RoutingProps,
	Routing,
	RouteDescription,
	ScreenEffectApiProps,
	ScreenEffectApi,
	RouteSourceType,
	RouteSource
} from '../../../interface/methodprops';
import { SetupInformation } from './SetupInformation';
import {
	GetCurrentGraph,
	GetDispatchFunc,
	GetStateFunc,
	graphOperation,
	Connect,
	ADD_LINK_BETWEEN_NODES,
	GetComponentApiNodes,
	GetNodeTitle,
	updateComponentProperty,
	GetNodeByProperties,
	GetNodeProp,
	GetComponentInternalApiNode,
	GetNodeById,
	AddLinkBetweenNodes,
	CreateNewNode,
	GetModelCodeProperties,
	addComponentTags
} from '../../../actions/uiActions';
import { GetNodesLinkedTo, GetNodeLinkedTo, GetCellProperties, SOURCE } from '../../../methods/graph_methods';
import {
	LinkType,
	LinkProperties,
	NodeProperties,
	NodeTypes,
	EventArgumentTypes,
	PropertyCentricTypes,
	UIActionMethodParameterTypes,
	UIActionMethods
} from '../../../constants/nodetypes';
import { Node, ComponentLayoutContainer } from '../../../methods/graph_types';
import {
	AddButtonToSubComponent,
	AddButtonToComponentLayout,
	SetupApi,
	AddApiToButton,
	AddInternalComponentApi,
	GetHideStyle,
	AddComponentAutoStyles,
	SetupApiResult,
	AddCellToComponentLayout
} from './Shared';
import CreateNavigateToScreenDC from '../../CreateNavigateToScreenDC';
import { GetScreenOption } from '../../../service/screenservice';
import { ViewTypes } from '../../../constants/viewtypes';
import { LinkPropertyKeys } from '../../../constants/nodetypes';
import { TARGET } from '../../../methods/graph_methods';
import { ComponentTags } from '../../../constants/componenttypes';

export default function SetupRoute(
	screen: Node,
	routing: Routing,
	information: SetupInformation,
	onlyGetAll?: boolean
) {
	console.log('setup route');
	routing.routes.forEach((routeDescription: RouteDescription, routeIndex: number) => {
		SetupRouteDescription(routeDescription, screen, information, onlyGetAll, routeIndex);
	});
}

function AttachEventArguments(eventInstance: string, paramName: string, routeSource: RouteSource, screen: Node) {
	let result: any = null;
	graphOperation(
		CreateNewNode(
			{
				[NodeProperties.NODEType]: NodeTypes.EventArgument,
				[NodeProperties.RouteSource]: JSON.parse(JSON.stringify(routeSource)),
				[NodeProperties.ParameterName]: paramName,
				[NodeProperties.EventArgumentType]: EventArgumentTypes.RouteSource,
				[NodeProperties.UIText]: `${GetNodeTitle(eventInstance)} Argument ${paramName}`,
				[NodeProperties.Screen]: screen.id
			},
			(_node: Node) => {
				result = _node;
			}
		)
	)(GetDispatchFunc(), GetStateFunc());

	graphOperation(AddLinkBetweenNodes(eventInstance, result.id, LinkProperties.EventArgument))(
		GetDispatchFunc(),
		GetStateFunc()
	);

	return result;
}
function IsRouteForArrayProperty(routeDescription: RouteDescription, screen: Node): boolean {
	if (GetNodeProp(screen, NodeProperties.IsDashboard)) {
		return false;
	}

	let model = GetNodeProp(screen, NodeProperties.Model);
	if (model) {
		let childProperties = GetModelCodeProperties(model).filter(
			(v: Node) =>
				GetNodeProp(v, NodeProperties.IsTypeList) || GetNodeProp(v, NodeProperties.NODEType) === NodeTypes.Model
		);
		return !!childProperties.find((v: Node) => {
			if (routeDescription.source) {
				let temp = routeDescription.source['model'];
				if (temp && temp.model) {
					switch (temp.type) {
						case RouteSourceType.Model:
							return v.id === temp.property;
					}
				}
			}
			return false;
		});
	}
	return false;
}
function SetupRouteDescription(
	routeDescription: RouteDescription,
	screen: Node,
	information: SetupInformation,
	onlyGetAll?: boolean, routeIndex?: number
) {
	console.log('setup route description');
	let graph = GetCurrentGraph();
	let setup_options = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	setup_options.forEach((screenOption: Node) => {
		if (onlyGetAll && GetNodeProp(screenOption, NodeProperties.ViewType) !== ViewTypes.GetAll) {
			return;
		} else if (
			!onlyGetAll &&
			GetNodeProp(screenOption, NodeProperties.ViewType) === ViewTypes.GetAll &&
			!GetNodeProp(screen, NodeProperties.IsDashboard)
		) {
			return;
		}
		let isArrayProperty = IsRouteForArrayProperty(routeDescription, screen);
		let { eventInstance, event, button, subcomponent } = AddButtonToSubComponent(screenOption, {
			onItemSelection: routeDescription.isItemized || false,
			isArrayProperty
		});

		updateComponentProperty(button, NodeProperties.UIText, routeDescription.name || GetNodeTitle(button));
		let targetScreen: Node | null = null;
		if (routeDescription.isDashboard) {
			let navigationDashboard = GetNodeById(routeDescription.dashboard);
			if (!navigationDashboard) {
				console.log(JSON.stringify(routeDescription, null, 4));
			}
			let screenImpl = GetNodeLinkedTo(graph, {
				id: navigationDashboard.id,
				link: LinkType.NavigationScreenImplementation
			});
			targetScreen = screenImpl;
		} else {
			targetScreen = GetNodeByProperties({
				[NodeProperties.NODEType]: NodeTypes.Screen,
				[NodeProperties.Model]: routeDescription.model,
				[NodeProperties.Agent]: routeDescription.agent,
				[NodeProperties.ViewType]: routeDescription.viewType
			});
		}
		AddApiToButton({ button, component: subcomponent });
		// console.log(GetNodeProp(routeDescription.))
		if (targetScreen) {
			NavigateTo(routeDescription, targetScreen, information, { isArrayProperty, eventInstance, event, button });
		} else {
			console.log(JSON.stringify(routeDescription, null, 4));
			throw new Error('missing targetScreen');
		}
		if (!isArrayProperty) {
			let cellId = AddButtonToComponentLayout({ button, component: subcomponent });
			AddComponentAutoStyles(subcomponent, routeDescription, cellId);
		} else {
			updateComponentProperty(button, NodeProperties.IsPropertyCentric, true);
			updateComponentProperty(button, NodeProperties.PropertyCentricType, PropertyCentricTypes.Route);
			if (routeDescription.source) {
				let temp = routeDescription.source['model'];
				if (temp && temp.model) {
					switch (temp.type) {
						case RouteSourceType.Model:
							updateComponentProperty(button, NodeProperties.PropertyBeingUsed, temp.property);
							let propertyComponents = GetPropertyComponentInLayout(
								subcomponent,
								temp.property ? temp.property : ''
							);
							[propertyComponents].forEach((pc: Node | null) => {
								if (pc) {
									let res: SetupApiResult = SetupApi(GetNodeById(subcomponent), 'routeinj', pc, true);
									res.internal.forEach((internal: string) => {
										updateComponentProperty(internal, NodeProperties.RouteInjection, true);
									});
									res.external.forEach((external: string) => {
										updateComponentProperty(external, NodeProperties.RouteInjection, true);
									});
									let connectedComponentNodes = GetNodesLinkedTo(GetCurrentGraph(), {
										id: pc.id,
										componentType: NodeTypes.ComponentNode,
										direction: SOURCE
									});
									connectedComponentNodes
										.filter(
											(v: Node) =>
												GetNodeProp(v, NodeProperties.UIType) ===
												GetNodeProp(screenOption, NodeProperties.UIType)
										)
										.forEach((ccn: Node) => {
											let res = SetupApi(pc, 'routeinj', ccn);
											res.internal.forEach((internal: string) => {
												updateComponentProperty(internal, NodeProperties.RouteInjection, true);
											});
											res.external.forEach((external: string) => {
												updateComponentProperty(external, NodeProperties.RouteInjection, true);
											});

											let temp = GetNodesLinkedTo(GetCurrentGraph(), {
												id: ccn.id,
												componentType: NodeTypes.ComponentNode
											});
											temp.filter((v: Node) => v.id !== pc.id).forEach((ccnChild: Node) => {
												let res = SetupApi(ccn, 'routeinj', ccnChild);
												res.internal.forEach((internal: string) => {
													updateComponentProperty(
														internal,
														NodeProperties.RouteInjection,
														true
													);
												});
												res.external.forEach((external: string) => {
													updateComponentProperty(
														external,
														NodeProperties.RouteInjection,
														true
													);
												});
												let { newCell, layout } = AddCellToComponentLayout(ccnChild.id);
												if (layout && newCell) {
													layout.properties[newCell].injections = {
														route: 'routeinj'
													};
													const childId = newCell;
													const cellProperties = GetCellProperties(layout, childId);
													addComponentTags(ComponentTags.Field, cellProperties);
													addComponentTags(ComponentTags.RouteButton, cellProperties);
													addComponentTags(ComponentTags.RouteButtonNum + (routeIndex || 0), cellProperties);
													updateComponentProperty(ccnChild.id, NodeProperties.Layout, layout);
												}
											});
										});
								}
							});
							break;
					}
				}
			}
		}
	});
}

// Get a component in the layout of the parent that will be handling the model property.
function GetPropertyComponentInLayout(parent: string, property: string): Node | null {
	let layout: ComponentLayoutContainer = GetNodeProp(parent, NodeProperties.Layout);
	let result: Node | null = null;
	if (layout) {
		let { properties } = layout;
		if (properties) {
			Object.entries(properties).find((item: any[]) => {
				let [key, value] = item;
				if (value) {
					let { children } = value;
					if (children && children[key]) {
						let propertyNode = GetNodesLinkedTo(GetCurrentGraph(), {
							id: children[key],
							link: LinkType.DefaultViewType,
							linkProperties: {
								[LinkPropertyKeys.Sibling]: property
							}
						}).find((v: Node) => v.id === property);
						if (propertyNode) {
							result = GetNodeById(children[key]);
							return true;
						}
					}
				}
			});
		}
	}
	return result;
}
function NavigateTo(
	routeDescription: RouteDescription,
	screen: Node,
	information: SetupInformation,
	buttonInformation: { isArrayProperty?: boolean; eventInstance: string; event: string; button: string }
) {
	console.log('navigate to ' + GetNodeTitle(screen));

	let { eventInstance, event, button } = buttonInformation;
	// this can be updated to include different types of parameters,
	// checkout the lambda property for the arguments, setting it to the appropriate
	// lambda string will get use the parameters in the url that we desire.
	console.log('create navigate to screen DC ');

	let entryNode: string | null = null;
	// graphOperation(
	// 	CreateNavigateToScreenDC({
	// 		screen: screen.id,
	// 		node: () => eventInstance,
	// 		callback: (dataChainContext: { entry: string }) => {
	// 			entryNode = dataChainContext.entry;
	// 		}
	// 	})
	// )(GetDispatchFunc(), GetStateFunc());
	// if (entryNode !== null) {
	// 	graphOperation(AddLinkBetweenNodes(entryNode, button, LinkProperties.MethodArgumentSoure))(
	// 		GetDispatchFunc(),
	// 		GetStateFunc()
	// 	);
	// }
	let routeArgumentNodes: Node[] = [];
	if (routeDescription && routeDescription.source) {
		Object.keys(routeDescription.source).forEach((sourceKey: string) => {
			if (routeDescription.source) {
				let temp = routeDescription.source[sourceKey];
				if (temp) {
					switch (temp.type) {
						case RouteSourceType.Model:
						case RouteSourceType.Agent:
						case RouteSourceType.UrlParameter:
						case RouteSourceType.Item:
						case RouteSourceType.Body:
							let tempNode: Node = AttachEventArguments(button, sourceKey, temp, screen);
							routeArgumentNodes.push(tempNode);
							break;
					}
				}
			}
		});
	}
	let componentApiNodes = GetComponentApiNodes(button, GetCurrentGraph());
	graphOperation([
		() => {
			return [
				() => {
					let uiMethodNode: Node = GetNodeByProperties({
						[NodeProperties.UIActionMethod]: UIActionMethods.NavigateToScreen,
						[NodeProperties.NODEType]: NodeTypes.UIMethod
					});
					let res: any[] = [];
					if (!uiMethodNode) {
						res.push(() => {
							return CreateNewNode(
								{
									[NodeProperties.UIActionMethod]: UIActionMethods.NavigateToScreen,
									[NodeProperties.UIText]: UIActionMethods.NavigateToScreen,
									[NodeProperties.NODEType]: NodeTypes.UIMethod
								},
								(node: Node) => {
									uiMethodNode = node;
								}
							);
						});
					}
					res.push(() => {
						return AddLinkBetweenNodes(eventInstance, uiMethodNode.id, {
							...LinkProperties.UIMethod,
							parameters: [
								{
									type: UIActionMethodParameterTypes.FunctionParameter,
									value: 'value'
								},
								{
									type: UIActionMethodParameterTypes.RouteDescription,
									routeArgNodes: routeArgumentNodes.map((v: Node) => v.id),
									componentApiNodes: componentApiNodes.map((v: Node) => v.id)
								},
								{
									type: UIActionMethodParameterTypes.ScreenRoute,
									value: screen.id
								},
								{
									type: UIActionMethodParameterTypes.Navigate
								}
							]
						});
					});

					return res;
				}
			];
		}
	])(GetDispatchFunc(), GetStateFunc());

	console.log('adding connections to api nodes');
	graphOperation((currentGraph: any) => {
		let nodes = GetComponentApiNodes(button, currentGraph);
		// const valueComponentApiNode = GetComponentApiNode(ComponentApiKeys.Value, button, currentGraph);
		// if all the values can be calculated in the lambda,
		// this might not be necessary
		return nodes.map((apiNode: Node) => {
			return {
				operation: ADD_LINK_BETWEEN_NODES,
				options: Connect(eventInstance, apiNode.id, LinkProperties.ComponentApi)
			};
		});
	})(GetDispatchFunc(), GetStateFunc());
}

export function GetRoute(routeProps: RoutingProps, viewType: string): Routing | null {
	let temp: any = routeProps;
	if (temp && temp[viewType]) {
		return temp[viewType];
	}
	return null;
}
