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
	GetModelCodeProperties
} from '../../../actions/uiactions';
import { GetNodesLinkedTo, GetNodeLinkedTo, GetCellProperties } from '../../../methods/graph_methods';
import { LinkType, LinkProperties, NodeProperties, NodeTypes, EventArgumentTypes } from '../../../constants/nodetypes';
import { Node, ComponentLayoutContainer } from '../../../methods/graph_types';
import {
	AddButtonToSubComponent,
	AddButtonToComponentLayout,
	SetupApi,
	AddApiToButton,
	AddInternalComponentApi,
	GetHideStyle,
	AddComponentAutoStyles
} from './Shared';
import CreateNavigateToScreenDC from '../../CreateNavigateToScreenDC';
import { GetScreenOption } from '../../../service/screenservice';
import { ViewTypes } from '../../../constants/viewtypes';

export default function SetupRoute(
	screen: Node,
	routing: Routing,
	information: SetupInformation,
	onlyGetAll?: boolean
) {
	console.log('setup route');
	routing.routes.forEach((routeDescription: RouteDescription) => {
		SetupRouteDescription(routeDescription, screen, information, onlyGetAll);
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
		let childProperties = GetModelCodeProperties(screen.id).filter(
			(v: Node) =>
				GetNodeProp(v, NodeProperties.IsTypeList) || GetNodeProp(v, NodeProperties.NODEType) === NodeTypes.Model
		);
		return !!childProperties.find((v: Node) => {
			if (routeDescription.source) {
				let temp = routeDescription.source['model'];
				if (temp && temp.model) {
					switch (temp.type) {
						case RouteSourceType.Model:
							return v.id === temp.model;
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
	onlyGetAll?: boolean
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
			NavigateTo(routeDescription, targetScreen, information, { eventInstance, event, button });
		} else {
			console.log(JSON.stringify(routeDescription, null, 4));
			throw new Error('missing targetScreen');
		}
		if (!isArrayProperty) {
			let cellId = AddButtonToComponentLayout({ button, component: subcomponent });
			AddComponentAutoStyles(subcomponent, routeDescription, cellId);
		}
	});
}

function NavigateTo(
	routeDescription: RouteDescription,
	screen: Node,
	information: SetupInformation,
	buttonInformation: { eventInstance: string; event: string; button: string }
) {
	console.log('navigate to ' + GetNodeTitle(screen));

	let { eventInstance, event, button } = buttonInformation;
	// this can be updated to include different types of parameters,
	// checkout the lambda property for the arguments, setting it to the appropriate
	// lambda string will get use the parameters in the url that we desire.
	console.log('create navigate to screen DC ');

	let entryNode: string | null = null;
	graphOperation(
		CreateNavigateToScreenDC({
			screen: screen.id,
			node: () => eventInstance,
			callback: (dataChainContext: { entry: string }) => {
				entryNode = dataChainContext.entry;
			}
		})
	)(GetDispatchFunc(), GetStateFunc());
	if (entryNode !== null) {
		graphOperation(AddLinkBetweenNodes(entryNode, button, LinkProperties.MethodArgumentSoure))(
			GetDispatchFunc(),
			GetStateFunc()
		);
	}

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
							AttachEventArguments(button, sourceKey, temp, screen);
							break;
					}
				}
			}
		});
	}

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
