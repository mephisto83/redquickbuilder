import {
	NodesByType,
	GetNodesLinkedTo,
	SOURCE,
	existsLinksBetween,
	existsLinkBetween
} from '../../../methods/graph_methods';
import {
	GetCurrentGraph,
	GetNodeProp,
	GetNodeByProperties,
	GetNodesByProperties,
	ADD_NEW_NODE,
	GetNodeTitle,
	ADD_LINK_BETWEEN_NODES,
	GetDispatchFunc,
	GetStateFunc,
	graphOperation
} from '../../../actions/uiactions';
import { NodeTypes, NodeProperties, LinkProperties } from '../../../constants/nodetypes';
import { Node, Graph } from '../../../methods/graph_types';

export default function CreateMirrorMenu(args: { id: string }) {
	let { id } = args;

	let graph = GetCurrentGraph();
	let otherScreens = GetNodesLinkedTo(graph, { id, direction: SOURCE });

	let result: any[] = [];
	let menuNode: Node = GetNodeByProperties({
		[NodeProperties.NODEType]: NodeTypes.MenuDataSource,
		[NodeProperties.Agent]: GetNodeProp(id, NodeProperties.Agent),
		[NodeProperties.IsDashboard]: GetNodeProp(id, NodeProperties.IsDashboard),
		[NodeProperties.Model]: GetNodeProp(id, NodeProperties.Model),
		[NodeProperties.NavigationScreen]: id
	});
	if (!menuNode) {
		result.push({
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.MenuDataSource,
					properties: {
						[NodeProperties.UIText]: `${GetNodeTitle(id)} Menu`,
						[NodeProperties.Agent]: GetNodeProp(id, NodeProperties.Agent),
						[NodeProperties.IsDashboard]: GetNodeProp(id, NodeProperties.IsDashboard),
						[NodeProperties.Model]: GetNodeProp(id, NodeProperties.Model),
						[NodeProperties.NavigationScreen]: id
					},
					callback: (newnode: Node) => {
						menuNode = newnode;
					}
				};
			}
		});
	}
	result.push({
		operation: ADD_LINK_BETWEEN_NODES,
		options: () => ({
			target: id,
			source: menuNode.id,
			properties: { ...LinkProperties.MenuLink }
		})
	});
	otherScreens.forEach((oScreen: Node) => {
		let { id } = oScreen;
		let node: Node = GetNodeByProperties({
			[NodeProperties.NODEType]: NodeTypes.MenuDataSource,
			[NodeProperties.Agent]: GetNodeProp(id, NodeProperties.Agent),
			[NodeProperties.IsDashboard]: GetNodeProp(id, NodeProperties.IsDashboard),
			[NodeProperties.Model]: GetNodeProp(id, NodeProperties.Model),
			[NodeProperties.NavigationScreen]: id
		});
		if (!node) {
			result.push({
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.MenuDataSource,
						properties: {
							[NodeProperties.UIText]: `${GetNodeTitle(id)} Menu`,
							[NodeProperties.Agent]: GetNodeProp(id, NodeProperties.Agent),
							[NodeProperties.Model]: GetNodeProp(id, NodeProperties.Model),
							[NodeProperties.IsDashboard]: GetNodeProp(id, NodeProperties.IsDashboard),
							[NodeProperties.NavigationScreen]: id
						},
						callback: (newnode: Node) => {
							node = newnode;
						}
					};
				}
			});
		}
		result.push({
			operation: ADD_LINK_BETWEEN_NODES,
			options: () => {
				if (
					oScreen &&
					node &&
					!existsLinkBetween(graph, {
						source: node.id,
						target: oScreen.id
					})
				) {
					return {
						target: oScreen.id,
						source: node.id,
						properties: { ...LinkProperties.MenuLink }
					};
				}
				return null;
			}
		});
		result.push({
			operation: ADD_LINK_BETWEEN_NODES,
			options: (graph: Graph) => {
				if (
					node &&
					menuNode &&
					!existsLinkBetween(graph, {
						source: menuNode.id,
						target: node.id
					})
				) {
					return {
						target: node.id,
						source: menuNode.id,
						properties: { ...LinkProperties.MenuLink }
					};
				}
				return null;
			}
		});
	});

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
