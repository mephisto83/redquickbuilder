/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeTypes, NodeProperties, UITypes, LinkType, LinkProperties } from '../../../constants/nodetypes';
import {
	NodesByType,
	GetNodeProp,
	GetNodeTitle,
	GetCurrentGraph,
	graphOperation,
	UPDATE_NODE_PROPERTY,
	GetDispatchFunc,
	GetStateFunc,
	AddLinkBetweenNodes
} from '../../../actions/uiactions';
import { Node, Graph } from '../../../methods/graph_types';
import CreateSmartDashboard from './CreateSmartDashboard';
import { GetNodesLinkedTo, SOURCE, SetPause } from '../../../methods/graph_methods';

export default function BuildDashboards(filter: Function) {
	const navigationScreens: Node[] = NodesByType(null, NodeTypes.NavigationScreen)
		.filter((x: Node) => GetNodeProp(x, NodeProperties.IsDashboard))
		.filter(filter);
	const graph: Graph = GetCurrentGraph();
	SetPause(true);
	navigationScreens.forEach((navigationScreen: Node) => {
		const types: any = {
			[UITypes.ElectronIO]: true,
			[UITypes.ReactNative]: true,
			[UITypes.ReactWeb]: true
		};
		let screenContext: { entry: string } | any = null;
		Object.keys(types).forEach((uiType: string) => {
			CreateSmartDashboard({
				dashboardName: GetNodeTitle(navigationScreen),
				uiType,
				componentName: `${GetNodeTitle(navigationScreen)} Component`,
				//buttons: [],
				buttons: GetNodesLinkedTo(graph, {
					id: navigationScreen.id,
					direction: SOURCE,
					link: LinkType.NavigationScreen
				}).map((targetNode: Node) => {
					return {
						title: GetNodeTitle(targetNode),
						target: targetNode.id,
						isDashboard: GetNodeProp(targetNode, NodeProperties.IsDashboard)
					};
				}),
				isHome: !!GetNodeProp(navigationScreen, NodeProperties.IsHomeLaunchView),
				callback: (sdcontext: { entry: string }) => {
					screenContext = sdcontext;
				}
			});
		});
		if (screenContext) {
			graphOperation(
				AddLinkBetweenNodes(
					navigationScreen.id,
					screenContext ? screenContext.entry : '',
					LinkProperties.NavigationScreenImplementation
				)
			)(GetDispatchFunc(), GetStateFunc());
		}
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
