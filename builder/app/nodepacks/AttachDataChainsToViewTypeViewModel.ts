import { uuidv4 } from '../utils/array';
import { NodeProperties, LinkType, NodeTypes, LinkProperties } from '../constants/nodetypes';
import {
	GetNodeProp,
	GetComponentExternalApiNode,
	GetNodeTitle,
	GetCurrentGraph,
	ADD_LINK_BETWEEN_NODES
} from '../actions/uiactions';
import { GetNodesLinkedTo, GetNodeLinkedTo } from '../methods/graph_methods';
import CreateSetViewModelDataChain from './CreateSetViewModelDataChain';
import { ComponentApiTypes } from '../constants/componenttypes';
let func: any = function(args: any = {}) {
	// node0,node1
	//
	if (!args.viewType) {
		throw 'missing viewType';
	}
	let graph = GetCurrentGraph();
	let { viewType } = args;
	let viewModelNode = GetComponentExternalApiNode(ComponentApiTypes.ViewModel, viewType);
	let property = GetNodesLinkedTo(graph, {
		id: viewType,
		link: LinkType.DefaultViewType
	}).find((x: any) => [ NodeTypes.Property ].some((v) => v === GetNodeProp(x, NodeProperties.NODEType)));
	let model = GetNodesLinkedTo(graph, {
		id: viewType,
		link: LinkType.DefaultViewType
	}).find((x: any) => [ NodeTypes.Model ].some((v) => v === GetNodeProp(x, NodeProperties.NODEType)));

	if (property) {
		model =
			GetNodeLinkedTo(graph, {
				id: property.id,
				link: LinkType.ModelTypeLink
			}) || model;
	}

	let result = [];
	if (viewModelNode) {
		let dataChains = GetNodesLinkedTo(graph, {
			id: viewModelNode.id,
			link: LinkType.DataChainLink
		});
		if (!dataChains.length) {
			let _context: any = null;
			result.push(
				...CreateSetViewModelDataChain({
					model: GetNodeTitle(model),
					modelId: model.id,
					callback: (node: any) => {
						_context = node;
					}
				}),
				{
					operation: ADD_LINK_BETWEEN_NODES,
					options: function() {
						return {
							source: viewModelNode.id,
							target: _context.entry,
							properties: { ...LinkProperties.DataChainLink }
						};
					}
				}
			);
		}
	}
	return result;
};
func.description =
	'Appends a data chain to a view type component, which will default the view Model to the type of model that the component expects';
export default func;
