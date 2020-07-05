import { RoutingProps, Routing, RouteDescription } from '../../../interface/methodprops';
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
	updateComponentProperty
} from '../../../actions/uiactions';
import { GetNodesLinkedTo } from '../../../methods/graph_methods';
import { LinkType, LinkProperties, NodeProperties } from '../../../constants/nodetypes';
import { Node } from '../../../methods/graph_types';
import { AddButtonToSubComponent, AddButtonToComponentLayout } from './Shared';
import CreateNavigateToScreenDC from '../../CreateNavigateToScreenDC';

export default function SetupRoute(screen: Node, routing: Routing, information: SetupInformation) {
	console.log('setup route');
	routing.routes.forEach((routeDescription: RouteDescription) => {
		SetupRouteDescription(routeDescription, screen, information);
	});
}

function SetupRouteDescription(routeDescription: RouteDescription, screen: Node, information: SetupInformation) {
	console.log('setup route description');
	let graph = GetCurrentGraph();
	let setup_options = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	setup_options.forEach((screenOption: Node) => {
		let { eventInstance, event, button, subcomponent } = AddButtonToSubComponent(screenOption);
		updateComponentProperty(button, NodeProperties.UIText, routeDescription.name || GetNodeTitle(button));
		AddButtonToComponentLayout({ button, component: subcomponent });
		NavigateTo(routeDescription, screen, information, { eventInstance, event, button });
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
	graphOperation(
		CreateNavigateToScreenDC({
			screen: screen.id,
			node: () => eventInstance
		})
	)(GetDispatchFunc(), GetStateFunc());

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
