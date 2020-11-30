import {
	AddLinkBetweenNodes,
	GetComponentExternalApiNode,
	GetCurrentGraph,
	GetDispatchFunc,
	GetNodeByProperties,
	GetStateFunc,
	graphOperation
} from '../../actions/uiActions';
import { LinkProperties, NodeProperties, NodeTypes } from '../../constants/nodetypes';
import { NodesByType } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
import { SetupApiComponent } from '../SetupApiBetweenComponents';

export default function AttachTitleService() {
	let graph = GetCurrentGraph();
	let nodes: Node[] = NodesByType(graph, NodeTypes.ComponentNode);

	let titleService: Node = GetNodeByProperties(
		{
			[NodeProperties.NODEType]: NodeTypes.TitleService
		},
		graph
	);

	nodes.forEach((node: Node) => {
		let externalApiNode = GetComponentExternalApiNode('label', node.id, graph);
		if (!externalApiNode) {
			let externals: string[] = [];
			graphOperation(
				[ 'label' ].map((v: string) => {
					return SetupApiComponent(
						{
							component_a: {
								external: v,
								id: node.id,
								internal: v
							}
						},
						(res: { external: string[] }) => {
							externals = res.external;
						}
					);
				})
			)(GetDispatchFunc(), GetStateFunc());
			externals.forEach((ext: string) => {
				graphOperation(AddLinkBetweenNodes(ext, titleService.id, { ...LinkProperties.TitleServiceLink }))(
					GetDispatchFunc(),
					GetStateFunc()
				);
			});
		}
	});
}
