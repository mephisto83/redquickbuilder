import { Graph, Node, GraphLink } from './graph_types';

export default function mergeGraph(graph1: Graph | null, graph2: Graph): Graph {
	if (!graph1) {
		return graph2;
	}

	Object.keys(graph2.nodeLib).forEach((key) => {
		if (!graph1.nodeLib[key]) {
			graph1.nodeLib[key] = graph2.nodeLib[key];
		} else {
			mergeProperties(graph1.nodeLib[key], graph2.nodeLib[key]);
		}
	});

	Object.keys(graph2.linkLib).forEach((key) => {
		if (!graph1.linkLib[key]) {
			graph1.linkLib[key] = graph2.linkLib[key];
		} else {
			mergeLinkProperties(graph1.linkLib[key], graph2.linkLib[key]);
		}
	});

	Object.keys(graph2.groupLib).forEach((key) => {
		if (!graph1.groupLib[key]) {
			graph1.groupLib[key] = graph2.groupLib[key];
		}
	});

	graph1.version.major = graph1.version.major + Math.abs(graph2.version.major - graph1.version.major);
	graph1.version.minor = graph1.version.minor + Math.abs(graph2.version.minor - graph1.version.minor);
	graph1.version.build = graph1.version.build + Math.abs(graph2.version.build - graph1.version.build);

	console.log(graph1.version);

	return graph1;
}

function mergeProperties(node1: Node, node2: Node) {
	let keys = [ ...Object.keys(node1.properties), ...Object.keys(node2.properties) ].unique();
	keys.forEach((key: string) => {
		let node1PropVersion = 0;
		let node2PropVersion = 0;
		if (node1.propertyVersions && node1.propertyVersions[key]) {
			node1PropVersion = node1.propertyVersions[key];
		}
		if (node2.propertyVersions && node2.propertyVersions[key]) {
			node2PropVersion = node2.propertyVersions[key];
		}
		if (node1PropVersion < node2PropVersion) {
			node1.properties[key] = node2.properties[key];
			node1.propertyVersions = node1.propertyVersions || {};
			node2.propertyVersions = node2.propertyVersions || {};
			node1.propertyVersions[key] = node2.propertyVersions[key];
		}
	});
}


function mergeLinkProperties(node1: GraphLink, node2: GraphLink) {
	let keys = [ ...Object.keys(node1.properties), ...Object.keys(node2.properties) ].unique();
	keys.forEach((key: string) => {
		let node1PropVersion = 0;
		let node2PropVersion = 0;
		if (node1.propertyVersions && node1.propertyVersions[key]) {
			node1PropVersion = node1.propertyVersions[key];
		}
		if (node2.propertyVersions && node2.propertyVersions[key]) {
			node2PropVersion = node2.propertyVersions[key];
		}
		if (node1PropVersion < node2PropVersion) {
			node1.properties[key] = node2.properties[key];
			node1.propertyVersions = node1.propertyVersions || {};
			node2.propertyVersions = node2.propertyVersions || {};
			node1.propertyVersions[key] = node2.propertyVersions[key];
		}
	});
}
