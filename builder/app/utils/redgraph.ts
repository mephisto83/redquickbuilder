// define a class
export default class RedGraph {
	nodes: {};
	links: {};
	nodeParents: {};

	constructor() {
		this.nodes = {};
		this.links = {};
		this.nodeParents = {};
	}

	static create() {
		return new RedGraph();
	}

	static addNode(graph: any, properties: any, id: any) {
		graph.nodes[id || properties.id] = {
			properties,
			id: id || properties.id
		};
		if (properties.parent) {
			RedGraph.addLink(graph, properties.parent, id || properties.id);
		}
		return graph;
	}

	static getTitle(graph: any, id: any) {
		const node = RedGraph.getNode(graph, id);
		if (node) {
			return node.properties.title;
		}
		return false;
	}

	static getId(node: any) {
		if (node) {
			return node.properties.id;
		}
		return false;
	}

	static getNode(graph: any, id: any) {
		if (graph && graph.nodes) {
			return graph.nodes[id];
		}
		return null;
	}

	static addLink(graph: any, parent: any, child: any) {
		graph.links[parent] = graph.links[parent] || {};
		graph.links[parent] = { ...graph.links[parent], [child]: {} };
		graph.nodeParents[child] = { [parent]: true };
		return graph;
	}

	static getParent(graph: any, child: any) {
		if (graph && graph.nodeParents && graph.nodeParents[child]) {
			return Object.keys(graph.nodeParents[child])[0];
		}
		return false;
	}

	static removeLink(graph: any, parent: any, child: any) {
		if (graph.links[parent]) {
			delete graph.links[parent][child];
		}
		if (!graph.links[parent]) {
			delete graph.links[parent];
		}
		if (graph.links[child]) {
			delete graph.links[child][parent];
		}
		if (!graph.links[child]) {
			delete graph.links[child];
		}
		return graph;
	}

	static getChildren(graph: any, parent: any) {
		const result: { [index: string]: any } = {};
		if (graph && graph.links && graph.links[parent]) {
			Object.keys(graph.links[parent]).map((key) => {
				result[key] = graph.nodes[key] || null;
			});
		} else if (graph && graph.links && !parent) {
			return Object.keys(graph.nodes)
				.filter((x) => [ null, undefined ].some((v) => v === graph.nodeParents[x]))
				.map((v) => graph.nodes[v]);
		}
		return Object.values(result);
	}
}
