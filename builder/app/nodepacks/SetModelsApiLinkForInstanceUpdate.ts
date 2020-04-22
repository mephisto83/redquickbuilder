import { uuidv4 } from '../utils/array';
import { GetNodesByProperties, GetNodeProp, GetCurrentGraph } from '../actions/uiactions';
import { NodeProperties, NodeTypes, LinkType } from '../constants/nodetypes';
import { GetNodesLinkedTo, GetLinkBetween } from '../methods/graph_methods';
import SetLinkInstanceUpdateTrue from './SetLinkInstanceUpdateTrue';
export default function(args: any = {}) {
	let { graph, viewPackage } = args;
	graph = graph || GetCurrentGraph();
	if (!viewPackage) {
		throw 'no view package';
	}

	let components = GetNodesByProperties(
		{
			[NodeProperties.ViewPackage]: viewPackage,
			[NodeProperties.NODEType]: NodeTypes.ComponentNode
		},
		graph
	);

	let result: any[] = [];

	components.map((component) => {
		let externalNodes = GetNodesLinkedTo(graph, {
			id: component.id,
			link: LinkType.ComponentExternalApi
		}).filter((x) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentExternalApi);
		externalNodes.map((externalNode) => {
			let externalConnections = GetNodesLinkedTo(graph, {
				id: externalNode.id,
				link: LinkType.ComponentExternalConnection
			});
			externalConnections.map((externalConnection) => {
				let link = GetLinkBetween(externalNode.id, externalConnection.id, graph);
				if (link)
					result.push(
						...SetLinkInstanceUpdateTrue({
							link: link.id
						})
					);
			});
		});

		let eventMethods = GetNodesLinkedTo(graph, {
			id: component.id,
			link: LinkType.EventMethod
		});
		eventMethods.map((eventMethod) => {
			let eventMethodInstances = GetNodesLinkedTo(graph, {
				id: eventMethod.id,
				link: LinkType.EventMethodInstance
			});
			eventMethodInstances.map((eventMethodInstance) => {
				let link = GetLinkBetween(eventMethod.id, eventMethodInstance.id, graph);
				if (link)
					result.push(
						...SetLinkInstanceUpdateTrue({
							link: link.id
						})
					);
			});
		});
	});

	return result;
}
