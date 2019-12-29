// define a class
export default class RedGraph {
  constructor() {
    this.nodes = {};
    this.links = {};
    this.nodeParents = {};
  }

  static addNode(graph, properties, id) {
    graph.nodes[id] = {
      properties,
      id: id
    };
    return graph;
  }
  static getTitle(graph, id) {
    let node = RedGraph.getNode(graph, id);
    if (node) {
      return node.properties["title"];
    }
    return false;
  }
  static getId(node) {
    if (node) {
      return node.properties["id"];
    }
    return false;
  }
  static getNode(graph, id) {
    if (graph && graph.nodes) {
      return graph.nodes[id];
    }
    return null;
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
    if (graph && graph.links && graph.links[parent]) {
      Object.keys(graph.links[parent]).map(key => {
        result[key] = graph.nodes[key] || null;
      });
    }
    return Object.values(result);
  }
}
