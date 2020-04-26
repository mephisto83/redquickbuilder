import { Graph } from './graph_types';

export default function mergeGraph(graph1: Graph | null, graph2: Graph): Graph {
	if (!graph1) {
		return graph2;
	}

	Object.keys(graph2.nodeLib).forEach((key) => {
		if (!graph1.nodeLib[key]) {
			graph1.nodeLib[key] = graph2.nodeLib[key];
		}
	});

	Object.keys(graph2.linkLib).forEach((key) => {
		if (!graph1.linkLib[key]) {
			graph1.linkLib[key] = graph2.linkLib[key];
		}
	});

	Object.keys(graph2.groupLib).forEach((key) => {
		if (!graph1.groupLib[key]) {
			graph1.groupLib[key] = graph2.groupLib[key];
		}
	});

	graph1.version.major = graph1.version.major + graph1.version.major;
	graph1.version.minor = graph1.version.minor + graph1.version.minor;
  graph1.version.build = graph1.version.build + graph1.version.build;

  return graph1;
}
