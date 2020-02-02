import { uuidv4 } from "../utils/array";
import {
  LinkProperties,
  NodeProperties,
  LinkType
} from "../constants/nodetypes";
import {
  REMOVE_LINK_BETWEEN_NODES,
  ADD_LINK_BETWEEN_NODES,
  GetCurrentGraph,
  GetNodeTitle,
  GetCodeName,
  $addComponentApiNodes
} from "../actions/uiactions";
import {
  GetLinkBetween,
  GetNodesLinkedTo,
  SOURCE
} from "../methods/graph_methods";
export default function(args = {}) {
  // node0
  let result = [];
  //
  if (!args.component) {
    throw "missing component";
  }
  if (!args.base) {
    throw "missing base";
  }
  if (!args.parent) {
    throw "missing parent";
  }
  let context = {
    ...args
  };

  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let graph = GetCurrentGraph();

  let component_parent_link = GetLinkBetween(
    context.parent,
    context.component,
    graph
  );

  result.push({
    operation: REMOVE_LINK_BETWEEN_NODES,
    options: {
      source: context.parent,
      target: context.component
    }
  });

  result.push({
    operation: ADD_LINK_BETWEEN_NODES,
    options: {
      target: args.component,
      source: args.base,
      properties: {
        ...component_parent_link.properties
      }
    }
  });
  let baseInternalApisNodes = GetNodesLinkedTo(graph, {
    id: context.base,
    link: LinkType.ComponentInternalApi
  });
  let parentInternalApis = GetNodesLinkedTo(graph, {
    id: context.parent,
    link: LinkType.ComponentInternalApi
  });
  let tocreate = parentInternalApis.relativeCompliment(
    baseInternalApisNodes,
    (x, y) => {
      return GetCodeName(x) === GetCodeName(y);
    }
  );
  result.push(
    ...tocreate
      .map(internalApi => {
        return $addComponentApiNodes(
          context.base,
          GetNodeTitle(internalApi),
          internalApi.id
        );
      })
      .flatten()
  );
  let exteranlApiNodes = GetNodesLinkedTo(graph, {
    id: context.component,
    link: LinkType.ComponentExternalApi,
    direction: SOURCE
  });
  let previousLinked = {};
  exteranlApiNodes.map(externalApiNode => {
    let internalApiComponents = GetNodesLinkedTo(graph, {
      id: externalApiNode.id,
      link: LinkType.ComponentExternalConnection,
      direction: SOURCE
    });
    internalApiComponents.map(internalApiComponent => {
      let isThereAConnection = parentInternalApis.find(parentInternalApi =>
        GetLinkBetween(externalApiNode.id, parentInternalApi.id, graph)
      );
      previousLinked[GetNodeTitle(externalApiNode)] =
        previousLinked[GetNodeTitle(externalApiNode)] || [];

      if (isThereAConnection) {
        previousLinked[GetNodeTitle(externalApiNode)].push({
          id: externalApiNode.id,
          properties: isThereAConnection.properties
        });
      }
      result.push({
        operation: REMOVE_LINK_BETWEEN_NODES,
        options: {
          source: externalApiNode.id,
          target: internalApiComponent.id
        }
      });
    });
  });
  result.push(function(graph) {
    let res = [];
    baseInternalApisNodes = GetNodesLinkedTo(graph, {
      id: context.base,
      link: LinkType.ComponentInternalApi
    });
    for (var i in previousLinked) {
      let baseInternalApiNode = baseInternalApisNodes.find(
        v => GetNodeTitle(v) === i.id
      );
      if (baseInternalApiNode) {
        previousLinked[i].map(pl => {
          res.push({
            operation: ADD_LINK_BETWEEN_NODES,
            options: {
              target: baseInternalApiNode.id,
              source: pl.id,
              properties: { ...pl.properties }
            }
          });
        });
      }
    }
    return res;
  });
  return result;
}
