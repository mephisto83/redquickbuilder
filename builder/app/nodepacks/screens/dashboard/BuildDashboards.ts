import { NodeTypes, NodeProperties } from '../../../constants/nodetypes';
import { NodesByType, GetNodeProp, GetNodeTitle, GetCurrentGraph } from '../../../actions/uiactions';
import { Node } from '../../../methods/graph_types';
import CreateSmartDashboard from './CreateSmartDashboard';
import { GetNodesLinkedTo, SOURCE } from '../../../methods/graph_methods';

export default function BuildDashboards(filter: Function) {
	let screens = NodesByType(null, NodeTypes.NavigationScreen)
		.filter((x: Node) => GetNodeProp(x, NodeProperties.IsDashboard))
		.filter(filter);
	let graph = GetCurrentGraph();

	screens.forEach((screen: Node) => {
		let buttons = GetNodesLinkedTo(graph, {
			id: screen.id,
			direction: SOURCE
		}).map((targetNode: Node) => {
			return { title: GetNodeTitle(targetNode) };
		});
		CreateSmartDashboard({
			dashboardName: GetNodeTitle(screen),
			componentName: `${GetNodeTitle(screen)} Component`,
			buttons
		});
	});
}
