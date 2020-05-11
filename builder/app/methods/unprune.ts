import { SOURCE, TARGET } from './graph_methods';
import { Graph } from './graph_types';

export default function unprune(graph: Graph): Graph {
	addNodeConnections(graph);
	addLinks(graph);
	addNodeLinks(graph);
	addNodeLinkIds(graph);

	addNodes(graph);
	addGroups(graph);
	addGroupNodes(graph);
	addChildGroups(graph);
	return graph;
}
function addChildGroups(graph: Graph) {
	graph.childGroups = {};
	Object.keys(graph.parentGroup).forEach((pg) => {
		const parentGroup = graph.parentGroup[pg];
		Object.keys(parentGroup).forEach((childId) => {
			if (parentGroup && parentGroup[childId]) {
				graph.childGroups[childId] = graph.childGroups[childId] || {};
				graph.childGroups[childId][pg] = true;
			}
		});
	});
}
function addGroupNodes(graph: Graph) {
	graph.groupsNodes = {};
	graph.nodesGroups = {};
	Object.keys(graph.groupLib).forEach((id) => {
		const leaves = graph.groupLib[id].leaves || [];
		graph.groupsNodes[id] = graph.groupsNodes[id] || {};
		leaves.forEach((leaf) => {
			graph.groupsNodes[id][leaf] = true;
		});

		leaves.forEach((leaf) => {
			graph.nodesGroups[leaf] = graph.nodesGroups[leaf] || {};
			graph.nodesGroups[leaf][id] = true;
		});
	});
}
function addGroups(graph: Graph) {
	graph.groups = [];
	Object.keys(graph.groupLib).forEach((groupId) => {
		graph.groups.push(groupId);
	});
}
function addNodes(graph: Graph) {
	graph.nodes = [];
	Object.keys(graph.nodeLib).forEach((nodeId) => {
		graph.nodes.push(nodeId);
	});
}
function addNodeLinkIds(graph: Graph) {
	graph.nodeLinkIds = {};
	Object.keys(graph.linkLib).forEach((linkId) => {
		const link = graph.linkLib[linkId];
		if (!graph.nodeLinkIds[link.source]) {
			graph.nodeLinkIds[link.source] = {};
		}
		graph.nodeLinkIds[link.source][link.target] = link.id;
	});
}
function addNodeLinks(graph: Graph) {
	graph.nodeLinks = {};
	Object.keys(graph.linkLib).forEach((linkId) => {
		const link = graph.linkLib[linkId];
		if (!graph.nodeLinks[link.source]) {
			graph.nodeLinks[link.source] = {};
		}
		graph.nodeLinks[link.source][link.target] = graph.nodeLinks[link.source]
			? (graph.nodeLinks[link.source][link.target] || 0) + 1
			: 1;
	});
}
function addLinks(graph: Graph) {
	graph.links = [];
	Object.keys(graph.linkLib).forEach((linkId) => {
		graph.links.push(linkId);
	});
}
function addNodeConnections(graph: Graph) {
	graph.nodeConnections = {};
	Object.keys(graph.linkLib).forEach((linkId) => {
		const link = graph.linkLib[linkId];
		if (!graph.nodeConnections[link.source]) {
			graph.nodeConnections[link.source] = {};
		}
		graph.nodeConnections[link.source][link.id] = SOURCE;

		if (!graph.nodeConnections[link.target]) {
			graph.nodeConnections[link.target] = {};
		}
		graph.nodeConnections[link.target][link.id] = TARGET;
	});
}
