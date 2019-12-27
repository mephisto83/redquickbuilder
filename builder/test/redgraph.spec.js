import fs from "fs";
import RedGraph from "../app/utils/redgraph";

describe("data_chain_example", () => {
  it("should creat redgraph", () => {
    let result = new RedGraph();
    expect(result).toBeTruthy();
  });

  it("should add a node", () => {
    var graph = new RedGraph();

    graph = RedGraph.addNode(graph, {}, 1);
    expect(graph.nodes[1]).toBeTruthy();
  });

  it("should add a link", () => {
    var graph = new RedGraph();

    graph = RedGraph.addNode(graph, {}, 1);
    graph = RedGraph.addNode(graph, {}, 2);
    graph = RedGraph.addLink(graph, 1, 2);
    expect(graph.nodes[1]).toBeTruthy();
    expect(graph.links[1]).toBeTruthy();
    expect(graph.nodeParents[2]).toBeTruthy();
    expect(RedGraph.getChildren(graph, 1)).toBeTruthy();
    expect(Object.keys(RedGraph.getChildren(graph, 1)).length).toBeTruthy();
  });
});
