import { Graph } from "./graph_types";

export default function prune(graph: Graph) {
	let prunedGraph = {
		...graph
	};
  delete prunedGraph.nodeConnections;
  delete prunedGraph.nodeLinkIds;
  delete prunedGraph.nodesGroups;
  delete prunedGraph.childGroups;
  delete prunedGraph.classNodes;
  delete prunedGraph.functionNodes;
  delete prunedGraph.nodeLinks;
  delete prunedGraph.links;
  delete prunedGraph.visibleNodes;
  delete prunedGraph.groupsNodes;
  delete prunedGraph.nodes;
  delete prunedGraph.referenceNodes;

  return prunedGraph;
}
