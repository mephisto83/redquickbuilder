import {
	graphOperation,
	ADD_NEW_NODE,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeTitle,
	GetNodeByProperties,
	GetNodesByProperties
} from '../actions/uiactions';
import { NodeTypes, LinkProperties, NodeProperties } from '../constants/nodetypes';
import { GetNodeProp } from '../methods/graph_methods';
import { Node } from '../methods/graph_types';
import DashboardScreenNavigation from './DashboardScreenNavigation';

export default function BuildNavigationScreen(args: { model: string; agent: string; management: boolean }) {
	let { model, agent, management } = args;
	let navigationScreen: any;

	let existingScreen = GetNodeByProperties({
		[NodeProperties.IsDashboard]: true,
		[NodeProperties.Model]: model,
		[NodeProperties.Agent]: agent
	});
	if (existingScreen) {
		return;
	}
	graphOperation([
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.NavigationScreen,
					properties: {
						[NodeProperties.UIText]: `${GetNodeProp(model, NodeProperties.UIText)} Screen`,
						[NodeProperties.IsDashboard]: true,
						[NodeProperties.Model]: model,
						[NodeProperties.Agent]: agent
					},
					callback(node: Node) {
						navigationScreen = node.id;
					}
				};
			}
		},
		function() {
			return DashboardScreenNavigation({
				modelTitle: GetNodeTitle(model),
				component: navigationScreen,
				model: model,
				agent,
				skipCreate: management
			});
		}
	])(GetDispatchFunc(), GetStateFunc());
}
