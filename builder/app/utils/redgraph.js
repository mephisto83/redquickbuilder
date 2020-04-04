// define a class
export default class RedGraph {
  constructor() {
    this.nodes = {};
    this.links = {};
    this.nodeParents = {};
  }

  static create() {
    return new RedGraph();
  }

  static addNode(graph, properties, id) {
    graph.nodes[id || properties.id] = {
      properties,
      id: id || properties.id
    };
    if (properties.parent) {
      RedGraph.addLink(graph, properties.parent, id || properties.id);
    }
    return graph;
  }

  static getTitle(graph, id) {
    const node = RedGraph.getNode(graph, id);
    if (node) {
      return node.properties.title;
    }
    return false;
  }

  static getId(node) {
    if (node) {
      return node.properties.id;
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
    graph.nodeParents[child] = { [parent]: true };
    return graph;
  }

  static getParent(graph, child) {
    if (graph && graph.nodeParents && graph.nodeParents[child]) {
      return Object.keys(graph.nodeParents[child])[0];
    }
    return false;
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
    const result = {};
    if (graph && graph.links && graph.links[parent]) {
      Object.keys(graph.links[parent]).map(key => {
        result[key] = graph.nodes[key] || null;
      });
    }
    else if (graph && graph.links && !parent) {
      return Object.keys(graph.nodes).filter(x => [null, undefined].some(v => v === graph.nodeParents[x])).map(v => graph.nodes[v]);
    }
    return Object.values(result);
  }
}
