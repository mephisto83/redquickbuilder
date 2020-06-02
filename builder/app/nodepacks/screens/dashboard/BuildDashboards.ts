import { NodeTypes, NodeProperties, UITypes } from '../../../constants/nodetypes';
import {
	NodesByType,
	GetNodeProp,
	GetNodeTitle,
	GetCurrentGraph,
	graphOperation,
	UPDATE_NODE_PROPERTY,
	GetDispatchFunc,
	GetStateFunc
} from '../../../actions/uiactions';
import { Node } from '../../../methods/graph_types';
import CreateSmartDashboard from './CreateSmartDashboard';
import { GetNodesLinkedTo, SOURCE, SetPause } from '../../../methods/graph_methods';

export default function BuildDashboards(filter: Function) {
	let navigationScreens = NodesByType(null, NodeTypes.NavigationScreen)
		.filter((x: Node) => GetNodeProp(x, NodeProperties.IsDashboard))
		.filter(filter);
	let graph = GetCurrentGraph();
	SetPause(true);
	navigationScreens.forEach((navigationScreen: Node) => {
		let buttons = GetNodesLinkedTo(graph, {
			id: navigationScreen.id,
			direction: SOURCE
		}).map((targetNode: Node) => {
			return { title: GetNodeTitle(targetNode), target: targetNode.id };
		});
		let types = {
			[UITypes.ElectronIO]: true,
			[UITypes.ReactNative]: true,
			[UITypes.ReactWeb]: true
		};
		let screenContext: { entry: string };
		Object.keys(types).forEach((uiType: string) => {
			CreateSmartDashboard({
				dashboardName: GetNodeTitle(navigationScreen),
				uiType,
				componentName: `${GetNodeTitle(navigationScreen)} Component`,
				buttons,
				callback: (sdcontext: { entry: string }) => {
					screenContext = sdcontext;
				}
			});
		});
		graphOperation(function() {
			return {
				operation: UPDATE_NODE_PROPERTY,
				options: () => {
					return {
						id: navigationScreen.id,
						properties: {
							[NodeProperties.Screen]: screenContext.entry
						}
					};
				}
			};
		})(GetDispatchFunc(), GetStateFunc());
	});
	SetPause(false);
}
