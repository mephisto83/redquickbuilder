import { GetNodesLinkedTo } from '../methods/graph_methods';
import {
	GetCurrentGraph,
	GetNodeProp,
	GetNodeTitle,
	REMOVE_NODE,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeType
} from '../actions/uiactions';
import { NodeTypes, LinkType } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';

export function ClearApiBetweenComponents(args: { id: string; api: string }) {
	let graph = GetCurrentGraph();
	let externalApis = GetNodesLinkedTo(graph, {
		id: args.id,
		link: LinkType.ComponentExternalApi
	});
	let internalApis = GetNodesLinkedTo(graph, {
		id: args.id,
		link: LinkType.ComponentInternalApi
	});
	let result: any[] = [];
	let toremove = [];
	let tocheck = [ ...externalApis, ...internalApis ];
	let checked: any[] = [];

	while (tocheck.length) {
		let checking = tocheck.pop();
		checked.push(checking);

		if (GetNodeTitle(checking) === args.api) {
			toremove.push(checking);
		}
		let externalApis = GetNodesLinkedTo(graph, {
			id: checking.id,
			link: LinkType.ComponentExternalApi
		})
			.filter((x: Node) => checked.findIndex((v) => v.id === x.id) === -1)
			.filter(
				(x: Node) => [ NodeTypes.ComponentApi, NodeTypes.ComponentExternalApi ].indexOf(GetNodeType(x)) !== -1
			);
		let internalApis = GetNodesLinkedTo(graph, {
			id: checking.id,
			link: LinkType.ComponentInternalApi
		})
			.filter(
				(x: Node) => [ NodeTypes.ComponentApi, NodeTypes.ComponentExternalApi ].indexOf(GetNodeType(x)) !== -1
			)
			.filter((x: Node) => checked.findIndex((v) => v.id === x.id) === -1);

		let internalConnections = GetNodesLinkedTo(graph, {
			id: checking.id,
			link: LinkType.ComponentInternalConnection
		})
			.filter(
				(x: Node) => [ NodeTypes.ComponentApi, NodeTypes.ComponentExternalApi ].indexOf(GetNodeType(x)) !== -1
			)
			.filter((x: Node) => checked.findIndex((v) => v.id === x.id) === -1);
		let externalConnections = GetNodesLinkedTo(graph, {
			id: checking.id,
			link: LinkType.ComponentExternalConnection
		})
			.filter(
				(x: Node) => [ NodeTypes.ComponentApi, NodeTypes.ComponentExternalApi ].indexOf(GetNodeType(x)) !== -1
			)
			.filter((x: Node) => checked.findIndex((v) => v.id === x.id) === -1);
		tocheck.push(...externalApis, ...internalConnections, ...internalApis, ...externalConnections);
	}

	toremove.forEach((inPackageNode: Node) => {
		result.push({
			operation: REMOVE_NODE,
			options() {
				return {
					id: inPackageNode.id
				};
			}
		});
	});
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
