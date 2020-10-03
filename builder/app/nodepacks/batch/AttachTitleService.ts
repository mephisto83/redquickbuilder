import {
	AddLinkBetweenNodes,
	GetCurrentGraph,
  GetDispatchFunc,
	GetNodeByProperties,
	GetStateFunc,
	graphOperation
} from '../../actions/uiactions';
import { LinkProperties, NodeProperties, NodeTypes } from '../../constants/nodetypes';
import { NodesByType } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';

export default function AttachTitleService() {
	let graph = GetCurrentGraph();
	let nodes: Node[] = NodesByType(graph, NodeTypes.ComponentNode);

	let titleService = GetNodeByProperties(
		{
			[NodeProperties.NODEType]: NodeTypes.TitleService
		},
		graph
	);

	nodes.forEach((node: Node) => {
		graphOperation(AddLinkBetweenNodes(node.id, titleService, { ...LinkProperties.TitleServiceLink }))(
			GetDispatchFunc(),
			GetStateFunc()
		);
	});
}
