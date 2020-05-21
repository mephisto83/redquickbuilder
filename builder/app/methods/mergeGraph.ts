import { Graph, Node, GraphLink, Version, Group } from './graph_types';
import JobService, { Job, path_join } from '../jobs/jobservice';
import { StreamGraph, LINK_LIB, NODE_LIB, GROUP_LIB, GRAPH_LIB } from './storeGraph';

export async function mergeStreamGraph(
	mergedGraph: Graph,
	jobPath: string,
	outputFileName: string,
	job: Job
): Promise<Graph> {
	let temp: Graph = mergedGraph;
	let startVersion: Version = {
		major: temp ? temp.version.major : 0,
		minor: temp ? temp.version.minor : 0,
		build: temp ? temp.version.build : 0
	};

	await job.parts.forEachAsync(async (part: string) => {
		let relPath: string = path_join(jobPath, job.name, part);
		let fileDetails = await JobService.GetJobOutput(relPath, outputFileName);
		await StreamGraph(relPath, fileDetails.files, (key: string, obj: any, type: string) => {
			switch (type) {
				case LINK_LIB:
					mergeLinkInGraph(mergedGraph, obj, key);
					break;
				case NODE_LIB:
					mergeNodeInGraph(mergedGraph, obj, key);
					break;
				case GROUP_LIB:
					mergeGroupInGraph(mergedGraph, obj, key);
					break;
				case GRAPH_LIB:
					mergedGraph.version.major =
						mergedGraph.version.major + Math.abs(obj.version.major - startVersion.major);
					mergedGraph.version.minor =
						mergedGraph.version.minor + Math.abs(obj.version.minor - startVersion.minor);
					mergedGraph.version.build =
						mergedGraph.version.build + Math.abs(obj.version.build - startVersion.build);
					break;
			}
		});
	});

	return mergedGraph;
}

export function mergeNodeInGraph(graph: Graph, node: Node, key: string) {
	if (!graph.nodeLib[key]) {
		graph.nodeLib[key] = node;
	} else {
		mergeProperties(graph.nodeLib[key], node);
	}
}

export function mergeLinkInGraph(graph: Graph, link: GraphLink, key: string) {
	if (!graph.linkLib[key]) {
		graph.linkLib[key] = link;
	} else {
		mergeLinkProperties(graph.linkLib[key], link);
	}
}
export function mergeGroupInGraph(graph: Graph, group: Group, key: string) {
	if (!graph.groupLib[key]) {
		graph.groupLib[key] = group;
	}
}

export default function mergeGraph(graph1: Graph | null, graph2: Graph, startVersion: Version): Graph {
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

	graph1.version.major = graph1.version.major + Math.abs(graph2.version.major - startVersion.major);
	graph1.version.minor = graph1.version.minor + Math.abs(graph2.version.minor - startVersion.minor);
	graph1.version.build = graph1.version.build + Math.abs(graph2.version.build - startVersion.build);

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
