import { Graph } from './graph_methods';

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
  delete prunedGraph.visibleNodes;
  delete prunedGraph.groupsNodes;
  delete prunedGraph.nodes;
  delete prunedGraph.referenceNodes;

  return prunedGraph;
}
