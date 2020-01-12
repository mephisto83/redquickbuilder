import { uuidv4 } from "../utils/array";
import {
  GetNodesByProperties,
  GetNodeProp,
  GetCurrentGraph
} from "../actions/uiactions";
import { NodeProperties, NodeTypes, LinkType } from "../constants/nodetypes";
import { GetNodesLinkedTo, GetLinkBetween } from "../methods/graph_methods";
import SetLinkInstanceUpdateTrue from "./SetLinkInstanceUpdateTrue";
export default function(args = {}) {
  let { graph, viewPackage } = args;
  graph = graph || GetCurrentGraph();
  if (!viewPackage) {
    throw "no view package";
  }
  debugger;
  let components = GetNodesByProperties(
    {
      [NodeProperties.ViewPackage]: viewPackage,
      [NodeProperties.NODEType]: NodeTypes.ComponentNode
    },
    graph
  );

  let result = [];

  components.map(component => {
    let externalNodes = GetNodesLinkedTo(graph, {
      id: component.id,
      link: LinkType.ComponentExternalApi
    }).filter(
      x =>
        GetNodeProp(x, NodeProperties.NODEType) ===
        NodeTypes.ComponentExternalApi
    );
    externalNodes.map(externalNode => {
      let externalConnections = GetNodesLinkedTo(graph, {
        id: externalNode.id,
        link: LinkType.ComponentExternalConnection
      });
      externalConnections.map(externalConnection => {
        let link = GetLinkBetween(
          externalNode.id,
          externalConnection.id,
          graph
        );
        if (link)
          result.push(
            ...SetLinkInstanceUpdateTrue({
              link: link.id
            })
          );
      });
    });
  });

  return result;
}
