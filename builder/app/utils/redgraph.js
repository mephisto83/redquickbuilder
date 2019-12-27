// define a class
export default class RedGraph {

  constructor() {
    this.nodes = {};
    this.links = {};
    this.nodeParents = {};
  }

  static addNode(graph, proprerties, id) {
    graph.nodes[id] = {
      proprerties
    };
    return graph;
  }

  static addLink(graph, parent, child) {
    graph.links[parent] = graph.links[parent] || {};
    graph.links[parent] = { ...graph.links[parent], [child]: {} };
    graph.nodeParents[child] = graph.nodeParents[child] || {};
    graph.nodeParents[child] = { ...graph.nodeParents[child], [parent]: true };
    return graph;
  }

  static removeLink(graph, parent, child) {
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

  static getChildren(graph, parent) {
    let result = {};

    Object.keys(graph.links[parent]).map(key => {
      result[key] = graph.nodes[key] || null;
    });

    return result;
  }
}
