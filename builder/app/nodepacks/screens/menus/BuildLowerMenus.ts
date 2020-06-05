import { NodesByType } from '../../../methods/graph_methods';
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
import { Node } from '../../../methods/graph_types';
import { ViewTypes } from '../../../constants/viewtypes';

export default function BuildLowerMenus() {
	let graph = GetCurrentGraph();
	let models = NodesByType(graph, NodeTypes.Model);
	let agents = models.filter((model: Node) => {
		return GetNodeProp(model, NodeProperties.IsAgent) && !GetNodeProp(model, NodeProperties.IsUser);
	});

	let result: any[] = [];

	agents.forEach((agent: Node) => {
		models.forEach((model: Node) => {
			let temp = GetNodesByProperties({
				[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
				[NodeProperties.ViewType]: ViewTypes.GetAll,
				[NodeProperties.Agent]: agent.id,
				[NodeProperties.Model]: model.id
			});
			let getAllScreen: Node = temp.find((x) => !GetNodeProp(x, NodeProperties.IsDashboard));

			let createScreen: Node = GetNodesByProperties({
				[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
				[NodeProperties.ViewType]: ViewTypes.Create,
				[NodeProperties.Agent]: agent.id,
				[NodeProperties.Model]: model.id
			}).find((x) => !GetNodeProp(x, NodeProperties.IsDashboard));

			let dashboard: Node = GetNodeByProperties({
				[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
				[NodeProperties.IsDashboard]: true,
				[NodeProperties.Agent]: agent.id,
				[NodeProperties.Model]: model.id
			});
			let menuNode: Node;
			if (dashboard) {
				result.push({
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.MenuDataSource,
							properties: {
								[NodeProperties.UIText]: `${GetNodeTitle(dashboard)} Menu`,
								[NodeProperties.Agent]: agent.id,
								[NodeProperties.Model]: model.id
							},
							callback: (newnode: Node) => {
								menuNode = newnode;
							}
						};
					}
				});
				if (getAllScreen) {
					result.push({
						operation: ADD_LINK_BETWEEN_NODES,
						options: () => ({
							target: getAllScreen.id,
							source: menuNode.id,
							properties: { ...LinkProperties.MenuLink }
						})
					});
				}
				if (createScreen) {
					result.push({
						operation: ADD_LINK_BETWEEN_NODES,
						options: () => ({
							target: createScreen.id,
							source: menuNode.id,
							properties: { ...LinkProperties.MenuLink }
						})
					});
				}
				if (dashboard) {
					result.push({
						operation: ADD_LINK_BETWEEN_NODES,
						options: () => ({
							target: dashboard.id,
							source: menuNode.id,
							properties: { ...LinkProperties.MenuLink }
						})
					});
				}
			} else {
				console.warn('no dashboard');
			}
		});
  });

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
