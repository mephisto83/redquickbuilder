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
} from "../actions/uiActions";
import {
  GetLinkBetween,
  GetNodesLinkedTo,
  SOURCE
} from "../methods/graph_methods";
export default function(args : any= {}) {
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
    (x: any, y: any) => {
      return GetCodeName(x) === GetCodeName(y);
    }
  );
  result.push(
    ...tocreate
      .map((internalApi: { id: any; }) => {
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
  let previousLinked : any= {};
  exteranlApiNodes.map((externalApiNode: { id: any; }) => {
    let internalApiComponents = GetNodesLinkedTo(graph, {
      id: externalApiNode.id,
      link: LinkType.ComponentExternalConnection,
      direction: SOURCE
    });
    internalApiComponents.map((internalApiComponent: { id: any; }) => {
      let isThereAConnection = parentInternalApis.find((parentInternalApi: { id: any; }) =>
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
  result.push(function(graph: any) {
    let res: { operation: string; options: { target: any; source: any; properties: any; }; }[] = [];
    baseInternalApisNodes = GetNodesLinkedTo(graph, {
      id: context.base,
      link: LinkType.ComponentInternalApi
    });
    for (var i in previousLinked) {
      let baseInternalApiNode = baseInternalApisNodes.find(
        (        v: any) => GetNodeTitle(v) === i
      );
      if (baseInternalApiNode) {
        previousLinked[i].map((pl: { id: any; properties: any; }) => {
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
