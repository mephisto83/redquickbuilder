import GetModelViewModelForList from './GetModelViewModelForList';
import { GetConnectedNodesByType, GetNodesLinkedTo } from '../methods/graph_methods';
import { GetState, GetNodeProp, GetCurrentGraph, GetNodeTitle } from '../actions/uiActions';
import { NodeTypes, NodeProperties, LinkType, ApiNodeKeys } from '../constants/nodetypes';

export default function(args: any = {}): any {
	let { screen, graph } = args;
	graph = graph || GetCurrentGraph();
	let externalNode = GetNodesLinkedTo(graph, {
		id: screen,
		link: LinkType.ComponentExternalApi
	}).find(
		(x) =>
			GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentExternalApi &&
			GetNodeTitle(x) === ApiNodeKeys.ViewModel
	);
	if (externalNode && args.model) {
		return GetModelViewModelForList({
			viewModel: externalNode.id,
			modelViewName: GetNodeTitle(args.model),
			...args
		});
	}
}
